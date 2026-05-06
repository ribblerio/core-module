import { db } from '../db/client.js';
import { auditLog, type NewAuditLogEntry } from '../db/schema/core/index.js';

export async function logAudit(entry: NewAuditLogEntry): Promise<void> {
  await db.insert(auditLog).values(entry);
}
