import { eq } from "drizzle-orm";
import { attachment } from "$lib/db/schema";
import { uuid } from "$lib/utils/ids";
import type { DB } from "$lib/db";

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB hard cap; tighten per template later

const ALLOWED_PREFIXES = ["image/", "application/pdf", "audio/"];

function isAllowed(mime: string): boolean {
	return ALLOWED_PREFIXES.some((p) => mime.startsWith(p) || mime === p);
}

export interface UploadResult {
	id: string;
	r2Key: string;
	size: number;
	mime: string;
}

/**
 * Streams a `File` into R2 and records an attachment row.
 *
 * Storage layout: `responses/<responseId>/<uuid>-<sanitized-name>`. Keeping a
 * stable per-response prefix makes cascade deletes and folder listing cheap.
 */
export async function putAttachment(
	r2: R2Bucket,
	db: DB,
	opts: { file: File; responseId?: string | null; clinicId: string }
): Promise<UploadResult> {
	const { file, responseId, clinicId } = opts;

	if (file.size > MAX_FILE_BYTES) throw new Error(`File too large (max ${MAX_FILE_BYTES} bytes)`);
	if (!isAllowed(file.type))
		throw new Error(`Unsupported file type: ${file.type || "(unknown)"}`);

	const safeName = file.name.replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 64);
	const key = responseId
		? `responses/${responseId}/${uuid()}-${safeName}`
		: `unbound/${clinicId}/${uuid()}-${safeName}`;

	await r2.put(key, file.stream(), {
		httpMetadata: { contentType: file.type }
	});

	const id = uuid();
	await db.insert(attachment).values({
		id,
		responseId: responseId ?? null,
		r2Key: key,
		originalName: safeName,
		mime: file.type,
		size: file.size
	});

	return { id, r2Key: key, size: file.size, mime: file.type };
}

/**
 * Fetches an attachment row + its R2 object. Returns null when either is missing.
 */
export async function getAttachment(
	r2: R2Bucket,
	db: DB,
	id: string
): Promise<{ object: R2ObjectBody; mime: string; originalName: string | null } | null> {
	const rows = await db
		.select({ r2Key: attachment.r2Key, mime: attachment.mime, originalName: attachment.originalName })
		.from(attachment)
		.where(eq(attachment.id, id))
		.limit(1);
	if (rows.length === 0) return null;

	const obj = await r2.get(rows[0].r2Key);
	if (!obj) return null;

	return { object: obj, mime: rows[0].mime, originalName: rows[0].originalName };
}

/**
 * Deletes the R2 object and its attachment row. Idempotent.
 */
export async function deleteAttachment(r2: R2Bucket, db: DB, id: string): Promise<void> {
	const rows = await db
		.select({ r2Key: attachment.r2Key })
		.from(attachment)
		.where(eq(attachment.id, id))
		.limit(1);
	if (rows.length === 0) return;
	await r2.delete(rows[0].r2Key);
	await db.delete(attachment).where(eq(attachment.id, id));
}
