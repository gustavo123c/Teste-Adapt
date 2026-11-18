# Análise de regressão: Projeto Adapt

**Objetivo:** executar os 36 testes da equipe (`__tests__/qa`) em três versões do projeto e verificar se algo que funcionava deixou de funcionar (regressão).

**Data da execução:** 18/11/2026
**Ambiente:** Node v22.23.5 · npm 10.9.9 · Jest 30.2.0
**Repositório analisado:** https://github.com/noemisoares/adapt (somente leitura)

---

## 1. Versões analisadas

| Versão | Commit (SHA) | Data | Por que foi escolhida |
|---|---|---|---|
| **V1: Histórico 2** | `5ec4f1c2825f9ad8b9563ae6346967ac62d40804` | 12/11/2025 | Versão antiga, anterior à criação do gerador de PDF (`downloadUtils.js`) e de qualquer ferramenta de teste no projeto. |
| **V2: Histórico 1** | `15c2127074c48f8d685a60d9a477cceb66aa8820` | 19/11/2025 | Dia em que o gerador de PDF foi criado e os autores escreveram seus testes. É anterior às mudanças de 02/12 no upload, na listagem e na tela de provas salvas. |
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
| V1 `5ec4f1c` | 12/11/2025 | 24 | 19 | 5 | 12 | `regressao-V1-12-11-2025-5ec4f1c.txt` |
| V2 `15c2127` | 19/11/2025 | 36 | 29 | 7 | 0 | `regressao-V2-19-11-2025-15c2127.txt` |
| V3 `c7340c9` | 03/12/2025 | 36 | 33 | 3 | 0 | `regressao-V3-03-12-2025-c7340c9-atual.txt` |

**Legenda:** ✅ passou · ❌ falhou · ➖ incompatível (o teste não pôde rodar porque o código que ele testa ainda não existia naquela versão)

---

## 4. Resultado de cada teste em cada versão

### 4.1 Testes unitários (25)

| ID | O que o teste verifica | V1 12/11 | V2 19/11 | V3 03/12 | Mudou? |
|---|---|:-:|:-:|:-:|---|
| CT-U01 | Upload remove acentos e espaços do nome do arquivo | ✅ | ✅ | ✅ | Não |
| CT-U02 | Upload troca caracteres especiais e mantém a extensão | ✅ | ✅ | ✅ | Não |
| CT-U03 | Upload mostra erro quando o salvamento falha | ✅ | ✅ | ✅ | Não |
| CT-U04 | Gerar PDF sem id da prova dá erro | ➖ | ✅ | ✅ | Passou a existir em V2 |
| CT-U04b | Gerar PDF sem dados de adaptação dá erro | ➖ | ✅ | ✅ | Passou a existir em V2 |
| CT-U05 | Gerar PDF de prova sem arquivo original dá erro | ➖ | ✅ | ✅ | Passou a existir em V2 |
| CT-U06 | Gerar PDF com lista de questões vazia dá erro | ➖ | ✅ | ✅ | Passou a existir em V2 |
| CT-U07 | Listar provas sem usuário logado dá erro | ✅ | ✅ | ✅ | Não |
| CT-U08 | Excluir prova chama a remoção e retorna sucesso | ✅ | ✅ | ✅ | Não |
| CT-U09 | Upload devolve o id e grava título e link do arquivo | ❌ | ❌ | ✅ | Corrigido em V3 |
| CT-U10 | Gerar PDF aceita o formato alternativo de questões | ➖ | ✅ | ✅ | Passou a existir em V2 |
| CT-U11 | Gerar PDF mostra erro quando o servidor falha | ➖ | ✅ | ✅ | Passou a existir em V2 |
| CT-U12 | Nome do PDF usa o nome do arquivo enviado | ➖ | ✅ | ✅ | Passou a existir em V2 |
| CT-U13 | Nome padrão do PDF deve ser `prova_adaptada.pdf` | ➖ | ❌ | ❌ | Não (**DEF-06**) |
| CT-U14 | Listagem filtra pelo usuário e organiza os campos | ❌ | ❌ | ✅ | Passou em V3 (ver nota) |
| CT-U15 | Excluir prova inexistente mostra erro | ✅ | ✅ | ✅ | Não |
| CT-U16 | Leitura de arquivo recusa texto curto demais | ✅ | ✅ | ✅ | Não |
| CT-U17 | Leitura de arquivo encontra questões numeradas | ✅ | ✅ | ✅ | Não |
| CT-U18 | Leitura de arquivo ignora itens curtos demais | ✅ | ✅ | ✅ | Não |
| CT-U19 | Leitura de arquivo remove o cabeçalho "Instruções:" | ✅ | ✅ | ✅ | Não |
| CT-U20 | Rota de leitura responde "operacional" | ✅ | ✅ | ✅ | Não |
| CT-U21 | Diagnóstico: o mock dos autores quebra o upload | ✅ | ✅ | ✅ | Não |
| CT-U22 | Diagnóstico: com o comportamento real, o upload funciona | ✅ | ✅ | ✅ | Não |
| CT-U23 | Tela de salvas esconde prova sem PDF adaptado | ❌ | ❌ | ✅ | Comportamento novo em V3 |
| CT-U24 | Tela de salvas mostra prova com PDF adaptado | ✅ | ✅ | ✅ | Não |

### 4.2 Testes de integração (11)

| ID | O que o teste verifica | V1 12/11 | V2 19/11 | V3 03/12 | Mudou? |
|---|---|:-:|:-:|:-:|---|
| CT-I01 | Upload + geração do PDF + salvamento funcionam juntos | ➖ | ✅ | ✅ | Passou a existir em V2 |
| CT-I02 | Listagem mostra só provas que já têm PDF adaptado | ➖ | ❌ | ✅ | Comportamento novo em V3 |
| CT-I03 | Um usuário não vê as provas de outro | ➖ | ✅ | ✅ | Passou a existir em V2 |
| CT-I04 | Prova excluída some da listagem | ➖ | ✅ | ✅ | Passou a existir em V2 |
| CT-I05 | Rota `parse-docx` lê um arquivo Word real | ❌ | ❌ | ❌ | Não (**DEF-08**) |
| CT-I06 | Rota `parse-docx` sem arquivo responde 400 | ✅ | ✅ | ✅ | Não |
| CT-I07 | Rota `parse-file` encontra 2 questões num Word real | ✅ | ✅ | ✅ | Não |
| CT-I08 | Rota `parse-file` avisa quando não há questões | ✅ | ✅ | ✅ | Não |
| CT-I09 | Rota `parse-file` recusa formato não suportado | ✅ | ✅ | ✅ | Não |
| CT-I10 | Rota `parse-file` sem arquivo deve responder 400 | ❌ | ❌ | ❌ | Não (**DEF-07**) |
| CT-I11 | Rota `parse-file` responde "operacional" | ✅ | ✅ | ✅ | Não |

---

## 5. Explicação das mudanças

| Situação | Testes | Motivo |
|---|---|---|
| **Incompatível em V1** | CT-U04 a U06, U10 a U13, CT-I01 a I04 (12 testes) | O arquivo `downloadUtils.js` (gerador de PDF) só foi criado em 19/11. CT-I02 a I04 não usam esse arquivo, mas estão no mesmo arquivo de teste que o importa, e por isso também não carregaram. |
| **Corrigido em V3** | CT-U09 | Até 19/11, o upload não salvava o título da prova. A linha foi adicionada em 02/12 (commit `539b84f`). |
| **Comportamento novo em V3** | CT-U23, CT-I02 | Em 02/12, a listagem e a tela de provas salvas passaram a mostrar só as provas que já têm PDF adaptado. |
| **Nota sobre CT-U14** | CT-U14 | O código antigo chamava a função `name()` do arquivo. O banco de dados falso usado nos testes não simula essa função, que existe no Parse real. A falha vem dessa diferença no código antigo, não de um defeito do sistema. |
| **Defeito em todas as versões** | CT-U13, CT-I05, CT-I10 | DEF-06, DEF-08 e DEF-07 existem desde que o código correspondente foi criado e nunca foram corrigidos. |

---

## 6. Informação extra: testes dos autores em V2 (19/11)

Os 24 testes originais dos autores também foram executados em V2 (`regressao-V2-19-11-2025-15c2127-testes-dos-autores.txt`). O resultado foi 19 aprovados e 5 falhos, igual à versão atual. Ou seja, **os testes dos autores já falhavam no dia em que foram criados**.

No teste `SalvasPage.test.jsx`, a causa da falha mudou entre as versões:
- em V2, a tela mostrava o título da prova duas vezes ("Found multiple elements");
- em V3, a tela não mostra a prova do mock, por causa do novo filtro (DEF-05).

---

## 7. Conclusão

- **Não houve regressão.** Nenhum teste que passava numa versão antiga passou a falhar numa versão mais nova.
- **O sistema evoluiu.** Os testes executáveis subiram de 24 (V1) para 36 (V2 e V3). As falhas caíram de 7 (V2) para 3 (V3). A V1 tem só 5 falhas porque 12 testes nem chegaram a rodar.
- **Os 3 defeitos encontrados pela equipe (DEF-06, DEF-07 e DEF-08) são antigos.** Estão presentes em todas as versões em que o código existe.
- **Testabilidade:** até 19/11/2025 o projeto não tinha nenhuma ferramenta de teste automatizado.
