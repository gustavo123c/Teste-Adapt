# Análise de regressão: Projeto Adapt

**Objetivo:** executar os 48 testes da equipe (`__tests__/qa`: 34 unitários + 14 de integração) em três versões do projeto e verificar se algo que funcionava deixou de funcionar (regressão).

**Data da execução:** V1 e V2 em 22/11/2026 (Node v22.23.5 · npm 10.9.9); V3 em 23/11/2026 no GitHub Codespaces (Node v24.22.2 · npm 11.19.1) · Jest 30.2.0
**Repositório analisado:** https://github.com/noemisoares/adapt (somente leitura)
**Testes:** https://github.com/gustavo123c/Teste-Adapt (pastas `__tests__/qa` e `test-utils`)

> **Atualização:** a primeira rodada (18/11/2026) usou 36 testes. Em 21/11/2026 a equipe acrescentou 12 testes: CT-U25 a CT-U33, para a rota `/api/generate-pdf`, e CT-I12 a CT-I14, com o fluxo completo e a exclusão. A regressão foi repetida com os 48. Os resultados dos 36 testes originais não mudaram. Os testes novos estão marcados com 🆕.

---

## 1. Versões analisadas

| Versão | Commit (SHA) | Data | Por que foi escolhida |
|---|---|---|---|
| **V1: Histórico 2** | `5ec4f1c2825f9ad8b9563ae6346967ac62d40804` | 12/11/2025 | Versão antiga, anterior à criação do gerador de PDF (`downloadUtils.js`) e de qualquer ferramenta de teste no projeto. |
| **V2: Histórico 1** | `15c2127074c48f8d685a60d9a477cceb66aa8820` | 19/11/2025 | Dia em que o gerador de PDF foi criado e os autores escreveram seus testes. É anterior às mudanças de 29/11 a 03/12 no upload, na listagem, na tela de provas salvas e na rota `generate-pdf`. |
| **V3: Referência (atual)** | `c7340c93d46745a01d8aa5fbda29a91ca4c1f65f` | 03/12/2025 | Última versão da branch `main`. |

---

## 2. Como foi feito

1. Cada versão foi aberta numa cópia separada com `git worktree add <pasta> <sha>`.
2. Os testes da equipe (`__tests__/qa/` e `test-utils/`) foram copiados para essa cópia.
3. As dependências foram instaladas com `npm ci`.
4. Os testes foram executados com `npx jest --watchAll=false --verbose __tests__/qa`.

**Nenhum arquivo do sistema foi alterado**: `git status` mostra apenas os arquivos de teste adicionados.

> **Observação sobre a V1:** em 12/11 o projeto ainda não tinha o Jest instalado. Para rodar os testes, foram copiados o `jest.config.js` e o `jest.setup.js` da versão atual, e as mesmas ferramentas de teste foram instaladas temporariamente (`npm install --no-save jest@30.2.0 jest-environment-jsdom@30.2.0 @testing-library/react@16.3.0 @testing-library/jest-dom@6.9.1 @testing-library/user-event@14.6.1 @testing-library/dom@10.4.1 identity-obj-proxy@3.0.0`). O código do sistema não foi modificado.

---

## 3. Resultado geral

| Versão | Data | Executados | ✅ Passaram | ❌ Falharam | ➖ Incompatíveis | Evidência |
|---|---|---|---|---|---|---|
| V1 `5ec4f1c` | 12/11/2025 | 33 | 22 | 11 | 15 | `regressao-V1-12-11-2025-5ec4f1c.txt` |
| V2 `15c2127` | 19/11/2025 | 48 | 33 | 15 | 0 | `regressao-V2-19-11-2025-15c2127.txt` |
| V3 `c7340c9` | 03/12/2025 | 48 | 44 | 4 | 0 | `regressao-V3-03-12-2025-c7340c9-atual.txt` |

**Legenda:** ✅ passou · ❌ falhou · ➖ incompatível (o teste não pôde rodar porque o código que ele usa ainda não existia naquela versão)

---

## 4. Resultado de cada teste em cada versão

### 4.1 Testes unitários (34)

| ID | O que o teste verifica | V1 12/11 | V2 19/11 | V3 03/12 | Mudou? |
|---|---|:-:|:-:|:-:|---|
| CT-U01 | Upload remove acentos e espaços do nome do arquivo | ✅ | ✅ | ✅ | Não |
| CT-U02 | Upload troca caracteres especiais e mantém a extensão | ✅ | ✅ | ✅ | Não |
| CT-U03 | Upload mostra erro quando o salvamento falha | ✅ | ✅ | ✅ | Não |
| CT-U04 | Gerar PDF sem id da prova dá erro | ➖ | ✅ | ✅ | Passou a rodar em V2 |
| CT-U04b | Gerar PDF sem dados de adaptação dá erro | ➖ | ✅ | ✅ | Passou a rodar em V2 |
| CT-U05 | Gerar PDF de prova sem arquivo original dá erro | ➖ | ✅ | ✅ | Passou a rodar em V2 |
| CT-U06 | Gerar PDF com lista de questões vazia dá erro | ➖ | ✅ | ✅ | Passou a rodar em V2 |
| CT-U07 | Listar provas sem usuário logado dá erro | ✅ | ✅ | ✅ | Não |
| CT-U08 | Excluir prova chama a remoção e retorna sucesso | ✅ | ✅ | ✅ | Não |
| CT-U09 | Upload devolve o id e grava título e link do arquivo | ❌ | ❌ | ✅ | Passou em V3 |
| CT-U10 | Gerar PDF aceita o formato alternativo de questões | ➖ | ✅ | ✅ | Passou a rodar em V2 |
| CT-U11 | Gerar PDF mostra erro quando o servidor falha | ➖ | ✅ | ✅ | Passou a rodar em V2 |
| CT-U12 | Nome do PDF usa o nome do arquivo enviado | ➖ | ✅ | ✅ | Passou a rodar em V2 |
| CT-U13 | Nome padrão do PDF deve ser `prova_adaptada.pdf` | ➖ | ❌ | ❌ | Não (**DEF-06**) |
| CT-U14 | Listagem filtra pelo usuário e organiza os campos | ❌ | ❌ | ✅ | Passou em V3 |
| CT-U15 | Excluir prova inexistente mostra erro | ✅ | ✅ | ✅ | Não |
| CT-U16 | Leitura de arquivo recusa texto curto demais | ✅ | ✅ | ✅ | Não |
| CT-U17 | Leitura de arquivo encontra questões numeradas | ✅ | ✅ | ✅ | Não |
| CT-U18 | Leitura de arquivo ignora itens curtos demais | ✅ | ✅ | ✅ | Não |
| CT-U19 | Leitura de arquivo remove o cabeçalho "Instruções:" | ✅ | ✅ | ✅ | Não |
| CT-U20 | Rota de leitura responde "operacional" | ✅ | ✅ | ✅ | Não |
| CT-U21 | Diagnóstico: o mock dos autores quebra o upload | ✅ | ✅ | ✅ | Não |
| CT-U22 | Diagnóstico: com o comportamento real, o upload funciona | ✅ | ✅ | ✅ | Não |
| CT-U23 | Tela de salvas esconde prova sem PDF adaptado | ❌ | ❌ | ✅ | Passou em V3 |
| CT-U24 | Tela de salvas mostra prova com PDF adaptado | ✅ | ✅ | ✅ | Não |
| CT-U25 🆕 | Rota `generate-pdf`: lista de questões vazia responde 400 | ❌ | ❌ | ✅ | Passou em V3 |
| CT-U26 🆕 | Rota `generate-pdf`: sem o campo de questões responde 400 | ✅ | ✅ | ✅ | Não |
| CT-U27 🆕 | Rota `generate-pdf`: corpo inválido responde 500 com a mensagem do erro | ✅ | ✅ | ✅ | Não |
| CT-U28 🆕 | Rota `generate-pdf`: devolve o PDF com tipo e nome corretos | ✅ | ✅ | ✅ | Não |
| CT-U29 🆕 | Rota `generate-pdf`: cria o título "QUESTÃO n" para cada questão, em ordem | ❌ | ❌ | ✅ | Passou em V3 |
| CT-U30 🆕 | Rota `generate-pdf`: cabeçalho padrão e campos preenchidos quando enviados | ❌ | ❌ | ✅ | Passou em V3 |
| CT-U31 🆕 | Rota `generate-pdf`: aviso quando não há instruções e formatação quando há | ❌ | ❌ | ✅ | Passou em V3 |
| CT-U32 🆕 | Rota `generate-pdf`: converte negrito e listas dentro da questão | ❌ | ❌ | ✅ | Passou em V3 |
| CT-U33 🆕 | Rota `generate-pdf`: linha que começa com `# ` deve continuar texto, não virar título | ❌ | ❌ | ❌ | Não (**DEF-09**) |

### 4.2 Testes de integração (14)

| ID | O que o teste verifica | V1 12/11 | V2 19/11 | V3 03/12 | Mudou? |
|---|---|:-:|:-:|:-:|---|
| CT-I01 | Upload + geração do PDF + salvamento funcionam juntos | ➖ | ✅ | ✅ | Passou a rodar em V2 |
| CT-I02 | Listagem mostra só provas que já têm PDF adaptado | ➖ | ❌ | ✅ | Passou em V3 |
| CT-I03 | Um usuário não vê as provas de outro | ➖ | ✅ | ✅ | Passou a rodar em V2 |
| CT-I04 | Prova excluída some da listagem | ➖ | ✅ | ✅ | Passou a rodar em V2 |
| CT-I05 | Rota `parse-docx` lê um arquivo Word real | ❌ | ❌ | ❌ | Não (**DEF-08**) |
| CT-I06 | Rota `parse-docx` sem arquivo responde 400 | ✅ | ✅ | ✅ | Não |
| CT-I07 | Rota `parse-file` encontra 2 questões num Word real | ✅ | ✅ | ✅ | Não |
| CT-I08 | Rota `parse-file` avisa quando não há questões | ✅ | ✅ | ✅ | Não |
| CT-I09 | Rota `parse-file` recusa formato não suportado | ✅ | ✅ | ✅ | Não |
| CT-I10 | Rota `parse-file` sem arquivo deve responder 400 | ❌ | ❌ | ❌ | Não (**DEF-07**) |
| CT-I11 | Rota `parse-file` responde "operacional" | ✅ | ✅ | ✅ | Não |
| CT-I12 🆕 | Fluxo completo: questões do Word viram um PDF real salvo na prova | ➖ | ❌ | ✅ | Passou em V3 |
| CT-I13 🆕 | Fluxo completo: falha na geração do PDF não deixa a prova com arquivo adaptado | ➖ | ❌ | ✅ | Passou em V3 |
| CT-I14 🆕 | Exclusão não confere o dono: um usuário consegue apagar a prova de outro | ➖ | ✅ | ✅ | Passou a rodar em V2 |

---

## 5. Explicação das mudanças

| Situação | Testes | Motivo |
|---|---|---|
| **Incompatível em V1** | CT-U04 a U06, U10 a U13, CT-I01 a I04, CT-I12 a I14 (15 testes) | O gerador de PDF (`downloadUtils.js`) só foi criado em 19/11. Os testes de integração que não o usam diretamente estão em arquivos de teste que o importam, e por isso também não carregaram. |
| **Corrigido em V3** | CT-U09, CT-I12 🆕 | Até 19/11, o upload não salvava o título da prova. A linha foi adicionada em 02/12 (commit `539b84f`). O CT-I12 também confere o título no fim do fluxo completo, e por isso falha em V2. |
| **Comportamento novo em V3** | CT-U23, CT-I02 | Em 02/12, a listagem e a tela de provas salvas passaram a mostrar só as provas que já têm PDF adaptado. |
| **Rota `generate-pdf` reformulada** 🆕 | CT-U25, U29 a U32, CT-I13 | Entre 29/11 e 03/12, os autores mudaram a rota `generate-pdf`: mensagens de erro, títulos "QUESTÃO n", cabeçalho, instruções e formatação. Nas versões antigas o PDF tinha outro formato (por exemplo, "Questão 1" e instruções fixas) e aceitava pedidos que a versão atual recusa (CT-I13), e por isso esses testes falham lá. É **mudança de comportamento**, não defeito. |
| **Nota sobre CT-U14** | CT-U14 | O código antigo chamava a função `name()` do arquivo. O banco de dados falso usado nos testes não simula essa função, que existe no Parse real. A falha vem dessa diferença no código antigo, não de um defeito do sistema. |
| **Defeito em todas as versões** | CT-U13, CT-I05, CT-I10, CT-U33 🆕 | DEF-06, DEF-08, DEF-07 e DEF-09 existem desde que o código correspondente foi criado e nunca foram corrigidos. |
| **Achado confirmado (ACH-08)** 🆕 | CT-I14 | O teste **passa** porque confirma uma falha: `deleteProva` não confere quem é o dono da prova, então um usuário consegue apagar a prova de outro. O comportamento é o mesmo em V2 e V3. Foi verificado com o banco falso; no Back4App real, regras de permissão (ACL) podem bloquear a exclusão. |

---

## 6. Conclusão

- **Não houve regressão.** Nenhum teste que passava numa versão antiga passou a falhar numa versão mais nova, nem entre os 36 testes originais nem entre os 12 novos.
- **O sistema evoluiu.** Os testes executáveis subiram de 33 (V1) para 48 (V2 e V3). As falhas caíram de 15 (V2) para 4 (V3). A V1 tem menos falhas (11) que a V2 só porque 15 testes nem chegaram a rodar.
- **Os 4 defeitos encontrados pela equipe são antigos.** DEF-06, DEF-07, DEF-08 e DEF-09 estão presentes em todas as versões em que o código existe.
- **Testabilidade:** até 19/11/2025 o projeto não tinha nenhuma ferramenta de teste automatizado.

