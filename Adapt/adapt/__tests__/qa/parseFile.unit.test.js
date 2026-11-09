/**
 * @jest-environment node
 *
 * TESTES UNITARIOS - app/api/parse-file/route.js (logica de extracao de questoes)
 * mammoth e pdf2json sao mockados: aqui so a logica da rota e testada.
 */
import { POST, GET } from "../../app/api/parse-file/route";

const mockExtractRawText = jest.fn();

jest.mock("pdf2json", () => jest.fn());
jest.mock("mammoth", () => ({
  __esModule: true,
  default: { extractRawText: (...a) => mockExtractRawText(...a) },
}));

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function makeRequest(type = DOCX, name = "prova.docx") {
  const FileCtor = globalThis.File || require("node:buffer").File;
  const fd = new FormData();
  fd.append("file", new FileCtor([Buffer.from("conteudo")], name, { type }));
  return new Request("http://localhost/api/parse-file", { method: "POST", body: fd });
}

describe("POST /api/parse-file (unitario, mammoth mockado)", () => {
  beforeEach(() => jest.clearAllMocks());

  test("CT-U16 retorna 400 quando o texto extraido e curto demais", async () => {
    mockExtractRawText.mockResolvedValue({ value: "abc" });
    const res = await POST(makeRequest());
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Texto muito curto/);
  });

  test("CT-U17 extrai questoes numeradas com ids q1, q2", async () => {
    mockExtractRawText.mockResolvedValue({
      value: "1) Primeira questão de teste aqui\n2) Segunda questão de teste aqui",
    });
    const res = await POST(makeRequest());
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.originalQuestions).toHaveLength(2);
    expect(body.originalQuestions.map((q) => q.id)).toEqual(["q1", "q2"]);
  });

  test("CT-U18 ignora itens numerados muito curtos (<= 10 caracteres)", async () => {
    mockExtractRawText.mockResolvedValue({
      value: "1) Questão válida e longa o bastante\n2) Oi",
    });
    const body = await (await POST(makeRequest())).json();
    expect(body.originalQuestions).toHaveLength(1);
    expect(body.originalQuestions[0].id).toBe("q1");
  });

  test("CT-U19 remove a linha de cabecalho 'Instrucoes:' antes de extrair", async () => {
    mockExtractRawText.mockResolvedValue({
      value: "Instruções: leia com atenção\n1) Questão número um completa aqui",
    });
    const body = await (await POST(makeRequest())).json();
    expect(body.originalQuestions).toHaveLength(1);
    expect(body.originalQuestions[0].text).not.toMatch(/Instruções/);
  });

  test("CT-U20 GET retorna mensagem de API operacional", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect((await res.json()).message).toBe("API parse-file operacional");
  });
});
