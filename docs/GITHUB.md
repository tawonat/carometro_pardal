# GitHub — clonar e contribuir

Repositório oficial: [tawonat/carometro_pardal](https://github.com/tawonat/carometro_pardal).

## Baixar o projeto

Instale Git e execute:

```bash
git clone https://github.com/tawonat/carometro_pardal.git
cd carometro_pardal
git log --oneline
```

Siga o README para instalar dependências, configurar MySQL e iniciar localmente. Não precisa importar o bundle para usar o repositório publicado.

## Origem do histórico

As sete etapas reais da implementação foram importadas em commits sequenciais. Cada mensagem registra o hash do commit original. A importação recriou os hashes e metadados dos commits publicados; os arquivos de cada etapa foram preservados. Há também um commit inicial de preparação da importação e a atualização desta documentação com a URL definitiva.

O ZIP entregue antes da publicação contém `historico.git.bundle` com os sete commits originais. Esse arquivo é uma alternativa para consultar a origem localmente; não deve ser usado para sobrescrever o histórico publicado. Não simulem datas antigas nem atribuam a integrantes alterações que ainda não fizeram.

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
