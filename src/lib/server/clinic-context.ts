import { error } from "@sveltejs/kit";

/**
 * Pulls the current user + clinicId off `locals`, refusing the request if the
 * user is not authenticated or has no clinic. Returns a narrow object so the
 * caller does not have to keep null-checking the same two fields.
 */
export function requireClinic(locals: App.Locals): {
	userId: string;
	clinicId: string;
	role: NonNullable<App.Locals["user"]>["role"];
} {
	if (!locals.user) throw error(401, "Not authenticated");
	if (!locals.user.clinicId) throw error(403, "No clinic for user");
	return {
		userId: locals.user.id,
		clinicId: locals.user.clinicId,
		role: locals.user.role
	};
}

/**
 * Permission helper for routes that should only allow specific roles.
 */
export function requireRole(
	locals: App.Locals,
	roles: NonNullable<App.Locals["user"]>["role"][]
) {
	const ctx = requireClinic(locals);
	if (!roles.includes(ctx.role)) throw error(403, "Insufficient role");
	return ctx;
}
