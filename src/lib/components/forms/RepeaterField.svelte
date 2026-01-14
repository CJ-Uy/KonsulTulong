<script lang="ts">
	import type { FormField } from "$lib/types/forms";
	import { Button } from "$lib/components/ui/button";
	import { Label } from "$lib/components/ui/label";
	import * as Card from "$lib/components/ui/card";
	import FieldRenderer from "./FieldRenderer.svelte";
	import PlusIcon from "@tabler/icons-svelte/icons/plus";
	import TrashIcon from "@tabler/icons-svelte/icons/trash";

	interface Props {
		field: FormField;
		value: Record<string, unknown>[];
		onChange: (value: Record<string, unknown>[]) => void;
		errors?: Record<string, string>;
		disabled?: boolean;
	}

	let { field, value = [], onChange, errors = {}, disabled = false }: Props = $props();

	function addRow() {
		onChange([...value, {}]);
	}

	function removeRow(index: number) {
		const newValue = [...value];
		newValue.splice(index, 1);
		onChange(newValue);
	}

	function updateRowField(rowIndex: number, columnId: string, columnValue: unknown) {
		const newValue = [...value];
		if (!newValue[rowIndex]) {
			newValue[rowIndex] = {};
		}
		newValue[rowIndex] = { ...newValue[rowIndex], [columnId]: columnValue };
		onChange(newValue);
	}

	// Get error for a specific row/column
	function getColumnError(rowIndex: number, columnId: string): string | undefined {
		return errors[`${field.id}[${rowIndex}].${columnId}`];
	}
</script>

<div class="space-y-3">
	<div class="flex items-center justify-between">
		<Label class="text-base font-medium">
			{field.text}
			{#if field.required}
				<span class="text-destructive">*</span>
			{/if}
		</Label>
		<span class="text-muted-foreground text-sm">
			{value.length} entr{value.length === 1 ? "y" : "ies"}
		</span>
	</div>

	{#if value.length === 0}
		<Card.Root class="border-2 border-dashed">
			<Card.Content class="flex flex-col items-center justify-center py-8 text-center">
				<p class="text-muted-foreground text-sm">No entries yet</p>
				<Button variant="outline" size="sm" class="mt-2" onclick={addRow} {disabled}>
					<PlusIcon class="mr-2 h-4 w-4" />
					Add Entry
				</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="space-y-4">
			{#each value as row, rowIndex}
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="text-sm font-medium">Entry {rowIndex + 1}</Card.Title>
						<Button
							variant="ghost"
							size="icon"
							class="text-destructive hover:text-destructive h-8 w-8"
							onclick={() => removeRow(rowIndex)}
							{disabled}
						>
							<TrashIcon class="h-4 w-4" />
						</Button>
					</Card.Header>
					<Card.Content class="space-y-4">
						{#each field.columns || [] as column}
							<FieldRenderer
								field={column}
								value={row[column.id]}
								onChange={(v) => updateRowField(rowIndex, column.id, v)}
								error={getColumnError(rowIndex, column.id)}
								{disabled}
							/>
						{/each}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<Button variant="outline" onclick={addRow} {disabled}>
			<PlusIcon class="mr-2 h-4 w-4" />
			Add Another Entry
		</Button>
	{/if}

	{#if errors[field.id]}
		<p class="text-destructive text-sm">{errors[field.id]}</p>
	{/if}
</div>
