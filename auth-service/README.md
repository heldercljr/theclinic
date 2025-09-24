# Auth Service - The Clinic

Este microserviço é responsável por toda a autenticação do sistema The Clinic, incluindo login de usuários, geração e validação de tokens JWT e registro de auditoria de tentativas de autenticação.

## Funcionalidades
- **Login de usuários**: endpoint `/login` para autenticação e geração de JWT.
- **Validação de token**: endpoint `/validate-token` para validação centralizada de JWT.
- **Auditoria**: todas as tentativas de login (sucesso ou falha) são registradas na tabela de auditoria do banco.

## Endpoints

### POST `/login`
Autentica um usuário e retorna um JWT.

**Body:**
```json
{
  "document": "string",
  "password": "string"
}
```
**Resposta:**
- 200: `{ "token": "..." }`
- 400/401/500: mensagem de erro

### POST `/validate-token`
Valida um JWT enviado no header Authorization ou no body.

**Headers:**
- `Authorization: Bearer <token>`

**Body (opcional):**
```json
{
  "token": "..."
}
```
**Resposta:**
- 200: `{ "user": { ...payload } }`
- 401/403: mensagem de erro

## Observações
- O Auth Service deve ser executado junto ao backend e ao banco de dados.
- O backend depende deste serviço para autenticação e validação de tokens.
- O banco de dados é compartilhado com o backend.
- Todas as tentativas de login são auditadas.

## Execução com Docker
Utilize o `docker-compose.yml` na raiz do projeto para subir todos os serviços necessários:
```sh
docker-compose up --build
```