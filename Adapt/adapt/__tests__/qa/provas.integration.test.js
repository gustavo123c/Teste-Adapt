/**
 * TESTES DE INTEGRACAO - camada de servicos de provas
 * Componentes reais integrados: uploadFile + gerarPDFAdaptado + getProvasUser + deleteProva.
 * Unico elemento substituido: o Parse/Back4App (por um Parse falso EM MEMORIA, ver test-utils/fakeParse.js)
 * e o fetch para /api/generate-pdf.
 */
import { uploadFile } from "../../app/back4app/provas/uploadFile";
import { getProvasUser } from "../../app/back4app/provas/getProvasUser";
import { deleteProva } from "../../app/back4app/provas/deleteProvas";
import { gerarPDFAdaptado } from "../../app/dashboard/upload/downloadUtils";
import { store, reset, setCurrentUser } from "../../test-utils/fakeParse";

jest.mock("../../app/back4app/parseConfig", () => ({
  __esModule: true,
  default: require("../../test-utils/fakeParse").Parse,
}));

describe("Integracao: upload -> adaptacao -> listagem -> exclusao", () => {
  beforeEach(() => {
    reset();
    global.alert = jest.fn();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["pdf"], { type: "application/pdf" })),
    });
  });

  test("CT-I01 gerarPDFAdaptado integra Parse + /api/generate-pdf e grava o PDF adaptado na prova", async () => {
    const id = await uploadFile(new File(["x"], "Prova Final.pdf"));

    const { safeName } = await gerarPDFAdaptado({
      provaId: id,
      adaptedData: { adaptedQuestions: ["Q1 adaptada", "Q2 adaptada"] },
      selectedFile: { name: "Prova Final.pdf" },
    });

    // a API de geracao foi chamada com a URL salva no upload e as questoes adaptadas
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(global.fetch.mock.calls[0][0]).toBe("/api/generate-pdf");
    expect(body.originalUrl).toBe("https://fake.parse/files/Prova_Final.pdf");
    expect(body.adaptedQuestions).toEqual(["Q1 adaptada", "Q2 adaptada"]);

    // a prova persistida passou a ter o arquivo adaptado
    const prova = store.Provas.find((p) => p.id === id);
    expect(safeName).toBe("Prova Final_adaptada.pdf");
    expect(prova.get("arquivoAdaptadoUrl")).toBe("https://fake.parse/files/Prova Final_adaptada.pdf");
  });

  test("CT-I02 getProvasUser so lista provas que ja possuem arquivo adaptado", async () => {
    const semAdaptacao = await uploadFile(new File(["x"], "sem.pdf"));
    const comAdaptacao = await uploadFile(new File(["x"], "com.pdf"));
    await gerarPDFAdaptado({
      provaId: comAdaptacao,
      adaptedData: { adaptedQuestions: ["Q1"] },
      selectedFile: { name: "com.pdf" },
    });

    const lista = await getProvasUser();
    const ids = lista.map((p) => p.id);

    expect(ids).toContain(comAdaptacao);
    // Comportamento atual (possivel defeito/decisao de projeto): prova sem adaptacao nao aparece
    expect(ids).not.toContain(semAdaptacao);
    expect(lista[0].arquivoAdaptadoUrl).toBe("https://fake.parse/files/com_adaptada.pdf");
  });

  test("CT-I03 provas de outro usuario nao aparecem na listagem", async () => {
    const meuId = await uploadFile(new File(["x"], "minha.pdf"));
    await gerarPDFAdaptado({ provaId: meuId, adaptedData: { adaptedQuestions: ["Q1"] }, selectedFile: { name: "minha.pdf" } });

    setCurrentUser({ id: "user-2" });
    const outroId = await uploadFile(new File(["x"], "outra.pdf"));
    await gerarPDFAdaptado({ provaId: outroId, adaptedData: { adaptedQuestions: ["Q1"] }, selectedFile: { name: "outra.pdf" } });

    const lista = await getProvasUser(); // usuario atual = user-2
    expect(lista.map((p) => p.id)).toEqual([outroId]);
  });

  test("CT-I04 deleteProva remove a prova e ela some da listagem", async () => {
    const id = await uploadFile(new File(["x"], "apagar.pdf"));
    await gerarPDFAdaptado({ provaId: id, adaptedData: { adaptedQuestions: ["Q1"] }, selectedFile: { name: "apagar.pdf" } });
    expect((await getProvasUser()).map((p) => p.id)).toContain(id);

    await expect(deleteProva(id)).resolves.toBe(true);

    expect((await getProvasUser()).map((p) => p.id)).not.toContain(id);
    await expect(deleteProva(id)).rejects.toThrow("Object not found.");
  });
});
