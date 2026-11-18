# Demonstração ao vivo — Elo

Duração sugerida: 8 a 10 minutos. Façam ensaio no mesmo computador e navegador que serão usados em sala. O objetivo é mostrar funcionamento e domínio, não apenas passar por telas.

## Antes de apresentar

- MySQL iniciado; `npm run db:setup` concluído.
- `npm test`, `npm run typecheck` e `npm run build` sem falhas.
- `npm start` aberto em http://localhost:3000.
- Saber o login de demonstração. Se escolherem DEMO_ACCESS=true, explicar que o atalho está restrito à demonstração fictícia e é desligado no uso normal.
- Deixar `database/schema.sql`, o diagrama e o guia do código disponíveis.
- Preencher `CONTRIBUICOES.md` somente com contribuições reais e revisar cada commit do grupo.
- Testar upload com um JPG/PNG autorizado, sem depender da internet.

## Fluxo completo com gravação, consulta e edição

| Tempo     | Demonstração                                                                                                             | Explicação                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| 0:00–0:45 | Apresentar login e entrar.                                                                                               | O Elo organiza rostos, alunos e turmas; Next reúne interface/API e MySQL persiste os dados. |
| 0:45–1:30 | Abrir carômetro, alternar cartões/lista, mostrar busca e filtro.                                                         | Dados iniciais são fictícios; busca nome, nome de preferência ou matrícula.                 |
| 1:30–2:15 | Criar turma `3º C`, curso `Desenvolvimento de Sistemas`, ano `2026`, turno `Tarde`, sala `Lab 03`.                       | INSERT em classes; id será referenciado pelo aluno. Se já existir, use outro nome.          |
| 2:15–3:15 | Cadastrar `Alex de Demonstração`, matrícula `2026999`, vincular à turma criada, adicionar foto autorizada ou ilustração. | Validação no formulário e servidor; matrícula única; aluno e foto gravados em transação.    |
| 3:15–3:45 | Buscar `2026999`, abrir perfil e recarregar a página. Buscar de novo.                                                    | O dado foi recuperado do MySQL; a busca não depende apenas de memória da tela.              |
| 3:45–4:30 | Editar apresentação e situação para `Trancado`; salvar, recarregar e consultar de novo.                                  | UPDATE persistido; campos voltam com os novos valores.                                      |
| 4:30–5:15 | Tentar outro aluno com a mesma matrícula.                                                                                | UNIQUE do banco impede duplicata; mensagem compreensível em vez de SQL bruto.               |
| 5:15–6:00 | Tentar excluir a turma ainda vinculada ao aluno.                                                                         | O banco recusa pela FK RESTRICT. Uma checagem só na interface não bastaria.                 |
| 6:00–6:45 | Excluir o aluno de teste e então a turma de teste.                                                                       | DELETE do aluno remove foto por CASCADE; turma vazia agora pode ser excluída.               |
| 6:45–7:30 | Mostrar diagrama e estrutura de pastas.                                                                                  | Separação de interface, API, regras compartilhadas e banco.                                 |
| 7:30–8:30 | Mostrar resultado dos testes e contribuições reais.                                                                      | Integração usa HTTP e outra conexão MySQL; cada pessoa explica o que fez.                   |
| 8:30–9:00 | Sair da conta e tentar voltar ao app.                                                                                    | Logout revoga a sessão; área protegida volta ao login.                                      |

Se a matrícula de demonstração já existir, escolha outra de 4 a 12 números. Não apaguem cadastros reais para ensaiar. Se a conexão falhar na hora, mostrem o erro compreensível e confiram o serviço MySQL, sem revelar `.env` ou senhas no projetor.

## Explicação técnica breve

> O navegador renderiza componentes React e chama as rotas de API do Next.js. A API confere sessão, origem e dados, e executa SQL parametrizado no MySQL. Turmas e alunos têm CRUD completo. A matrícula é única, e a chave estrangeira garante que cada aluno pertença a uma turma válida. A gravação da foto e do aluno usa transação. Senhas são derivadas com scrypt; sessões usam tokens aleatórios e cookies HttpOnly. Escolhemos SQL explícito e uma estrutura curta para compreender e demonstrar todo o fluxo.

Adaptem a fala às palavras de vocês. Conseguir localizar cada regra no código é melhor que decorar o parágrafo.

## Perguntas prováveis

| Pergunta                                       | Resposta que vocês devem conseguir explicar                                                                                  |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| O que é CRUD?                                  | Create/Read/Update/Delete: cadastrar, consultar, editar e excluir. Mostrar as quatro operações nas duas entidades.           |
| Onde os dados ficam?                           | MySQL, não localStorage. O teste faz uma consulta por outra conexão para comprovar persistência.                             |
| Por que Next e não HTML solto?                 | Rotas, componentes, navegação e backend no mesmo projeto, com estrutura React e TypeScript.                                  |
| TypeScript impede dado inválido no POST?       | Não. Tipos somem ao compilar; Zod valida o valor recebido em execução.                                                       |
| Por que validar duas vezes?                    | Cliente melhora a experiência; servidor protege contra requisição manual/modificada.                                         |
| Por que não guardar turma como texto no aluno? | Uma FK evita nomes divergentes e deixa editar turma num lugar; JOIN recupera a descrição.                                    |
| O que acontece se o MySQL parar?               | A API trata a falha e mostra mensagem segura; nada é salvo apenas na memória como se tivesse funcionado.                     |
| Como evita SQL injection?                      | Prepared statements separam valores do SQL; ordenação usa lista fixa.                                                        |
| Por que o banco impede duplicata?              | Duas pessoas podem tentar cadastrar ao mesmo tempo; só UNIQUE garante integridade em concorrência.                           |
| O que é uma transação?                         | Confirma um conjunto de gravações ou desfaz todas se alguma etapa falhar.                                                    |
| Para que serve CASCADE?                        | Remove automaticamente a foto quando o aluno é excluído. RESTRICT faz o contrário: bloqueia turma com dependentes.           |
| Como a senha está protegida?                   | Sal aleatório + scrypt; não existe senha em texto na tabela. Comparação em tempo constante.                                  |
| O que o cookie guarda?                         | Token aleatório, não senha; o banco guarda apenas o hash do token e a expiração.                                             |
| E o atalho de demonstração?                    | Opcional e desligado por padrão. Se ativado, qualquer visitante local tem acesso completo; usar somente com dados fictícios. |
| O sistema reconhece rostos automaticamente?    | Não. É carômetro de consulta visual, sem biometria nem reconhecimento facial.                                                |
| Por que fotos no banco?                        | Simplifica backup e transação no volume acadêmico. Em grande escala, considerar armazenamento de objetos.                    |
| O que melhorariam depois?                      | Permissões por perfil, auditoria, histórico de matrículas, migrations e testes de acessibilidade mais amplos.                |
| Qual foi sua contribuição?                     | Responder com trabalho real e mostrar os arquivos/commits correspondentes. Não atribuir a si o código que ainda não estudou. |

## Critérios e evidências

| Critério                                 | Evidência no projeto                                                              |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| Funcionalidade / tema (25)               | CRUD de alunos/turmas, retratos, perfil e fluxo completo ao vivo.                 |
| Banco / integridade (20)                 | Schema, diagrama, FKs, UNIQUE, CHECK, transação e consulta persistida.            |
| Interface / usabilidade (15)             | Navegação consistente, celular/tablet, estados vazios e feedback de erro/sucesso. |
| Técnica / validação / segurança (15)     | Zod, prepared statements, sessões, scrypt, validação real de imagem e origem.     |
| GitHub / organização / documentação (10) | README reproduzível, código organizado, histórico e commits reais do grupo.       |
| Apresentação / testes / domínio (15)     | Testes automatizados, ensaio, perguntas e explicação individual.                  |

A lista de critérios recebida repetia as três últimas linhas. Este roteiro considera cada critério uma vez, totalizando 100 pontos. A nota depende da avaliação e do domínio do grupo; não é garantida pelo pacote.
