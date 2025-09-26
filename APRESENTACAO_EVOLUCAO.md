### Evolução da Aplicação - De Monolito para Arquitetura Distribuída

## 1. Introdução
- Contexto: Sistema de gestão para clínicas médicas.
- Desafio inicial: Aplicação monolítica, difícil de escalar, manter e evoluir.

## 2. Monolito
- Todas as funcionalidades (autenticação, negócio, logs, métricas) em um único projeto.
- Banco de dados único.
- Deploy e manutenção centralizados.
- Problemas:
  - Dificuldade de escalar partes específicas.
  - Deploys arriscados (afetam tudo).
  - Baixa observabilidade e rastreabilidade.
  - Acoplamento forte entre módulos.

## 3. Processo de Evolução
- Identificação dos domínios principais: autenticação, negócio, auditoria/logs, métricas.
- Separação dos módulos em microserviços independentes:
  - **backend**: regras de negócio e dados.
  - **auth-service**: autenticação e autorização.
  - **logger-service**: centralização de logs.
  - **grafana/loki/prometheus**: observabilidade e monitoramento.
- Definição de contratos de comunicação (REST, HTTP, endpoints).
- Criação de Dockerfiles e uso de Docker Compose para orquestração.
- Adição de variáveis de ambiente para configuração flexível.

## 4. Arquitetura Distribuída
- Cada serviço roda em seu próprio container.
- Comunicação via HTTP/REST.
- Logs centralizados no Loki, visualizados pelo Grafana.
- Métricas expostas via Prometheus e visualizadas no Grafana.
- Banco de dados isolado e acessível por serviços autorizados.
- Possibilidade de escalar serviços individualmente.

## 5. Benefícios da Nova Arquitetura
- Escalabilidade: cada serviço pode ser escalado conforme demanda.
- Manutenção facilitada: atualizações e correções isoladas.
- Observabilidade: logs e métricas centralizados, fácil monitoramento.
- Tolerância a falhas: problemas em um serviço não afetam os demais.
- Flexibilidade para evoluir e adicionar novos serviços (ex: mensageria).

## 6. Pontos de Atenção e Futuro
- Garantia de entrega dos logs (buffer, retry, fallback).
- Implementação de mensageria para desacoplamento e robustez.
- Monitoramento contínuo dos serviços e alertas.

## 7. Demonstração
- Subida dos containers via Docker Compose.
- Visualização de logs e métricas no Grafana.
- Simulação de tráfego e geração de dados para observabilidade.

## 8. Conclusão
- Evolução do monolito para arquitetura distribuída trouxe ganhos claros em escalabilidade, manutenção e observabilidade.

---

[Voltar para o README](./README.md)

