<script lang="ts">
	import { onMount } from "svelte";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import VerticalProgress from "$lib/components/VerticalProgress.svelte";

	let value = $state(13);

	onMount(() => {
		const timer = setTimeout(() => (value = 66), 500);
		return () => clearTimeout(timer);
	});

	const navNodes = [
		{ id: "section1Node", label: "I" },
		{ id: "section2Node", label: "II" },
		{ id: "section3Node", label: "III" },
		{ id: "sectioneEndNode", label: "END" }
	];
</script>

<main
	class="sticky top-2 z-1 mx-2 my-10 flex items-center justify-center rounded border border-zinc-400 bg-stone-100 px-5 py-10 md:top-25 md:mx-10 md:h-[80vh] md:py-10"
>
	<!-- Mobile Progress Bar -->
	<Progress {value} max={100} class="z-1 w-full items-center justify-center md:hidden" />

	<!-- Widescreen Progress Bar -->
	<VerticalProgress {value} max={100} class="z-1 flex h-full w-3" />

	<div class="absolute inset-4 z-2 flex items-center justify-between md:flex-col md:py-4">
		{#each navNodes as navNode}
			<div
				id={navNode.id}
				class="flex h-15 w-15 items-center justify-center rounded-full border-2 border-zinc-400 bg-stone-100"
			>
				<p class="text-center">{navNode.label}</p>
			</div>
		{/each}
	</div>
</main>
