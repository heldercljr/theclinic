# The Clinic - Ambiente de Microserviços

[Veja itens removidos e justificativas](./REMOVIDOS.md) (como AuditType, AuditRepository, tabelas de auditoria, etc.)

## Pré-requisitos
- Docker (https://docs.docker.com/get-docker/)
- Docker Compose (https://docs.docker.com/compose/install/)
- Node.js >= 18 (para scripts locais e desenvolvimento)
- Recomenda-se pelo menos 4GB de RAM livre

## Estrutura dos Serviços
- **backend**: Serviço principal de dados e regras de negócio
- **auth-service**: Serviço de autenticação e autorização
- **logger-service**: Centralização de logs e integração com Loki
- **grafana**: Visualização de métricas e logs
- **loki**: Armazenamento de logs
- **prometheus**: Coleta de métricas dos microserviços
- **db**: Banco de dados PostgreSQL

## Subindo o ambiente completo

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd theclinic
   ```

2. **Configure as variáveis de ambiente**
   - Crie um arquivo `.env` na raiz do projeto com os valores necessários:
     ```env
     POSTGRES_USER=theclinic
     POSTGRES_PASSWORD=theclinic
     POSTGRES_DB=theclinic
     POSTGRES_PORT=5432
     DATABASE_URL=postgresql://theclinic:theclinic@db:5432/theclinic
     NODE_ENV=development
     HOST=0.0.0.0
     ```
   - Ajuste conforme necessário para seu ambiente.

3. **(Opcional) Limpe containers, imagens e volumes antigos**
   ```bash
   docker compose down --volumes --remove-orphans
   docker system prune -af
   ```

4. **Construa e suba todos os containers**
   ```bash
   docker compose up --build
   ```
   - O processo pode demorar na primeira execução.
   - Todos os serviços serão inicializados e interligados automaticamente.

5. **Acesse os serviços**
   - **Backend**: http://localhost:3000
   - **Auth-service**: http://localhost:3002
   - **Logger-service**: http://localhost:4000
   - **Grafana**: http://localhost:3001 (usuário: admin, senha: admin)
   - **Prometheus**: http://localhost:9090
   - **Loki**: http://localhost:3100

## Observabilidade
- Logs dos microserviços são enviados ao logger-service e armazenados no Loki.
- Métricas de requisições, erros e tempo de resposta são coletadas por Prometheus e podem ser visualizadas no Grafana.
- O arquivo `prometheus/prometheus.yml` já está configurado para coletar métricas dos serviços principais.

## Dicas e Solução de Problemas
- Se algum container não subir, verifique as mensagens de erro no terminal e nos logs do Docker.
- Certifique-se de que as portas não estão ocupadas por outros processos.
- Para reconstruir tudo do zero, execute:
  ```bash
  docker compose down --volumes --remove-orphans
  docker compose up --build
  ```
- Para instalar dependências manualmente em algum serviço:
  ```bash
  cd <servico>
  npm install
  ```

## Scripts de Teste
- O diretório `scripts/` contém exemplos para simular tráfego e gerar logs/métricas para demonstração.