<script lang="ts">
	import type { FormField, FormTemplate, ValidationResult } from "$lib/types/forms";
	import { shouldDisplayField, validateForm, getCompletionPercentage } from "$lib/forms/validation";
	import FieldRenderer from "./FieldRenderer.svelte";
	import RepeaterField from "./RepeaterField.svelte";
	import { Progress } from "$lib/components/ui/progress";

	interface Props {
		template: FormTemplate;
		initialData?: Record<string, unknown>;
		onDataChange?: (data: Record<string, unknown>) => void;
		onValidationChange?: (result: ValidationResult) => void;
		disabled?: boolean;
		showProgress?: boolean;
	}

	let {
		template,
		initialData = {},
		onDataChange,
		onValidationChange,
		disabled = false,
		showProgress = true
	}: Props = $props();

	// Form data state
	let formData = $state<Record<string, unknown>>({ ...initialData });

	// Validation state
	let validationResult = $state<ValidationResult>({ isValid: true, errors: [] });

	// Sorted and visible fields
	let sortedFields = $derived([...template.questions].sort((a, b) => a.order - b.order));

	let visibleFields = $derived(sortedFields.filter((field) => shouldDisplayField(field, formData)));

	// Completion percentage
	let completionPercentage = $derived(getCompletionPercentage(template.questions, formData));

	// Errors as a map for easy lookup
	let errorMap = $derived(
		validationResult.errors.reduce(
			(acc, err) => {
				acc[err.fieldId] = err.message;
				return acc;
			},
			{} as Record<string, string>
		)
	);

	// Update form data and notify parent
	function updateField(fieldId: string, value: unknown) {
		formData = { ...formData, [fieldId]: value };
		onDataChange?.(formData);

		// Re-validate
		const result = validateForm(template.questions, formData);
		validationResult = result;
		onValidationChange?.(result);
	}

	// Expose form data and validation for parent components
	export function getFormData(): Record<string, unknown> {
		return formData;
	}

	export function getValidation(): ValidationResult {
		return validateForm(template.questions, formData);
	}

	export function setFormData(data: Record<string, unknown>) {
		formData = data;
	}

	// Run initial validation
	$effect(() => {
		const result = validateForm(template.questions, formData);
		validationResult = result;
		onValidationChange?.(result);
	});
</script>

<div class="space-y-6">
	<!-- Progress Bar -->
	{#if showProgress}
		<div class="space-y-2">
			<div class="flex items-center justify-between text-sm">
				<span class="text-muted-foreground">Progress</span>
				<span class="font-medium">{completionPercentage}%</span>
			</div>
			<Progress value={completionPercentage} class="h-2" />
		</div>
	{/if}

	<!-- Form Fields -->
	<div class="space-y-6">
		{#each visibleFields as field (field.id)}
			{#if field.type === "repeater"}
				<RepeaterField
					{field}
					value={(formData[field.id] as Record<string, unknown>[]) || []}
					onChange={(value) => updateField(field.id, value)}
					errors={errorMap}
					{disabled}
				/>
			{:else}
				<FieldRenderer
					{field}
					value={formData[field.id]}
					onChange={(value) => updateField(field.id, value)}
					error={errorMap[field.id]}
					{disabled}
				/>
			{/if}
		{/each}
	</div>

	{#if visibleFields.length === 0}
		<div class="rounded-md border-2 border-dashed p-8 text-center">
			<p class="text-muted-foreground">No fields to display</p>
		</div>
	{/if}
</div>
