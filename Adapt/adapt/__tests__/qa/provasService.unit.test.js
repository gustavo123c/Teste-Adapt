/**
 * TESTES UNITARIOS - app/back4app/provas/getProvasUser.js e deleteProvas.js
 */
import { getProvasUser } from "../../app/back4app/provas/getProvasUser";
import { deleteProva } from "../../app/back4app/provas/deleteProvas";

const mockUserCurrent = jest.fn();
const mockQueryGet = jest.fn();
const mockFind = jest.fn();
const mockEqualTo = jest.fn();
const mockExists = jest.fn();
const mockLimit = jest.fn();
const mockDescending = jest.fn();

jest.mock("../../app/back4app/parseConfig", () => ({
  __esModule: true,
  default: {
    Object: { extend: jest.fn(() => function () {}) },
    User: { current: (...a) => mockUserCurrent(...a) },
    Query: function () {
      this.get = (...a) => mockQueryGet(...a);
      this.find = (...a) => mockFind(...a);
      this.equalTo = (...a) => mockEqualTo(...a);
      this.exists = (...a) => mockExists(...a);
      this.limit = (...a) => mockLimit(...a);
      this.descending = (...a) => mockDescending(...a);
    },
  },
}));

describe("getProvasUser (unitario)", () => {
  beforeEach(() => jest.clearAllMocks());

  test("CT-U07 lanca erro quando nao ha usuario autenticado", async () => {
    mockUserCurrent.mockReturnValue(null);
    await expect(getProvasUser()).rejects.toThrow("Usuário não autenticado.");
  });

  test("CT-U14 filtra por usuario e mapeia os campos retornados", async () => {
    const user = { id: "u1" };
    mockUserCurrent.mockReturnValue(user);
    mockFind.mockResolvedValue([
      {
        id: "p1",
        createdAt: new Date("2026-01-01"),
        get: (k) =>
          ({
            titulo: "Prova 1",
            arquivoAdaptado: { url: () => "https://fake/adaptada.pdf" },
            arquivoOriginal: { url: () => "https://fake/original.pdf" },
          })[k],
      },
      { id: "p2", createdAt: new Date("2026-01-02"), get: () => undefined },
    ]);

    const result = await getProvasUser({ limit: 10 });

    expect(mockEqualTo).toHaveBeenCalledWith("usuario", user);
    expect(mockLimit).toHaveBeenCalledWith(10);
    expect(mockDescending).toHaveBeenCalledWith("createdAt");
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: "p1",
      titulo: "Prova 1",
      arquivoAdaptadoUrl: "https://fake/adaptada.pdf",
      arquivoUrl: "https://fake/original.pdf",
    });
    expect(result[1]).toMatchObject({ id: "p2", titulo: null, arquivoAdaptadoUrl: null, arquivoUrl: null });
  });
});

describe("deleteProva (unitario)", () => {
  beforeEach(() => jest.clearAllMocks());

  test("CT-U08 busca a prova pelo id, chama destroy e retorna true", async () => {
    const destroy = jest.fn().mockResolvedValue(true);
    mockQueryGet.mockResolvedValue({ destroy });
    await expect(deleteProva("abc")).resolves.toBe(true);
    expect(mockQueryGet).toHaveBeenCalledWith("abc");
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  test("CT-U15 propaga o erro quando a prova nao existe", async () => {
    mockQueryGet.mockRejectedValue(new Error("Object not found."));
    await expect(deleteProva("inexistente")).rejects.toThrow("Object not found.");
  });
});
