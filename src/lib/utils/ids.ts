/**
 * Crockford base32 alphabet (omits I, L, O, U to avoid visual confusion).
 */
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * Generates a short, human-friendly random code using Crockford base32.
 * Length 6 = ~30 bits = ~1 billion combos. Plenty for clinic codes; collision-check at insert.
 */
export function shortCode(length = 6): string {
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	let out = "";
	for (const b of bytes) out += CROCKFORD[b % 32];
	return out;
}

/**
 * Generates a UUID v4 string.
 */
export function uuid(): string {
	return crypto.randomUUID();
}

/**
 * Returns today's date in `YYYY-MM-DD` in Asia/Manila timezone.
 *
 * Used as the queue-day partition key. Reset happens at midnight Manila.
 */
export function manilaDateString(now: Date = new Date()): string {
	const fmt = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Manila",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	});
	return fmt.format(now);
}
