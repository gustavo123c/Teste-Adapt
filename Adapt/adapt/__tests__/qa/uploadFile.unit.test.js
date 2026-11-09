/**
 * TESTES UNITARIOS - app/back4app/provas/uploadFile.js
 * O SDK Parse e totalmente substituido por mocks (nenhuma rede, nenhuma credencial).
 */
import { uploadFile } from "../../app/back4app/provas/uploadFile";

const mockFileCtor = jest.fn();
const mockFileSave = jest.fn();
const mockProvaSet = jest.fn();
const mockProvaSave = jest.fn();

jest.mock("../../app/back4app/parseConfig", () => ({
  __esModule: true,
  default: {
    File: function (name, data) {
      mockFileCtor(name, data);
      this.save = mockFileSave;
    },
    Object: {
      extend: jest.fn(() =>
        function () {
          this.set = mockProvaSet;
          this.save = mockProvaSave;
        }
      ),
    },
    User: { current: jest.fn(() => ({ id: "u1" })) },
  },
}));

describe("uploadFile (unitario)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFileSave.mockResolvedValue({ url: () => "https://fake/arquivo.pdf" });
    mockProvaSave.mockResolvedValue({ id: "prova123" });
    global.alert = jest.fn();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  test("CT-U01 remove acentos e troca espacos por underscore no nome", async () => {
    await uploadFile(new File(["x"], "Prova Ciência 1.pdf"));
    expect(mockFileCtor).toHaveBeenCalledWith("Prova_Ciencia_1.pdf", expect.anything());
  });

  test("CT-U02 troca caracteres especiais por underscore e preserva a extensao", async () => {
    await uploadFile(new File(["x"], "a@b#c.pdf"));
    expect(mockFileCtor).toHaveBeenCalledWith("a_b_c.pdf", expect.anything());
  });

  test("CT-U03 propaga o erro e exibe alert quando o save do arquivo falha", async () => {
    mockFileSave.mockRejectedValue(new Error("falha de rede"));
    await expect(uploadFile(new File(["x"], "prova.pdf"))).rejects.toThrow("falha de rede");
    expect(global.alert).toHaveBeenCalledWith("Erro: falha de rede");
  });

  test("CT-U09 retorna o id da prova criada e grava titulo e url original", async () => {
    const id = await uploadFile(new File(["x"], "relatório final.pdf"));
    expect(id).toBe("prova123");
    expect(mockProvaSet).toHaveBeenCalledWith("titulo", "relatorio_final.pdf");
    expect(mockProvaSet).toHaveBeenCalledWith("arquivoOriginalUrl", "https://fake/arquivo.pdf");
  });
});
