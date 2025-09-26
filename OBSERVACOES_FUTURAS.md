# Observações para Implementações Futuras

## O que não foi feito

- **Garantia de entrega dos logs:** Atualmente, o envio dos logs para o serviço de logs (Loki) é feito de forma assíncrona e não bloqueante. Se houver falha de rede, indisponibilidade do serviço ou erro de configuração, os logs podem ser perdidos, pois não há mecanismo de retry, buffer local ou fallback.
- **Mensageria entre microserviços:** A comunicação entre os microserviços (backend, auth-service, logger-service) é feita diretamente via HTTP. Não foi implementado um sistema de mensageria (ex: RabbitMQ, Kafka) para desacoplar os serviços, garantir entrega de mensagens, escalabilidade e tolerância a falhas.

## Como implementar futuramente

### Garantia de entrega dos logs
- Implementar um buffer local (fila) para armazenar logs temporariamente em caso de falha no envio.
- Adicionar lógica de retry para tentar reenviar logs que falharam.
- Registrar erros de envio em um arquivo local para posterior análise.
- Monitorar o serviço de logs e disparar alertas em caso de indisponibilidade.
- Utilizar bibliotecas que suportem estratégias de fallback e persistência temporária.

### Mensageria entre microserviços
- Adicionar um broker de mensagens (RabbitMQ, Kafka, NATS, etc.) ao ambiente Docker Compose.
- Refatorar os microserviços para publicar eventos e consumir mensagens via filas, ao invés de chamadas HTTP diretas.
- Utilizar mensageria para logs, auditoria, notificações, processamento assíncrono e integração entre serviços.
- Garantir persistência, ordenação e tolerância a falhas nas mensagens trocadas.
- Monitorar o broker de mensagens e implementar alertas para problemas de entrega ou processamento.

---

Essas melhorias aumentam a confiabilidade, escalabilidade e observabilidade da aplicação, tornando-a mais robusta para ambientes produtivos e cenários de alta demanda.

[Voltar para o README](./README.md)

