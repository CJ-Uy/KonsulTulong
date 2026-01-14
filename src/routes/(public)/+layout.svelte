<script lang="ts">
	import "../../app.css";
	import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
	import { page } from "$app/state";
	import Footer from "$lib/components/Footer.svelte";
	import Header from "$lib/components/Header.svelte";

	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<Header />

	<div class="flex flex-1 flex-col">
		{@render children()}
	</div>

	<Footer />
</div>
