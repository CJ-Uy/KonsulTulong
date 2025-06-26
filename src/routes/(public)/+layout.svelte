<script lang="ts">
	import "../../app.css";
	import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
	import { page } from "$app/state";

	let { children } = $props();
</script>

<header class="w-full flex items-center justify-end h-12 border-b px-4">
	<NavigationMenu.Root>
		<NavigationMenu.List>
			<NavigationMenu.Item>
				{#if page.url.pathname === "/(public)" || page.url.pathname === "/"}
					<NavigationMenu.Link href="/landing">For Clinics</NavigationMenu.Link>
				{:else}
					<NavigationMenu.Link href="/">For Patients</NavigationMenu.Link>
				{/if}
			</NavigationMenu.Item>
		</NavigationMenu.List>
	</NavigationMenu.Root>
</header>

{@render children()}

