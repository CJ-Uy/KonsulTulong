import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { getDb } from "$lib/db";
import { getAuth } from "$lib/auth";

const PROTECTED_PREFIXES = ["/dashboard", "/registered"];

const handleDb: Handle = async ({ event, resolve }) => {
	event.locals.db = getDb(event.platform);
	return resolve(event);
};

const handleAuth: Handle = async ({ event, resolve }) => {
	const baseURL = event.url.origin;
	const auth = getAuth(event.platform, baseURL);

	try {
		const session = await auth.api.getSession({ headers: event.request.headers });
		if (session) {
			event.locals.user = session.user as unknown as App.Locals["user"];
			event.locals.session = {
				id: session.session.id,
				userId: session.session.userId,
				expiresAt: new Date(session.session.expiresAt)
			};
		}
	} catch {
		// no session — anonymous request
	}

	const isProtected = PROTECTED_PREFIXES.some((p) => event.url.pathname.startsWith(p));
	if (isProtected && !event.locals.user) {
		return new Response(null, { status: 302, headers: { Location: "/login" } });
	}

	return svelteKitHandler({ event, resolve, auth });
};

export const handle = sequence(handleDb, handleAuth);
