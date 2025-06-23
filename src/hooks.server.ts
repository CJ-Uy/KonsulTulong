import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks"; // <-- Import sequence
import { paraglideMiddleware } from "$lib/paraglide/server";
import { auth } from "$lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";

// better-auth handler
const handleAuthentication: Handle = async ({ event, resolve }) => {
	return svelteKitHandler({ event, resolve, auth });
};

// Paraglide handler
const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace("%paraglide.lang%", locale)
		});
	});

// Use sequence to chain the handlers together.
// SvelteKit will run them in this order for every request.
export const handle = sequence(handleParaglide, handleAuthentication);
