/**
 * @jest-environment node
 */

import { POST } from "../../app/api/generate-pdf/route";

const mockCreatePdf = jest.fn();
const PDF_FALSO = "%PDF-1.3 pdf falso do teste";

jest.mock("pdfmake/build/pdfmake.min.js", () => ({
  __esModule: true,
  default: { createPdf: (...a) => mockCreatePdf(...a) },
}));
jest.mock("pdfmake/build/vfs_fonts.js", () => ({ __esModule: true, default: {} }));

function postJson(body) {
  return new Request("http://localhost/api/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function docDefinition() {
  return mockCreatePdf.mock.calls[mockCreatePdf.mock.calls.length - 1][0];
}

function blocos(estilo) {
  return docDefinition().content.filter((c) => c.style === estilo);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCreatePdf.mockImplementation(() => ({
    getBuffer: (cb) => cb(Buffer.from(PDF_FALSO)),
  }));
  jest.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/generate-pdf - validacao da entrada", () => {
  test("CT-U25 retorna 400 quando a lista de questoes adaptadas esta vazia", async () => {
    const res = await POST(postJson({ adaptedQuestions: [] }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Nenhuma questão adaptada foi enviada.");
    expect(mockCreatePdf).not.toHaveBeenCalled();
  });

  test("CT-U26 retorna 400 quando o campo adaptedQuestions nao e enviado", async () => {
    const res = await POST(postJson({ instrucoesOriginais: "Leia com atenção." }));
    expect(res.status).toBe(400);
    expect(mockCreatePdf).not.toHaveBeenCalled();
  });

  test("CT-U27 retorna 500 com a mensagem do erro quando o corpo nao e JSON valido", async () => {
    const res = await POST(postJson("{isto nao e json"));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toEqual(expect.any(String));
    expect(mockCreatePdf).not.toHaveBeenCalled();
  });
});

describe("POST /api/generate-pdf - resposta e conteudo do documento", () => {
  test("CT-U28 responde com o PDF gerado, Content-Type application/pdf e nome prova_adaptada.pdf", async () => {
    const res = await POST(postJson({ adaptedQuestions: ["Q1"] }));

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toContain('filename="prova_adaptada.pdf"');
    expect(Buffer.from(await res.arrayBuffer()).toString()).toBe(PDF_FALSO);
  });

  test("CT-U29 cria um titulo 'QUESTÃO n' por questao, na ordem recebida", async () => {
    await POST(postJson({ adaptedQuestions: ["Primeira", "Segunda", "Terceira"] }));

    expect(blocos("questionTitle").map((b) => b.text)).toEqual([
      "QUESTÃO 1",
      "QUESTÃO 2",
      "QUESTÃO 3",
    ]);
    expect(blocos("questionBody")).toHaveLength(3);
  });

  test("CT-U30 usa cabecalho padrao sem metadata e preenche os campos quando ela e enviada", async () => {
    await POST(postJson({ adaptedQuestions: ["Q1"] }));
    const semMetadata = JSON.stringify(docDefinition().content);
    expect(semMetadata).toContain("PROVA ADAPTADA");
    expect(semMetadata).toContain("Disciplina: ________");
    expect(semMetadata).toContain("Data: ___/___/____");

    await POST(
      postJson({
        adaptedQuestions: ["Q1"],
        metadata: { instituicao: "UNICAP", disciplina: "Matemática", professor: "Ana", data: "01/12/2025" },
      })
    );
    const comMetadata = JSON.stringify(docDefinition().content);
    expect(comMetadata).toContain("UNICAP");
    expect(comMetadata).toContain("Disciplina: Matemática");
    expect(comMetadata).toContain("Professor(a): Ana");
    expect(comMetadata).toContain("Data: 01/12/2025");
  });

  test("CT-U31 mostra aviso quando nao ha instrucoes e interpreta markdown quando ha", async () => {
    await POST(postJson({ adaptedQuestions: ["Q1"] }));
    expect(JSON.stringify(docDefinition().content)).toContain("[Nenhuma instrução fornecida]");

    await POST(
      postJson({ adaptedQuestions: ["Q1"], instrucoesOriginais: "# Atenção\n- Use caneta azul" })
    );
    const instrucoes = blocos("instructionText")[0].stack;
    expect(instrucoes[0]).toMatchObject({ text: "Atenção", style: "mdH1" });
    expect(instrucoes[1]).toMatchObject({ ul: ["Use caneta azul"], style: "mdList" });
  });

  test("CT-U32 converte **negrito** e itens de lista dentro da questao", async () => {
    await POST(postJson({ adaptedQuestions: ["Calcule **2 + 2**\n- opção A\n- opção B"] }));

    const corpo = blocos("questionBody")[0].stack;
    expect(corpo[0].text).toEqual([{ text: "Calcule " }, { text: "2 + 2", bold: true }]);
    expect(corpo[1]).toMatchObject({ ul: ["opção A"], style: "mdList" });
    expect(corpo[2]).toMatchObject({ ul: ["opção B"], style: "mdList" });
  });

  test("CT-U33 linha de questao iniciada por '# ' deveria continuar como texto, e nao virar titulo", async () => {
    await POST(postJson({ adaptedQuestions: ["# de lados de um triângulo: quantos são?"] }));

    const corpo = blocos("questionBody")[0].stack;
    expect(corpo.some((b) => b.style === "mdH1")).toBe(false);
    expect(JSON.stringify(corpo)).toContain("# de lados de um triângulo");
  });
});