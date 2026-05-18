<script lang="ts">
	import { Button } from "@/components/ui/button";
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
	import { Textarea } from "@/components/ui/textarea";
	import { Checkbox } from "@/components/ui/checkbox";
	import { toast } from "svelte-sonner";
	import FormFiller from "$lib/components/forms/FormFiller.svelte";
	import { defaultField, ALL_FIELD_TYPES } from "$lib/forms/defaults";
	import type { FormField, FieldType } from "$lib/types/forms";

	let { data } = $props();

	let name = $state(data.template.name);
	let description = $state(data.template.description ?? "");
	let isActive = $state(data.template.isActive);
	let assistedOnly = $state(data.template.assistedOnly);
	let fields = $state<FormField[]>(
		((data.template.questions ?? []) as FormField[]).map((f, i) => ({
			...f,
			order: i,
			id: f.id ?? `field_${i}`
		}))
	);

	let selectedIdx = $state<number | null>(fields.length > 0 ? 0 : null);
	const selected = $derived(selectedIdx !== null ? fields[selectedIdx] : null);

	let saving = $state(false);

	function addField(type: FieldType) {
		const field = defaultField(type, fields.length);
		fields = [...fields, field];
		selectedIdx = fields.length - 1;
	}

	function removeField(i: number) {
		fields = fields.filter((_, j) => j !== i).map((f, j) => ({ ...f, order: j }));
		if (selectedIdx === i) selectedIdx = null;
		else if (selectedIdx !== null && selectedIdx > i) selectedIdx -= 1;
	}

	function move(i: number, delta: number) {
		const j = i + delta;
		if (j < 0 || j >= fields.length) return;
		const next = [...fields];
		[next[i], next[j]] = [next[j], next[i]];
		fields = next.map((f, k) => ({ ...f, order: k }));
		if (selectedIdx === i) selectedIdx = j;
		else if (selectedIdx === j) selectedIdx = i;
	}

	function updateSelected(patch: Partial<FormField>) {
		if (selectedIdx === null) return;
		const next = [...fields];
		next[selectedIdx] = { ...next[selectedIdx], ...patch };
		fields = next;
	}

	function addOption() {
		if (!selected) return;
		const opts = [...(selected.options ?? []), `Option ${(selected.options?.length ?? 0) + 1}`];
		updateSelected({ options: opts });
	}

	function setOption(i: number, value: string) {
		if (!selected || !selected.options) return;
		const opts = [...selected.options];
		opts[i] = value;
		updateSelected({ options: opts });
	}

	function removeOption(i: number) {
		if (!selected || !selected.options) return;
		const opts = selected.options.filter((_, j) => j !== i);
		updateSelected({ options: opts });
	}

	async function save() {
		saving = true;
		const res = await fetch(`/api/templates/${data.template.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name,
				description,
				questions: fields,
				isActive,
				assistedOnly
			})
		});
		saving = false;
		if (!res.ok) {
			toast.error("Save failed");
			return;
		}
		toast.success("Saved");
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<a href="/dashboard/forms" class="text-muted-foreground text-sm underline">Back to forms</a>
			<h1 class="text-2xl font-bold">Edit form</h1>
		</div>
		<div class="flex gap-2">
			<a href={`/dashboard/forms/${data.template.id}/preview`}>
				<Button variant="outline">Preview</Button>
			</a>
			<Button onclick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
		</div>
	</div>

	<div class="grid gap-4 lg:grid-cols-2">
		<div class="space-y-2">
			<Label for="t-name">Name</Label>
			<Input id="t-name" bind:value={name} />
		</div>
		<div class="space-y-2">
			<Label for="t-desc">Description</Label>
			<Input id="t-desc" bind:value={description} />
		</div>
		<div class="flex items-center gap-2">
			<Checkbox bind:checked={isActive} id="t-active" />
			<Label for="t-active">Active (patients can fill it)</Label>
		</div>
		<div class="flex items-center gap-2">
			<Checkbox bind:checked={assistedOnly} id="t-assisted" />
			<Label for="t-assisted">Assisted-only (staff fill on behalf)</Label>
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-[1fr_2fr_1fr]">
		<aside class="space-y-2">
			<h2 class="text-sm font-semibold">Add field</h2>
			{#each ALL_FIELD_TYPES as t (t.type)}
				<Button class="w-full justify-start" variant="outline" onclick={() => addField(t.type)}>
					{t.label}
				</Button>
			{/each}
		</aside>

		<section class="space-y-2">
			<h2 class="text-sm font-semibold">Fields ({fields.length})</h2>
			{#if fields.length === 0}
				<p class="text-muted-foreground text-sm">Empty form. Add a field on the left.</p>
			{:else}
				<ul class="space-y-2">
					{#each fields as field, i (field.id)}
						<li
							class="cursor-pointer rounded border p-3 {selectedIdx === i
								? 'border-primary bg-muted/40'
								: ''}"
							onclick={() => (selectedIdx = i)}
							onkeydown={(e) => e.key === "Enter" && (selectedIdx = i)}
							role="button"
							tabindex="0"
						>
							<div class="flex items-center justify-between gap-2">
								<div>
									<p class="text-sm font-medium">{field.text || "(untitled)"}</p>
									<p class="text-muted-foreground text-xs">{field.type}{field.required ? " · required" : ""}</p>
								</div>
								<div class="flex gap-1">
									<button class="text-xs underline" onclick={(e) => { e.stopPropagation(); move(i, -1); }}>up</button>
									<button class="text-xs underline" onclick={(e) => { e.stopPropagation(); move(i, 1); }}>down</button>
									<button class="text-destructive text-xs underline" onclick={(e) => { e.stopPropagation(); removeField(i); }}>delete</button>
								</div>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<aside class="space-y-3">
			<h2 class="text-sm font-semibold">Field settings</h2>
			{#if selected}
				<div class="space-y-3">
					<div class="space-y-1">
						<Label class="text-xs">Question text</Label>
						<Textarea
							rows={2}
							value={selected.text}
							oninput={(e) =>
								updateSelected({ text: (e.currentTarget as HTMLTextAreaElement).value })}
						/>
					</div>
					{#if selected.type !== "section_header"}
						<div class="space-y-1">
							<Label class="text-xs">Placeholder / help</Label>
							<Input
								value={selected.placeholder ?? ""}
								oninput={(e) =>
									updateSelected({
										placeholder: (e.currentTarget as HTMLInputElement).value
									})}
							/>
						</div>
						<div class="flex items-center gap-2">
							<Checkbox
								checked={selected.required ?? false}
								onCheckedChange={(c) => updateSelected({ required: c === true })}
							/>
							<Label class="text-xs">Required</Label>
						</div>
					{/if}

					{#if selected.type === "multiple_choice" || selected.type === "checkbox" || selected.type === "select"}
						<div class="space-y-1">
							<Label class="text-xs">Options</Label>
							{#each selected.options ?? [] as opt, i (i)}
								<div class="flex gap-2">
									<Input
										value={opt}
										oninput={(e) =>
											setOption(i, (e.currentTarget as HTMLInputElement).value)}
									/>
									<Button size="sm" variant="outline" onclick={() => removeOption(i)}>x</Button>
								</div>
							{/each}
							<Button size="sm" variant="outline" onclick={addOption}>+ Option</Button>
						</div>
					{/if}

					{#if selected.type === "number"}
						<div class="space-y-1">
							<Label class="text-xs">Min</Label>
							<Input
								type="number"
								value={selected.numberConfig?.min ?? ""}
								oninput={(e) => {
									const raw = (e.currentTarget as HTMLInputElement).value;
									updateSelected({
										numberConfig: {
											...(selected!.numberConfig ?? {
												validationType: "none",
												wholeNumbersOnly: false,
												allowNegative: true
											}),
											min: raw === "" ? undefined : Number(raw),
											validationType: "range"
										}
									});
								}}
							/>
						</div>
						<div class="space-y-1">
							<Label class="text-xs">Max</Label>
							<Input
								type="number"
								value={selected.numberConfig?.max ?? ""}
								oninput={(e) => {
									const raw = (e.currentTarget as HTMLInputElement).value;
									updateSelected({
										numberConfig: {
											...(selected!.numberConfig ?? {
												validationType: "none",
												wholeNumbersOnly: false,
												allowNegative: true
											}),
											max: raw === "" ? undefined : Number(raw),
											validationType: "range"
										}
									});
								}}
							/>
						</div>
					{/if}
				</div>
			{:else}
				<p class="text-muted-foreground text-xs">Select a field to edit it.</p>
			{/if}
		</aside>
	</div>

	<div class="border-t pt-6">
		<h2 class="mb-3 text-sm font-semibold">Live preview (compact mode)</h2>
		<div class="rounded border p-4">
			<FormFiller {fields} variant="compact" />
		</div>
	</div>
</div>
