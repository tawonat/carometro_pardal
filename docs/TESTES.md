# Verificação da entrega

Verificação realizada em **18/11/2026**, com **Node.js 24.22.3**, **Next.js 16.4.6**, **MySQL Community 8.4.13** e **Sharp 0.35.5**, em Linux. A integração final foi executada contra `next start`, usando a versão compilada, com `DEMO_ACCESS=false`.

| Verificação                         | Resultado observado                                                                                |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `npm test`                          | 10 testes de regras de validação passaram.                                                         |
| `npm run typecheck`                 | Tipos de rotas gerados e TypeScript sem erros.                                                     |
| `npm run build`                     | Compilação de produção concluída.                                                                  |
| `npm run test:integration`          | 28 verificações HTTP/MySQL passaram na versão compilada.                                           |
| `npm audit`                         | Nenhuma vulnerabilidade conhecida reportada nas dependências no momento da consulta.               |
| Cadastro/edição pelo navegador      | Turma e aluno criados, busca por matrícula e alteração de situação/apresentação consultada depois. |
| Layout reduzido                     | Telas verificadas em áreas de 390 px e 768 px; formulário revisado na largura de celular.          |
| Base após limpar registros de teste | 4 turmas, 24 alunos e 22 matrículas ativas.                                                        |

## Integração: o que foi verificado

1. Atalho de demonstração respeita a configuração (desativado na verificação final).
2. API de alunos exige autenticação.
3. Login cria cookie HttpOnly e SameSite=Strict.
4. Alterações originadas em outro site são bloqueadas.
5. Turma é criada.
6. Turma duplicada é recusada.
7. Turma criada é consultada.
8. Servidor recusa matrícula inválida.
9. Arquivo de texto disfarçado de imagem é recusado.
10. Aluno é cadastrado com imagem PNG real.
11. Foto é retornada como WebP.
12. Foto exige autenticação.
13. Matrícula duplicada é recusada.
14. Turma com alunos não pode ser excluída.
15. Busca e filtro encontram o aluno gravado.
16. Texto com aparência de SQL é tratado como busca literal.
17. Turma inexistente é recusada na transferência.
18. Atualização malsucedida não altera o perfil.
19. Aluno é editado e sua foto removida.
20. Outra conexão MySQL lê a edição persistida.
21. Edição da turma é consultada novamente.
22. Foto pode ser adicionada novamente após remoção.
23. CASCADE remove a foto ao excluir o aluno.
24. Aluno é excluído.
25. Consulta do aluno excluído retorna 404.
26. Turma vazia pode ser excluída.
27. Logout revoga a sessão no banco.
28. Sexta tentativa de login na mesma janela é bloqueada.

## Limites da verificação

Os scripts CMD foram revisados, mas não executados em uma máquina Windows nesta entrega. A adaptação móvel foi conferida por largura de viewport no navegador, sem teste em aparelho físico. O workflow GitHub Actions está preparado; sua execução no GitHub depende de publicar o repositório. Estes resultados não dispensam o ensaio do grupo no computador da apresentação.
