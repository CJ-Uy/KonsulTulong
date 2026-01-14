<script lang="ts">
	import type { FormField, FormTemplate, FieldType } from "$lib/types/forms";
	import { createDefaultField } from "$lib/types/forms";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Button } from "$lib/components/ui/button";
	import { Label } from "$lib/components/ui/label";
	import * as Card from "$lib/components/ui/card";
	import FieldPalette from "./FieldPalette.svelte";
	import FieldCard from "./FieldCard.svelte";

	// Icons
	import SaveIcon from "@tabler/icons-svelte/icons/device-floppy";
	import EyeIcon from "@tabler/icons-svelte/icons/eye";

	interface Props {
		template: FormTemplate;
		onSave?: (template: FormTemplate) => Promise<void>;
		onPreview?: () => void;
		isSaving?: boolean;
	}

	let { template = $bindable(), onSave, onPreview, isSaving = false }: Props = $props();

	let selectedFieldId = $state<string | null>(null);
	let isDirty = $state(false);

	// Get sorted fields by order
	let sortedFields = $derived([...template.questions].sort((a, b) => a.order - b.order));

	// Add a new field
	function addField(type: FieldType) {
		const newField = createDefaultField(type, template.questions.length);
		template.questions = [...template.questions, newField];
		selectedFieldId = newField.id;
		isDirty = true;
	}

	// Update a field
	function updateField(fieldId: string, updates: Partial<FormField>) {
		template.questions = template.questions.map((f) =>
			f.id === fieldId ? { ...f, ...updates } : f
		);
		isDirty = true;
	}

	// Delete a field
	function deleteField(fieldId: string) {
		template.questions = template.questions.filter((f) => f.id !== fieldId);
		// Reorder remaining fields
		template.questions = template.questions.map((f, idx) => ({ ...f, order: idx }));
		if (selectedFieldId === fieldId) {
			selectedFieldId = null;
		}
		isDirty = true;
	}

	// Move field up
	function moveFieldUp(fieldId: string) {
		const fieldIndex = sortedFields.findIndex((f) => f.id === fieldId);
		if (fieldIndex <= 0) return;

		const currentField = sortedFields[fieldIndex];
		const prevField = sortedFields[fieldIndex - 1];

		updateField(currentField.id, { order: prevField.order });
		updateField(prevField.id, { order: currentField.order });
	}

	// Move field down
	function moveFieldDown(fieldId: string) {
		const fieldIndex = sortedFields.findIndex((f) => f.id === fieldId);
		if (fieldIndex < 0 || fieldIndex >= sortedFields.length - 1) return;

		const currentField = sortedFields[fieldIndex];
		const nextField = sortedFields[fieldIndex + 1];

		updateField(currentField.id, { order: nextField.order });
		updateField(nextField.id, { order: currentField.order });
	}

	// Handle save
	async function handleSave() {
		if (onSave) {
			await onSave(template);
			isDirty = false;
		}
	}
</script>

<div class="flex gap-6">
	<!-- Main Builder Area -->
	<div class="flex-1 space-y-6">
		<!-- Form Metadata -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Form Details</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-2">
					<Label for="form-name">Form Name</Label>
					<Input
						id="form-name"
						value={template.name}
						placeholder="Enter form name..."
						oninput={(e) => {
							template.name = e.currentTarget.value;
							isDirty = true;
						}}
					/>
				</div>
				<div class="space-y-2">
					<Label for="form-description">Description (optional)</Label>
					<Textarea
						id="form-description"
						value={template.description || ""}
						placeholder="Describe what this form is for..."
						class="resize-none"
						oninput={(e) => {
							template.description = e.currentTarget.value;
							isDirty = true;
						}}
					/>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Fields List -->
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold">Form Fields</h2>
				<span class="text-muted-foreground text-sm">
					{template.questions.length} field{template.questions.length !== 1 ? "s" : ""}
				</span>
			</div>

			{#if sortedFields.length === 0}
				<Card.Root class="border-2 border-dashed">
					<Card.Content class="flex flex-col items-center justify-center py-12 text-center">
						<p class="text-muted-foreground">No fields yet</p>
						<p class="text-muted-foreground text-sm">
							Add fields from the palette on the right to get started
						</p>
					</Card.Content>
				</Card.Root>
			{:else}
				<div class="space-y-3">
					{#each sortedFields as field, index (field.id)}
						<FieldCard
							{field}
							allFields={template.questions}
							isSelected={selectedFieldId === field.id}
							isFirst={index === 0}
							isLast={index === sortedFields.length - 1}
							onSelect={() => (selectedFieldId = field.id)}
							onUpdate={(updates) => updateField(field.id, updates)}
							onDelete={() => deleteField(field.id)}
							onMoveUp={() => moveFieldUp(field.id)}
							onMoveDown={() => moveFieldDown(field.id)}
						/>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Sidebar -->
	<div class="w-64 shrink-0 space-y-4">
		<!-- Action Buttons -->
		<div class="flex flex-col gap-2">
			<Button onclick={handleSave} disabled={isSaving || !isDirty}>
				<SaveIcon class="mr-2 h-4 w-4" />
				{isSaving ? "Saving..." : "Save Form"}
			</Button>
			{#if onPreview}
				<Button variant="outline" onclick={onPreview}>
					<EyeIcon class="mr-2 h-4 w-4" />
					Preview
				</Button>
			{/if}
		</div>

		<!-- Field Palette -->
		<FieldPalette onAddField={addField} />
	</div>
</div>
