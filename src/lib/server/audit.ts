import { auditLog } from "$lib/db/schema";
import { uuid } from "$lib/utils/ids";
import type { DB } from "$lib/db";

type ActorType = "patient" | "doctor" | "secretary" | "admin" | "system";

export interface AuditEntry {
	actorType: ActorType;
	actorId?: string | null;
	clinicId: string;
	action: string;
	resourceType?: string;
	resourceId?: string;
	metadata?: Record<string, unknown>;
}

/**
 * Best-effort audit logger. Writes a row; never throws (the caller continues
 * even if audit insert fails so a logging glitch can't break a real action).
 */
export async function audit(db: DB, entry: AuditEntry): Promise<void> {
	try {
		await db.insert(auditLog).values({
			id: uuid(),
			actorType: entry.actorType,
			actorId: entry.actorId ?? null,
			clinicId: entry.clinicId,
			action: entry.action,
			resourceType: entry.resourceType ?? null,
			resourceId: entry.resourceId ?? null,
			metadata: entry.metadata ?? null,
			at: new Date()
		});
	} catch (e) {
		console.warn("audit log insert failed:", e instanceof Error ? e.message : e);
	}
}
