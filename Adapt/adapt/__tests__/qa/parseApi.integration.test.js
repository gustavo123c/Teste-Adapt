/**
 * @jest-environment node
 *
 * TESTES DE INTEGRACAO - rotas de API com arquivo .docx REAL
 * Integra: rota Next.js (parse-docx / parse-file) + mammoth (real) + logica de extracao de questoes.
 * pdf2json e mockado apenas para nao ser carregado (nao e usado com .docx).
 */
import { POST as parseDocx } from "../../app/api/parse-docx/route";
import { POST as parseFile, GET as parseFileGet } from "../../app/api/parse-file/route";
import {
  PROVA_DOCX_B64,
  SEM_NUMERACAO_DOCX_B64,
  makeDocxFile,
} from "../../test-utils/docxFixtures";

jest.mock("pdf2json", () => jest.fn());

function reqWith(url, file) {
  const fd = new FormData();
  if (file) fd.append("file", file);
  return new Request(url, { method: "POST", body: fd });
}

describe("Integracao: /api/parse-docx", () => {
  test("CT-I05 extrai o texto de um .docx real", async () => {
    const res = await parseDocx(reqWith("http://localhost/api/parse-docx", makeDocxFile(PROVA_DOCX_B64)));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.text).toContain("Quanto é 2 + 2");
    expect(body.text).toContain("capital do Brasil");
  });

  test("CT-I06 retorna 400 quando nenhum arquivo e enviado", async () => {
    const res = await parseDocx(reqWith("http://localhost/api/parse-docx", null));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Arquivo não enviado");
  });
});

describe("Integracao: /api/parse-file", () => {
  test("CT-I07 detecta 2 questoes numeradas em um .docx real", async () => {
    const res = await parseFile(reqWith("http://localhost/api/parse-file", makeDocxFile(PROVA_DOCX_B64)));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.originalQuestions).toHaveLength(2);
    expect(body.originalQuestions[0].text).toMatch(/^1\)/);
    expect(body.originalQuestions[1].text).toMatch(/^2\)/);
  });

  test("CT-I08 retorna 400 'Nenhuma questao detectada' para .docx sem numeracao", async () => {
    const res = await parseFile(
      reqWith("http://localhost/api/parse-file", makeDocxFile(SEM_NUMERACAO_DOCX_B64, "livre.docx"))
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Nenhuma questão detectada.");
  });

  test("CT-I09 rejeita formato nao suportado (text/plain) com 400", async () => {
    const FileCtor = globalThis.File || require("node:buffer").File;
    const txt = new FileCtor([Buffer.from("1) texto qualquer longo")], "a.txt", { type: "text/plain" });
    const res = await parseFile(reqWith("http://localhost/api/parse-file", txt));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Formato não suportado: text/plain.");
  });

  // SUSPEITA DE DEFEITO: a rota parse-docx responde 400 quando falta o arquivo, mas parse-file
  // lanca erro e responde 500 ("Erro interno"). Erro do cliente deveria ser 4xx.
  // Se este teste FALHAR (recebeu 500), registre como defeito.
  test("CT-I10 requisicao sem arquivo deveria retornar 400 (e nao 500)", async () => {
    const res = await parseFile(reqWith("http://localhost/api/parse-file", null));
    expect(res.status).toBe(400);
  });

  test("CT-I11 GET informa que a API esta operacional", async () => {
    const res = await parseFileGet();
    expect(res.status).toBe(200);
    expect((await res.json()).message).toBe("API parse-file operacional");
  });
});
