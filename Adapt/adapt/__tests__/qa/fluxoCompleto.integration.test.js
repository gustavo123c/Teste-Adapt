/**
 * @jest-environment node
 */

import { POST as parseFile } from "../../app/api/parse-file/route";
import { POST as generatePdf } from "../../app/api/generate-pdf/route";
import { uploadFile } from "../../app/back4app/provas/uploadFile";
import { getProvasUser } from "../../app/back4app/provas/getProvasUser";
import { deleteProva } from "../../app/back4app/provas/deleteProvas";
import { gerarPDFAdaptado } from "../../app/dashboard/upload/downloadUtils";
import { store, reset, setCurrentUser } from "../../test-utils/fakeParse";
import { PROVA_DOCX_B64, makeDocxFile } from "../../test-utils/docxFixtures";

jest.mock("pdf2json", () => jest.fn());
jest.mock("../../app/back4app/parseConfig", () => ({
  __esModule: true,
  default: require("../../test-utils/fakeParse").Parse,
}));

jest.setTimeout(30000);

function formDataRequest(url, file) {
  const fd = new FormData();
  fd.append("file", file);
  return new Request(url, { method: "POST", body: fd });
}

async function bytesIniciais(blob, n = 5) {
  return Buffer.from(await blob.arrayBuffer()).subarray(0, n).toString();
}

beforeEach(() => {
  reset();
  global.alert = jest.fn();
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
  // gerarPDFAdaptado chama fetch("/api/generate-pdf"); aqui a chamada vai para a rota real
  global.fetch = jest.fn((url, init) => generatePdf(new Request(`http://localhost${url}`, init)));
});

describe("Integracao: fluxo completo .docx -> upload -> PDF adaptado -> listagem", () => {
  test("CT-I12 questoes extraidas do .docx viram um PDF real salvo na prova do usuario", async () => {
    const arquivo = makeDocxFile(PROVA_DOCX_B64, "prova.docx");

    const resParse = await parseFile(formDataRequest("http://localhost/api/parse-file", arquivo));
    expect(resParse.status).toBe(200);
    const { originalQuestions } = await resParse.json();
    expect(originalQuestions).toHaveLength(2);

    const provaId = await uploadFile(arquivo);

    const adaptedQuestions = originalQuestions.map((q) => `**Questão adaptada:** ${q.text}`);

    const { blob, safeName } = await gerarPDFAdaptado({
      provaId,
      adaptedData: { adaptedQuestions, instrucoesOriginais: "Leia com calma." },
      selectedFile: arquivo,
    });

    const enviado = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(global.fetch.mock.calls[0][0]).toBe("/api/generate-pdf");
    expect(enviado.originalUrl).toBe("https://fake.parse/files/prova.docx");
    expect(enviado.adaptedQuestions).toEqual(adaptedQuestions);

    expect(safeName).toBe("prova_adaptada.pdf");
    expect(blob.size).toBeGreaterThan(0);
    expect(await bytesIniciais(blob)).toBe("%PDF-");

    const lista = await getProvasUser();
    expect(lista).toHaveLength(1);
    expect(lista[0]).toMatchObject({
      id: provaId,
      titulo: "prova.docx",
      arquivoUrl: "https://fake.parse/files/prova.docx",
      arquivoAdaptadoUrl: "https://fake.parse/files/prova_adaptada.pdf",
    });
  });

  test("CT-I13 falha na geracao do PDF e propagada e a prova nao fica com arquivo adaptado", async () => {
    const provaId = await uploadFile(makeDocxFile(PROVA_DOCX_B64, "prova.docx"));

    await expect(
      gerarPDFAdaptado({
        provaId,
        adaptedData: { questoes: [{ original: "1) Quanto é 2 + 2 na matemática?" }] },
      })
    ).rejects.toThrow("Erro ao gerar PDF.");

    const prova = store.Provas.find((p) => p.id === provaId);
    expect(prova.get("arquivoAdaptado")).toBeUndefined();
    expect(prova.get("arquivoAdaptadoUrl")).toBeUndefined();
    expect(await getProvasUser()).toHaveLength(0);
  });
});

describe("Integracao: isolamento entre usuarios na exclusao", () => {

  test("CT-I14 deleteProva nao confere o dono: user-2 consegue apagar a prova de user-1", async () => {

    const user1 = { id: "user-1" };
    const user2 = { id: "user-2" };
    setCurrentUser(user1);

    const arquivo = makeDocxFile(PROVA_DOCX_B64, "prova.docx");
    const provaUser1 = await uploadFile(arquivo);
    await gerarPDFAdaptado({
      provaId: provaUser1,
      adaptedData: { adaptedQuestions: ["Q1 adaptada"] },
      selectedFile: arquivo,
    });
    expect((await getProvasUser()).map((p) => p.id)).toEqual([provaUser1]);

    setCurrentUser(user2);

    expect(await getProvasUser()).toHaveLength(0);

    await expect(deleteProva(provaUser1)).resolves.toBe(true);

    expect(store.Provas.find((p) => p.id === provaUser1)).toBeUndefined();
    setCurrentUser(user1);
    expect(await getProvasUser()).toHaveLength(0);
  });
});