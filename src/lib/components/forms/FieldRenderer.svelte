<script lang="ts">
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
	import { Textarea } from "@/components/ui/textarea";
	import { Button } from "@/components/ui/button";
	import { Checkbox } from "@/components/ui/checkbox";
	import * as RadioGroup from "@/components/ui/radio-group";
	import type { FormField } from "$lib/types/forms";
	import type { AnswerValue } from "$lib/types";

	type Variant = "compact" | "kiosk";

	interface Props {
		field: FormField;
		value: AnswerValue;
		onChange: (v: AnswerValue) => void;
		error?: string;
		variant?: Variant;
		disabled?: boolean;
	}

	let { field, value, onChange, error, variant = "compact", disabled = false }: Props = $props();

	const isKiosk = variant === "kiosk";
	const labelClass = isKiosk ? "text-2xl font-semibold" : "text-sm font-medium";
	const inputSize = isKiosk ? "h-14 text-xl" : "";
	const buttonSize = isKiosk ? "h-16 text-lg" : "";

	function toggleChecked(opt: string, checked: boolean | "indeterminate") {
		const arr = Array.isArray(value) ? [...(value as string[])] : [];
		if (checked === true) {
			if (!arr.includes(opt)) arr.push(opt);
		} else {
			const i = arr.indexOf(opt);
			if (i >= 0) arr.splice(i, 1);
		}
		onChange(arr);
	}
</script>

<div class="space-y-3" data-field-id={field.id}>
	{#if field.type === "section_header"}
		<div class="mt-6">
			<h2 class="text-lg font-bold">{field.text}</h2>
			{#if field.placeholder}
				<p class="text-muted-foreground text-sm">{field.placeholder}</p>
			{/if}
		</div>
	{:else}
		<Label class={labelClass}>
			{field.text}
			{#if field.required}<span class="text-destructive">*</span>{/if}
		</Label>

		{#if field.type === "short_answer"}
			<Input
				class={inputSize}
				placeholder={field.placeholder ?? ""}
				value={(value as string) ?? ""}
				oninput={(e) => onChange((e.currentTarget as HTMLInputElement).value)}
				{disabled}
			/>
		{:else if field.type === "long_text"}
			<Textarea
				rows={isKiosk ? 6 : 3}
				placeholder={field.placeholder ?? ""}
				value={(value as string) ?? ""}
				oninput={(e) => onChange((e.currentTarget as HTMLTextAreaElement).value)}
				{disabled}
			/>
		{:else if field.type === "number"}
			<Input
				type="number"
				class={inputSize}
				placeholder={field.placeholder ?? ""}
				value={value === null || value === undefined ? "" : String(value)}
				min={field.numberConfig?.min}
				max={field.numberConfig?.max}
				step={field.numberConfig?.wholeNumbersOnly ? 1 : "any"}
				oninput={(e) => {
					const raw = (e.currentTarget as HTMLInputElement).value;
					onChange(raw === "" ? null : Number(raw));
				}}
				{disabled}
			/>
		{:else if field.type === "date"}
			<Input
				type="date"
				class={inputSize}
				value={typeof value === "number"
					? new Date(value).toISOString().slice(0, 10)
					: (value as string) ?? ""}
				oninput={(e) => {
					const raw = (e.currentTarget as HTMLInputElement).value;
					onChange(raw === "" ? null : new Date(raw).getTime());
				}}
				{disabled}
			/>
		{:else if field.type === "boolean"}
			<div class="grid grid-cols-2 gap-3">
				<Button
					type="button"
					variant={value === true ? "default" : "outline"}
					class={buttonSize}
					onclick={() => onChange(true)}
					{disabled}
				>
					Yes
				</Button>
				<Button
					type="button"
					variant={value === false ? "default" : "outline"}
					class={buttonSize}
					onclick={() => onChange(false)}
					{disabled}
				>
					No
				</Button>
			</div>
		{:else if field.type === "multiple_choice"}
			<RadioGroup.Root
				value={(value as string) ?? ""}
				onValueChange={(v) => onChange(v)}
				class={isKiosk ? "space-y-3" : "space-y-2"}
			>
				{#each field.options ?? [] as opt, i (opt + i)}
					<label class="flex items-center gap-3 rounded border p-3 hover:bg-muted/40">
						<RadioGroup.Item value={opt} id="{field.id}-{i}" />
						<span class={isKiosk ? "text-lg" : ""}>{opt}</span>
					</label>
				{/each}
			</RadioGroup.Root>
		{:else if field.type === "select"}
			<select
				class="bg-background w-full rounded border p-2 {inputSize}"
				value={(value as string) ?? ""}
				onchange={(e) => onChange((e.currentTarget as HTMLSelectElement).value)}
				{disabled}
			>
				<option value="">Choose...</option>
				{#each field.options ?? [] as opt, i (opt + i)}
					<option value={opt}>{opt}</option>
				{/each}
			</select>
		{:else if field.type === "checkbox"}
			<div class={isKiosk ? "space-y-3" : "space-y-2"}>
				{#each field.options ?? [] as opt, i (opt + i)}
					{@const checked = Array.isArray(value) && (value as string[]).includes(opt)}
					<label class="flex items-center gap-3 rounded border p-3 hover:bg-muted/40">
						<Checkbox
							{checked}
							onCheckedChange={(c) => toggleChecked(opt, c)}
							{disabled}
						/>
						<span class={isKiosk ? "text-lg" : ""}>{opt}</span>
					</label>
				{/each}
			</div>
		{:else if field.type === "file_upload"}
			<Input
				type="file"
				class={inputSize}
				onchange={async (e) => {
					const file = (e.currentTarget as HTMLInputElement).files?.[0];
					if (!file) return;
					// Caller wires this up later; for now we store filename only.
					onChange({ filename: file.name, size: file.size } as unknown as AnswerValue);
				}}
				{disabled}
			/>
			{#if value && typeof value === "object" && "filename" in (value as object)}
				<p class="text-muted-foreground text-xs">
					Selected: {(value as { filename: string }).filename}
				</p>
			{/if}
		{:else}
			<p class="text-muted-foreground text-xs italic">
				Unsupported field type: {field.type}
			</p>
		{/if}

		{#if error}
			<p class="text-destructive text-xs">{error}</p>
		{/if}
	{/if}
</div>
