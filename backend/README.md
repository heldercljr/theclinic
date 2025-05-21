# Projeto Aurineth Alves 

## Estrutura do Projeto

```
aurinethalves
├── backend
│   ├── prisma
│   │   ├── schema.prisma         # Define o esquema do banco de dados
│   ├── src
│   │   ├── beneficiary           # Contém lógica relacionada a beneficiários
│   │   │   ├── beneficiary.controller.ts
│   |   |   ├── beneficiary.dto.ts
│   |   |   ├── beneficiary.routes.ts
│   |   |   └── beneficiary.service.ts
│   │   ├── interfaces            # Define interfaces usadas em toda a aplicação
│   │   │   └── exampleRoutes.ts
│   │   ├── middlewares           # Contém middlewares para processamento de requisições
│   │   │   └── authentication.middleware.ts
│   │   ├── user                  # Contém lógica relacionada a usuários
│   │   │   ├── user.controller.ts
│   |   |   ├── user.dto.ts
│   |   |   ├── user.routes.ts
│   |   |   └── user.service.ts
│   │   ├── utils                 # Funções utilitárias
│   │   ├── app.ts                # Ponto de entrada da aplicação
│   │   ├── connection.ts         # Expõe a conexão com o banco de dados através do Prisma
│   │   └── server.ts             # Inicia o servidor Express
│   ├── tests                     # Contém os testes da aplicação
│   │   └── example.test.ts
│   ├── .env                      # Variáveis de ambiente
│   ├── jest.config.js            # Configuração do Jest
│   ├── package.json              # Configuração do npm
│   ├── package-lock.json         # Lockfile do npm
│   ├── README.md                 # Documentação do projeto
│   └── tsconfig.json             # Configuração do TypeScript
└── frontend
```
