import { error } from '@sveltejs/kit';

/*
* Makes these functions available in 'locals' so we can use them in load() or other server functions
*/
export function securityHandler(event) {
    const session = event.locals.session;

    return {
        /**
         * Checks if the user is authenticated
         * @throws 401 error if user is not authenticated
         */
        requireAuth: () => {
            if (!session || !session.user) {
                error(401, 'Unauthorized: Please sign in to access this resource');
            }
            return session.user;
        },

        /**
         * Checks if user is an admin
         * @throws 403 error if user is not an admin
         */
        // I DON'T KNOW IF THIS WORKS, UNTESTED (we don't need admin user so far)
        requireAdmin: () => {
            const authenticatedUser = requireAuth();
            if (!session.user.isAdmin) {
                error(403, 'Forbidden: Admin access required');
            }
            return authenticatedUser;
        },

        /**
         * Gets the current user (may be undefined if not authenticated)
         */
        getUser: () => session?.user || null,

        getSession: () => session
    };

    // Helper so admin doesn't have to repeat this code
    function requireAuth() {
        if (!session || !session.user) {
            error(401, 'Unauthorized: Please sign in to access this resource');
        }
        return session.user;
    }
}