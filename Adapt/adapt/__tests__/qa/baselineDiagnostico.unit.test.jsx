/**
 * @jest-environment jsdom
 *
 * TESTES UNITARIOS - diagnostico das 5 falhas da suite pre-existente (DEF-01 a DEF-05).
 * Objetivo: provar a causa de cada falha do baseline, isolando a unidade envolvida.
 * Nenhuma rede e nenhuma credencial: Parse e servicos sao substituidos por mocks.
 */
import { render, screen } from "@testing-library/react";
import { uploadFile } from "../../app/back4app/provas/uploadFile";
import SalvasPage from "../../app/dashboard/salvas/page";

const mockFileSave = jest.fn();
const mockProvaSave = jest.fn();

jest.mock("../../app/back4app/parseConfig", () => ({
  __esModule: true,
  default: {
    File: function () {
      this.save = mockFileSave;
    },
    Object: {
      extend: jest.fn(() =>
        function () {
          this.set = jest.fn();
          this.save = mockProvaSave;
        }
      ),
    },
    User: { current: jest.fn(() => ({ id: "u1" })) },
  },
}));

jest.mock("../../app/back4app/provas/getProvasUser", () => ({
  getProvasUser: jest.fn(),
}));

jest.mock("../../app/back4app/provas/deleteProvas", () => ({
  deleteProva: jest.fn(),
}));

const { getProvasUser } = require("../../app/back4app/provas/getProvasUser");

beforeEach(() => {
  jest.clearAllMocks();
  global.alert = jest.fn();
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("Diagnostico DEF-01 a DEF-04 (UploadPage.download.test.jsx)", () => {
  test("CT-U21: uploadFile falha quando save() devolve true, como no mock dos autores", async () => {
    // O teste dos autores usa o mesmo mockSave (resolve true) para Parse.File e para a prova
    mockFileSave.mockResolvedValue(true);

    await expect(uploadFile({ name: "arquivo.pdf" })).rejects.toThrow(
      "savedFile.url is not a function"
    );
    expect(global.alert).toHaveBeenCalledWith("Erro: savedFile.url is not a function");
  });

  test("CT-U22: uploadFile funciona quando save() devolve o proprio arquivo (comportamento real do Parse)", async () => {
    mockFileSave.mockResolvedValue({ url: () => "https://fake/arquivo.pdf" });
    mockProvaSave.mockResolvedValue({ id: "prova1" });

    await expect(uploadFile({ name: "arquivo.pdf" })).resolves.toBe("prova1");
    expect(global.alert).not.toHaveBeenCalled();
  });
});

describe("Diagnostico DEF-05 (SalvasPage.test.jsx)", () => {
  test("CT-U23: prova sem arquivoAdaptadoUrl (igual ao mock dos autores) nao aparece na lista", async () => {
    getProvasUser.mockResolvedValue([
      { id: "1", titulo: "Prova Teste", criadoEm: new Date("2025-01-01"), arquivoUrl: "https://fake/prova.pdf" },
    ]);

    render(<SalvasPage />);

    expect(await screen.findByText("Você ainda não possui provas salvas.")).toBeInTheDocument();
    expect(screen.queryByText("Prova Teste")).not.toBeInTheDocument();
  });

  test("CT-U24: prova com arquivoAdaptadoUrl aparece na lista", async () => {
    getProvasUser.mockResolvedValue([
      {
        id: "1",
        titulo: "Prova Teste",
        criadoEm: new Date("2025-01-01"),
        arquivoUrl: "https://fake/prova.pdf",
        arquivoAdaptadoUrl: "https://fake/prova_adaptada.pdf",
      },
    ]);

    render(<SalvasPage />);

    // O titulo aparece no resumo ("ultima prova") e no card, por isso findAllByText
    const titulos = await screen.findAllByText("Prova Teste");
    expect(titulos.length).toBeGreaterThan(0);
    expect(screen.queryByText("Você ainda não possui provas salvas.")).not.toBeInTheDocument();
  });
});
