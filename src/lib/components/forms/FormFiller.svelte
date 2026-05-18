<script lang="ts">
	import FieldRenderer from "./FieldRenderer.svelte";
	import { shouldShow } from "$lib/forms/display-logic";
	import { validateForm } from "$lib/forms/validation";
	import type { FormField } from "$lib/types/forms";
	import type { AnswerValue } from "$lib/types";

	interface Props {
		fields: FormField[];
		initialValues?: Record<string, AnswerValue>;
		variant?: "compact" | "kiosk";
		onChange?: (values: Record<string, AnswerValue>) => void;
		onValidityChange?: (valid: boolean) => void;
	}

	let {
		fields,
		initialValues = {},
		variant = "compact",
		onChange,
		onValidityChange
	}: Props = $props();

	let values = $state<Record<string, AnswerValue>>({ ...initialValues });
	let errors = $state<Record<string, string>>({});

	const visibleFields = $derived(
		fields.filter((f) => f.type === "section_header" || shouldShow(f.displayLogic, values))
	);

	function update(id: string, v: AnswerValue) {
		values = { ...values, [id]: v };
		const res = validateForm(fields, values);
		errors = Object.fromEntries(res.errors.map((e) => [e.fieldId, e.message]));
		onChange?.(values);
		onValidityChange?.(res.valid);
	}

	export function getValues(): Record<string, AnswerValue> {
		return { ...values };
	}

	export function validate(): boolean {
		const res = validateForm(fields, values);
		errors = Object.fromEntries(res.errors.map((e) => [e.fieldId, e.message]));
		return res.valid;
	}
</script>

<div class={variant === "kiosk" ? "space-y-8" : "space-y-5"}>
	{#each visibleFields as field (field.id)}
		<FieldRenderer
			{field}
			{variant}
			value={values[field.id] ?? null}
			error={errors[field.id]}
			onChange={(v) => update(field.id, v)}
		/>
	{/each}
</div>
