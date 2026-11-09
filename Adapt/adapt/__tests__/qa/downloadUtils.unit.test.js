/**
 * TESTES UNITARIOS - app/dashboard/upload/downloadUtils.js (gerarPDFAdaptado)
 */
import { gerarPDFAdaptado } from "../../app/dashboard/upload/downloadUtils";

const mockQueryGet = jest.fn();
const mockFileSave = jest.fn();

jest.mock("../../app/back4app/parseConfig", () => ({
  __esModule: true,
  default: {
    Object: { extend: jest.fn(() => function () {}) },
    Query: function () {
      this.get = mockQueryGet;
    },
    File: function (name) {
      this.name = name;
      this.save = mockFileSave;
      this.url = () => `https://fake/${name}`;
    },
  },
}));

function makeProva(url = "https://fake/original.pdf") {
  return {
    get: jest.fn((k) => (k === "arquivoOriginalUrl" ? url : undefined)),
    set: jest.fn(),
    save: jest.fn().mockResolvedValue(true),
  };
}

describe("gerarPDFAdaptado (unitario)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFileSave.mockResolvedValue(true);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["pdf"], { type: "application/pdf" })),
    });
  });

  test("CT-U04 lanca erro quando nao ha provaId", async () => {
    await expect(
      gerarPDFAdaptado({ provaId: "", adaptedData: { adaptedQuestions: ["Q1"] } })
    ).rejects.toThrow("Nenhuma adaptação gerada ainda.");
  });

  test("CT-U04b lanca erro quando nao ha adaptedData", async () => {
    await expect(gerarPDFAdaptado({ provaId: "p1" })).rejects.toThrow(
      "Nenhuma adaptação gerada ainda."
    );
  });

  test("CT-U05 lanca erro quando a prova nao tem URL do arquivo original", async () => {
    mockQueryGet.mockResolvedValue(makeProva(null));
    await expect(
      gerarPDFAdaptado({ provaId: "p1", adaptedData: { adaptedQuestions: ["Q1"] } })
    ).rejects.toThrow("URL do arquivo original não encontrada.");
  });

  test("CT-U06 lanca erro quando a lista de questoes adaptadas esta vazia", async () => {
    mockQueryGet.mockResolvedValue(makeProva());
    await expect(
      gerarPDFAdaptado({ provaId: "p1", adaptedData: { adaptedQuestions: [] } })
    ).rejects.toThrow("Nenhuma questão adaptada encontrada para o PDF.");
  });

  test("CT-U10 usa o formato alternativo questoes[].adaptada quando nao ha adaptedQuestions", async () => {
    mockQueryGet.mockResolvedValue(makeProva());
    await gerarPDFAdaptado({
      provaId: "p1",
      adaptedData: { questoes: [{ adaptada: "A" }, { adaptada: "B" }] },
    });
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.adaptedQuestions).toEqual(["A", "B"]);
    expect(body.originalUrl).toBe("https://fake/original.pdf");
  });

  test("CT-U11 lanca 'Erro ao gerar PDF.' quando a API responde com falha", async () => {
    mockQueryGet.mockResolvedValue(makeProva());
    global.fetch.mockResolvedValue({ ok: false });
    await expect(
      gerarPDFAdaptado({ provaId: "p1", adaptedData: { adaptedQuestions: ["Q1"] } })
    ).rejects.toThrow("Erro ao gerar PDF.");
  });

  test("CT-U12 nomeia o arquivo com base no arquivo selecionado", async () => {
    mockQueryGet.mockResolvedValue(makeProva());
    const { safeName } = await gerarPDFAdaptado({
      provaId: "p1",
      adaptedData: { adaptedQuestions: ["Q1"] },
      selectedFile: { name: "Prova Final.pdf" },
    });
    expect(safeName).toBe("Prova Final_adaptada.pdf");
  });

  // SUSPEITA DE DEFEITO: sem selectedFile o nome padrao "prova_adaptada.pdf" recebe o sufixo
  // "_adaptada" de novo. Se este teste FALHAR, registre como defeito (DEF) no relatorio.
  test("CT-U13 nome padrao (sem arquivo selecionado) deveria ser 'prova_adaptada.pdf'", async () => {
    mockQueryGet.mockResolvedValue(makeProva());
    const { safeName } = await gerarPDFAdaptado({
      provaId: "p1",
      adaptedData: { adaptedQuestions: ["Q1"] },
    });
    expect(safeName).toBe("prova_adaptada.pdf");
  });
});
