<script lang="ts">
	import Button from "@/components/ui/button/button.svelte";
	import Progress from "@/components/ui/progress/progress.svelte";
	import * as Select from "@/components/ui/select";

	let selectedValue = "";
</script>

<main>
	<section
		class="relative mx-5 my-10 flex h-[75vh] flex-col rounded border border-zinc-400 text-center"
	>
		<Progress class="mx-auto mt-8 h-5 w-9/10 border border-zinc-400 bg-teal-400" />

		<div
			class="absolute inset-0 mt-9 flex flex-shrink flex-col items-center justify-center space-y-7 px-10"
		>
			<button class="mb-1 flex w-[10%] justify-center"
				><img class="max-w-10" src="/speaker-icon.svg" alt="Speaker icon" /></button
			>
			<p class="text-2xl font-bold">Have you experienced a heart attack recently?</p>
			<button class="flex w-[40%] justify-center"
				><img class="max-w-30" src="/heart-attack.svg" alt="Man having a heart attack" /></button
			>
			<Button class="mx-auto h-16 w-60 text-xl font-bold">Yes</Button>
			<Button class="mx-auto h-16 w-60 text-xl font-bold">No</Button>
		</div>
	</section>
	<div class="flex h-[15vh] justify-center space-x-8">
		<Button class="text-md border-2 border-slate-800 bg-transparent px-8 py-5 text-center"
			>&lt;- Back</Button
		>
		<Button class="text-md border-2 border-slate-800 bg-transparent px-8 py-5 text-center"
			>Next -&gt</Button
		>
	</div>
</main>
