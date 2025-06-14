<script>
	import { goto } from "$app/navigation";
	import { Button } from "$lib/components/ui/button/index.js";
    import NavBar from "@/components/landing/navBar.svelte";
</script>

<NavBar />

<div class="flex w-[100%] flex-col items-center justify-center">
	<h1 class="text-primary mt-[10%] text-5xl md:text-8xl font-semibold">KonsulTulong</h1>
	<div class="my-20 flex gap-5">
		<Button size="3xl" onclick={() => goto("/clinic")}>Start</Button>
	</div>
</div>
