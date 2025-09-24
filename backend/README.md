# Projeto The Clinic

## Estrutura Backend do Projeto

```
theclinic
├── backend
│   ├── prisma
│   │   ├── create_administrator.sql             # Script SQL para criar um Administrador
│   │   ├── schema.prisma                        # Define o esquema do banco de dados
│   ├── src
│   │   ├── beneficiary                          # Contém lógica relacionada a beneficiários
│   │   │   ├── beneficiary.controller.ts
│   │   │   ├── beneficiary.dto.ts
│   │   │   ├── beneficiary.routes.ts
│   │   │   └── beneficiary.service.ts
│   │   ├── shared                               # Lógica compartilhada entre módulos
│   │   │   ├── interfaces                       # Interfaces usadas em toda a aplicação
│   │   │   │   ├── pagination.dto.ts
│   │   │   │   └── response.dto.ts
│   │   │   └── middlewares                      # Middlewares para processamento de requisições
│   │   │       └── authentication.middleware.ts
│   │   ├── user                                 # Lógica relacionada a usuários
│   │   │   ├── user.controller.ts
│   │   │   ├── user.dto.ts
│   │   │   ├── user.routes.ts
│   │   │   └── user.service.ts
│   │   ├── utils                                # Funções utilitárias
│   │   ├── app.ts                               # Ponto de entrada da aplicação
│   │   ├── connection.ts                        # Conexão com o banco de dados via Prisma
│   │   └── server.ts                            # Inicia o servidor Express
│   ├── tests                                    # Testes da aplicação
│   │   └── example.test.ts                      # Ainda não implementados
│   ├── .env                                     # Variáveis de ambiente
│   ├── jest.config.js                           # Configuração do Jest
│   ├── package.json                             # Configuração do npm
│   ├── package-lock.json                        # Lockfile do npm
│   ├── README.md                                # Documentação do projeto
│   └── tsconfig.json                            # Configuração do TypeScript
└── frontend
```

## Autenticação Centralizada

A autenticação de usuários (login e validação de token JWT) foi totalmente centralizada no microserviço `auth-service`. O backend **não** expõe mais endpoints de login e **não** valida tokens localmente.

- O login deve ser feito via endpoint `/login` do `auth-service`.
- O backend utiliza o middleware `authentication.middleware.ts`, que faz uma requisição HTTP ao endpoint `/validate-token` do `auth-service` para validar o JWT.
- O endereço do serviço de autenticação é configurado pela variável de ambiente `AUTH_SERVICE_URL` (ex: `http://auth-service:4000`).

## Fluxo de autenticação

1. O cliente faz login via `auth-service` e recebe um JWT.
2. O cliente utiliza esse JWT nas requisições ao backend.
3. O backend encaminha o token ao `auth-service` para validação antes de processar a requisição.

## Observações

- O backend depende do `auth-service` para autenticação. Ambos devem estar rodando e configurados corretamente.
- O banco de dados é compartilhado entre backend e auth-service.
- Para desenvolvimento com Docker, utilize o `docker-compose.yml` na raiz do projeto, que sobe todos os serviços necessários.
