# Suíte de testes da equipe de QA (`__tests__/qa`)

Testes criados pela equipe para o projeto Adapt. Nenhum arquivo do sistema foi alterado.

## Como executar

Todos os comandos rodam dentro da pasta `Adapt/adapt` (onde fica o `package.json`).

```bash
npm ci                                              # instala as dependências
npx jest --watchAll=false --verbose __tests__/qa    # suíte da equipe (36 testes)
npx jest --watchAll=false                           # suíte dos autores + suíte da equipe
npx jest --watchAll=false --coverage __tests__/qa   # relatório de cobertura
```

Não use `npm test`: o script do projeto é `jest --watchAll`, que fica esperando mudanças nos arquivos e nunca encerra sozinho (ACH-05, evidência em `evidencias/ambiente-e-execucao.txt`).

## Estratégia

| Nível | O que valida | Como isola as dependências externas |
|---|---|---|
| Unitário | Uma função ou componente sozinho | O SDK do Parse (Back4App) é trocado por um mock com `jest.mock`, e o `fetch` por um stub. Nada acessa a rede. |
| Integração | Dois ou mais componentes do próprio projeto conversando de verdade | Os serviços usam um Parse falso em memória (`test-utils/fakeParse.js`), e as rotas de API leem arquivos `.docx` reais com o `mammoth` real (`test-utils/docxFixtures.js`). |
| Baseline | A suíte original dos autores, sem nenhuma alteração | Executada antes de qualquer teste novo, para registrar o estado inicial (`evidencias/baseline-jest.txt`). |
| Regressão | A mesma suíte em versões antigas do Git | Os testes são copiados para cada commit escolhido e executados de novo (`evidencias/regressao-resumo.md`). |

Mock x Parse falso: o mock só devolve respostas prontas para uma função isolada. O Parse falso guarda os dados em memória, então o que o `uploadFile` salva pode ser lido pelo `getProvasUser` e apagado pelo `deleteProva`, igual ao banco real.

## Arquivos

| Arquivo | Nível | Casos |
|---|---|---|
| `uploadFile.unit.test.js` | Unitário | CT-U01, U02, U03, U09 |
| `downloadUtils.unit.test.js` | Unitário | CT-U04, U04b, U05, U06, U10 a U13 |
| `provasService.unit.test.js` | Unitário | CT-U07, U08, U14, U15 |
| `parseFile.unit.test.js` | Unitário | CT-U16 a U20 |
| `baselineDiagnostico.unit.test.jsx` | Unitário | CT-U21 a U24 (causa das falhas do baseline) |
| `provas.integration.test.js` | Integração | CT-I01 a I04 |
| `parseApi.integration.test.js` | Integração | CT-I05 a I11 |

## Ambiente usado

Next.js 15.5.4, React 19.1.0, Jest 30.2.0, jest-environment-jsdom 30.2.0 e React Testing Library 16.3.0.

- Suíte principal: Node v24.22.2 / npm 11.19.1 (GitHub Codespaces).
- Regressão nos commits históricos: Node v22.23.5 / npm 10.9.9.
- Confirmação do ACH-05: Node v22.23.4 / npm 10.9.9 (`evidencias/ambiente-e-execucao.txt`).
