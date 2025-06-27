import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks"; // <-- Import sequence
import { paraglideMiddleware } from "$lib/paraglide/server";
import { auth } from "$lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { securityHandler } from "$lib/security";

// better-auth handler
const handleAuthentication: Handle = async ({ event, resolve }) => {
	const isProtectedRoute = event.url.pathname.startsWith('/dashboard') ||
        event.url.pathname.startsWith('/registered')
    try {
        const session = await auth.api.getSession({
            headers: event.request.headers
        })

        event.locals.session = session;

        if (isProtectedRoute && (!session || !session.user)) {
            // Redirect to login
            return new Response(null, {
                status: 302,
                headers: {
                    'Location': '/login'
                }
            });
        }

    } catch (error) {
        console.log(error)

        if (isProtectedRoute) {
            // Redirect to login or show an error
            return new Response(null, {
                status: 302,
                headers: {
                    'Location': '/sign-in'  // Optional redirect
                }
            });
        }
    }

    // // adds the security functions to locals to make it accessible in other server side code
    event.locals.security = securityHandler(event)

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
