import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			routes: {
				include: ["/*"],
				exclude: ["<all>"]
			},
			platformProxy: {
				configPath: "wrangler.jsonc",
				persist: true
			}
		}),
		alias: {
			"@/*": "./src/lib/*"
		}
	}
};

export default config;
