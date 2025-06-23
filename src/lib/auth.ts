import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg"
	}),
	emailAndPassword: {  
		enabled: true,
		minPasswordLength: 8,
		maxPasswordLength: 64,
		autoSignIn: true,
		account: {
		  accountLinking: {
			enabled: true,
		  },
		}
	  },
	  session: {
		expiresIn: 30 * 24 * 60 * 60, // 30 Days. This refers to how long a user stays logged in (in seconds). Can be configured.
	  },
	  socialProviders: { 
		  google: { 
			clientId: process.env.GOOGLE_CLIENT_ID as string, 
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
		  }, 
		  facebook: { 
            clientId: process.env.FACEBOOK_CLIENT_ID as string, 
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string, 
        }, 
	  }, 
});
