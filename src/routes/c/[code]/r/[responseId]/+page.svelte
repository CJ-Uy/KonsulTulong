<script lang="ts">
	import { Button } from "@/components/ui/button";
	import FormFiller from "$lib/components/forms/FormFiller.svelte";
	import { goto } from "$app/navigation";
	import { toast } from "svelte-sonner";
	import type { FormField } from "$lib/types/forms";
	import type { AnswerValue } from "$lib/types";

	let { data } = $props();

	const fields = (data.template.questions ?? []) as FormField[];
	const initial = (data.response.values ?? {}) as Record<string, AnswerValue>;

	let filler: FormFiller | undefined = $state();
	let submitting = $state(false);
	let saveTimer: ReturnType<typeof setTimeout> | null = null;
	let lastValues: Record<string, AnswerValue> = { ...initial };

	function scheduleSave(values: Record<string, AnswerValue>) {
		lastValues = values;
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(saveDraft, 800);
	}

	async function saveDraft() {
		await fetch(`/api/responses/${data.response.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ values: lastValues })
		}).catch(() => {});
	}

	async function finalize() {
		if (!filler) return;
		const valid = filler.validate();
		if (!valid) {
			toast.error("Please answer the required questions.");
			return;
		}
		submitting = true;
		const values = filler.getValues();
		const res = await fetch(`/api/responses/${data.response.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ values, finalize: true })
		});
		submitting = false;
		if (!res.ok) {
			toast.error("Could not submit. Please try again.");
			return;
		}
		goto(`/c/${data.clinic.code}/done/${data.response.id}`);
	}
</script>

<main class="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
	<header class="mb-6">
		<p class="text-muted-foreground text-xs uppercase tracking-wider">{data.clinic.name}</p>
		<h1 class="text-2xl font-bold">{data.template.name}</h1>
		<p class="text-muted-foreground mt-1 text-sm">For: {data.response.patientName}</p>
	</header>

	{#if fields.length === 0}
		<div class="border-muted rounded border border-dashed p-6 text-center text-sm">
			This form has no questions yet.
		</div>
	{:else}
		<FormFiller
			bind:this={filler}
			{fields}
			initialValues={initial}
			variant="kiosk"
			onChange={scheduleSave}
		/>
	{/if}

	<div class="mt-10 flex gap-3">
		<a href={`/c/${data.clinic.code}`} class="flex-1">
			<Button variant="outline" class="w-full">Cancel</Button>
		</a>
		<Button class="flex-1" onclick={finalize} disabled={submitting || fields.length === 0}>
			{submitting ? "Submitting..." : "Submit"}
		</Button>
	</div>
</main>
