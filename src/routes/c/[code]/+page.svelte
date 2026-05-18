<script lang="ts">
	import { Button } from "@/components/ui/button";

	let { data } = $props();

	const defaultFlow = $derived(data.flows.find((f) => f.isDefault));
</script>

<main class="mx-auto flex min-h-screen max-w-md flex-col items-center px-6 py-10">
	<div class="space-y-2 text-center">
		<p class="text-muted-foreground text-sm uppercase tracking-wider">Welcome to</p>
		<h1 class="text-3xl font-bold">{data.clinic.name}</h1>
		<p class="text-muted-foreground text-sm">Clinic code: {data.clinic.code}</p>
	</div>

	<div class="mt-10 w-full space-y-4">
		{#if data.templates.length === 0 && data.flows.length === 0}
			<div class="rounded border bg-amber-50 p-4 text-sm">
				This clinic has no active forms yet. Please check back later.
			</div>
		{:else}
			<p class="text-center text-sm">Choose a form to begin:</p>
			{#if defaultFlow}
				<a class="block" href="/c/{data.clinic.code}/flow/{defaultFlow.id}">
					<Button class="w-full">{defaultFlow.name}</Button>
				</a>
			{/if}
			{#each data.flows.filter((f) => !f.isDefault) as f (f.id)}
				<a class="block" href="/c/{data.clinic.code}/flow/{f.id}">
					<Button variant="outline" class="w-full">{f.name}</Button>
				</a>
			{/each}
			{#each data.templates as t (t.id)}
				<a class="block" href="/c/{data.clinic.code}/form/{t.id}">
					<Button variant="outline" class="w-full">{t.name}</Button>
				</a>
			{/each}
		{/if}
	</div>
</main>
