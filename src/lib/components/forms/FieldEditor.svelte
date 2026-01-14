<script lang="ts">
	import type { FormField } from "$lib/types/forms";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Label } from "$lib/components/ui/label";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import OptionsEditor from "./OptionsEditor.svelte";
	import NumberConfigEditor from "./NumberConfigEditor.svelte";
	import DisplayLogicEditor from "./DisplayLogicEditor.svelte";

	interface Props {
		field: FormField;
		allFields: FormField[];
		onUpdate: (updates: Partial<FormField>) => void;
	}

	let { field, allFields, onUpdate }: Props = $props();

	// Check if field type supports options
	let hasOptions = $derived(
		field.type === "multiple_choice" || field.type === "checkbox" || field.type === "select"
	);
</script>

<div class="space-y-4">
	<!-- Question Text -->
	<div class="space-y-2">
		<Label for="field-text" class="text-muted-foreground text-xs font-medium">
			{field.type === "section_header" ? "Section Title" : "Question Text"}
		</Label>
		{#if field.type === "section_header"}
			<Input
				id="field-text"
				value={field.text}
				placeholder="Enter section title..."
				class="font-semibold"
				oninput={(e) => onUpdate({ text: e.currentTarget.value })}
			/>
		{:else}
			<Textarea
				id="field-text"
				value={field.text}
				placeholder="Enter your question..."
				class="min-h-[60px] resize-none"
				oninput={(e) => onUpdate({ text: e.currentTarget.value })}
			/>
		{/if}
	</div>

	<!-- Placeholder (for text inputs) -->
	{#if field.type === "short_answer" || field.type === "long_text" || field.type === "number"}
		<div class="space-y-2">
			<Label for="field-placeholder" class="text-muted-foreground text-xs font-medium">
				Placeholder Text
			</Label>
			<Input
				id="field-placeholder"
				value={field.placeholder || ""}
				placeholder="e.g., Enter your answer..."
				oninput={(e) => onUpdate({ placeholder: e.currentTarget.value })}
			/>
		</div>
	{/if}

	<!-- Required Toggle (not for section headers) -->
	{#if field.type !== "section_header"}
		<div class="flex items-center gap-2">
			<Checkbox
				id="field-required"
				checked={field.required === true}
				onCheckedChange={(checked) => onUpdate({ required: checked === true })}
			/>
			<Label for="field-required" class="text-sm">Required field</Label>
		</div>
	{/if}

	<!-- Options Editor -->
	{#if hasOptions}
		<OptionsEditor
			options={field.options || ["Option 1"]}
			onUpdate={(options) => onUpdate({ options })}
		/>
	{/if}

	<!-- Number Config Editor -->
	{#if field.type === "number"}
		<NumberConfigEditor
			config={field.numberConfig || { validationType: "none" }}
			onUpdate={(numberConfig) => onUpdate({ numberConfig })}
		/>
	{/if}

	<!-- Display Logic Editor -->
	{#if field.type !== "section_header" || true}
		<DisplayLogicEditor
			logic={field.displayLogic}
			{allFields}
			currentFieldId={field.id}
			onUpdate={(displayLogic) => onUpdate({ displayLogic })}
		/>
	{/if}
</div>
