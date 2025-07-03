<script lang="ts">
	// import Button from "@/components/ui/button/button.svelte";
	// import Progress from "@/components/ui/progress/progress.svelte";
	// import * as Select from "@/components/ui/select";

	import FormStart from "@/components/form/FormStart.svelte";
	import FormMain from "@/components/form/FormMain.svelte";
	let isAtStart = false;
</script>

<main>
	{#if isAtStart}
		<FormStart />
	{:else}
		<FormMain />
	{/if}
</main>
