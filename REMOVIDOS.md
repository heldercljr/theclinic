# Itens Removidos

Este documento lista as principais remoções realizadas no projeto, com explicação dos motivos para cada grupo de mudanças.



**1. Remoção de lógica e dependências relacionadas à auditoria/AuditType**
- Foram removidos trechos de código, tabelas e enumerações relacionados à auditoria (AuditType, AuditRepository, tabelas de auditoria no banco).
- **Motivo:** A auditoria foi centralizada no serviço de logger, tornando redundante manter lógica e persistência separada para auditoria. Agora, logs e eventos de auditoria são enviados ao logger-service e armazenados/consultados via Loki/Grafana.

**Antes:**
```typescript
// Uso de AuditType e AuditRepository
const audit = await AuditRepository.create({ ... });
```
**Depois:**
```typescript
// Uso do logger-service para registrar eventos
logger.info("Evento registrado", { ... });
```

---

**2. Remoção de código duplicado de logging/auditoria**
- Foram removidos métodos, imports e arquivos que duplicavam a lógica de registro de logs/auditoria nos microserviços.
- **Motivo:** O logger-service passou a ser o único responsável por centralizar logs e auditoria, evitando duplicidade.

**Antes:**
```typescript
// Cada serviço tinha sua própria lógica de auditoria
import { AuditType } from "@prisma/client";
```
**Depois:**
```typescript
// Todos os serviços usam o logger-service
import logger from "../shared/logger/logger.service";
```

---

**3. Remoção de tabelas e migrations de auditoria no banco**
- Foram removidas tabelas e migrations relacionadas à auditoria do schema.prisma e dos scripts SQL.
- **Motivo:** Persistência de logs/auditoria foi migrada para Loki, eliminando a necessidade de manter essas tabelas no banco relacional.

**Antes:**
```prisma
model Audit {
  id        Int      @id @default(autoincrement())
  type      AuditType
  // ...
}
```
**Depois:**
```prisma
// Tabela Audit removida do schema.prisma
```
