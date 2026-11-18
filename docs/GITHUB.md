# Publicar no GitHub preservando o histórico

O ZIP de entrega traz o código e um `historico.git.bundle`. O bundle contém o repositório Git completo, com commits feitos ao longo da implementação. Ele não contém `.env`, banco local, node_modules ou fotos reais.

## Recuperar os commits e enviar

Instale Git. Em uma pasta **fora da pasta extraída**, execute (ajuste o caminho do bundle conforme onde o extraiu):

```bash
git clone CAMINHO/DA/PASTA/elo-carometro/historico.git.bundle elo-carometro-git
cd elo-carometro-git
git log --oneline
```

Crie no GitHub um repositório novo chamado `elo-carometro`, sem marcar README, licença ou .gitignore, pois esses arquivos/commits já existem no histórico. Escolha a visibilidade exigida pelo docente. Depois:

```bash
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/elo-carometro.git
git push -u origin main
```

O Git pode pedir autenticação pelo navegador ou gerenciador de credenciais. Não coloque tokens no código ou no README. A URL da página do repositório será a entrega pedida pelo docente. `SEU_USUARIO` é um marcador e precisa ser substituído; não é um link já publicado.

O bundle não fica dentro do próprio histórico, para não criar uma cópia recursiva do repositório. Ele acompanha apenas a distribuição ZIP.

## Trabalhar com o grupo

```bash
git config user.name "Seu nome"
git config user.email "Seu e-mail do GitHub"
git switch -c melhoria/descricao-curta
# Faça, entenda e teste uma alteração real.
git add src docs
git commit -m "feat: descreve a melhoria realizada"
git push -u origin melhoria/descricao-curta
```

Abra um pull request e peçam revisão de outro integrante antes de incorporar. Se o grupo trabalhar apenas em main, usem `git pull` antes de editar e commits pequenos para reduzir conflitos. Não apaguem/recriem commits para fingir etapas ou participação.

## O que nunca publicar

- `.env` com credenciais locais.
- `node_modules`, `.next` ou dumps com dados reais.
- Fotos sem autorização ou capturas de tela com informações pessoais.

A CI já está em `.github/workflows/ci.yml`. Ao enviar commits, consultem a aba Actions para ver os testes. O serviço MySQL do job é novo a cada execução; suas credenciais são descartáveis e não são as do computador.
