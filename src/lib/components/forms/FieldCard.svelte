<script lang="ts">
	import type { FormField, FieldType } from "$lib/types/forms";
	import { cn } from "$lib/utils";
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import * as Card from "$lib/components/ui/card";
	import * as Collapsible from "$lib/components/ui/collapsible";
	import FieldEditor from "./FieldEditor.svelte";

	// Icons
	import TypeIcon from "@tabler/icons-svelte/icons/forms";
	import AlignLeftIcon from "@tabler/icons-svelte/icons/align-left";
	import HashIcon from "@tabler/icons-svelte/icons/hash";
	import CalendarIcon from "@tabler/icons-svelte/icons/calendar";
	import CircleDotIcon from "@tabler/icons-svelte/icons/circle-dot";
	import CheckSquareIcon from "@tabler/icons-svelte/icons/square-check";
	import ChevronDownIcon from "@tabler/icons-svelte/icons/chevron-down";
	import ToggleLeftIcon from "@tabler/icons-svelte/icons/toggle-left";
	import UploadIcon from "@tabler/icons-svelte/icons/upload";
	import HeadingIcon from "@tabler/icons-svelte/icons/heading";
	import ListPlusIcon from "@tabler/icons-svelte/icons/list-details";
	import TrashIcon from "@tabler/icons-svelte/icons/trash";
	import ChevronUpIcon from "@tabler/icons-svelte/icons/chevron-up";
	import GripVerticalIcon from "@tabler/icons-svelte/icons/grip-vertical";
	import SettingsIcon from "@tabler/icons-svelte/icons/settings";

	interface Props {
		field: FormField;
		allFields: FormField[];
		isSelected: boolean;
		isFirst: boolean;
		isLast: boolean;
		onSelect: () => void;
		onUpdate: (updates: Partial<FormField>) => void;
		onDelete: () => void;
		onMoveUp: () => void;
		onMoveDown: () => void;
	}

	let {
		field,
		allFields,
		isSelected,
		isFirst,
		isLast,
		onSelect,
		onUpdate,
		onDelete,
		onMoveUp,
		onMoveDown
	}: Props = $props();

	let isExpanded = $state(false);

	// Map field types to icons
	const typeIcons: Record<FieldType, typeof TypeIcon> = {
		short_answer: TypeIcon,
		long_text: AlignLeftIcon,
		number: HashIcon,
		date: CalendarIcon,
		multiple_choice: CircleDotIcon,
		checkbox: CheckSquareIcon,
		select: ChevronDownIcon,
		boolean: ToggleLeftIcon,
		file_upload: UploadIcon,
		section_header: HeadingIcon,
		repeater: ListPlusIcon
	};

	const typeLabels: Record<FieldType, string> = {
		short_answer: "Short Answer",
		long_text: "Long Text",
		number: "Number",
		date: "Date",
		multiple_choice: "Multiple Choice",
		checkbox: "Checkboxes",
		select: "Dropdown",
		boolean: "Yes/No",
		file_upload: "File Upload",
		section_header: "Section Header",
		repeater: "Repeater"
	};

	let IconComponent = $derived(typeIcons[field.type] || TypeIcon);
	let typeLabel = $derived(typeLabels[field.type] || field.type);
</script>

<Card.Root
	class={cn(
		"transition-all",
		isSelected && "ring-primary ring-2",
		field.type === "section_header" && "bg-muted/50"
	)}
>
	<div
		class="flex cursor-pointer items-start gap-3 p-4"
		role="button"
		tabindex="0"
		onclick={onSelect}
		onkeydown={(e) => e.key === "Enter" && onSelect()}
	>
		<!-- Drag Handle & Reorder Buttons -->
		<div class="flex flex-col items-center gap-0.5 pt-1">
			<Button
				variant="ghost"
				size="icon"
				class="h-6 w-6"
				disabled={isFirst}
				onclick={(e) => {
					e.stopPropagation();
					onMoveUp();
				}}
			>
				<ChevronUpIcon class="h-4 w-4" />
			</Button>
			<GripVerticalIcon class="text-muted-foreground h-4 w-4" />
			<Button
				variant="ghost"
				size="icon"
				class="h-6 w-6"
				disabled={isLast}
				onclick={(e) => {
					e.stopPropagation();
					onMoveDown();
				}}
			>
				<ChevronDownIcon class="h-4 w-4" />
			</Button>
		</div>

		<!-- Field Type Icon -->
		<div class="bg-muted mt-1 rounded-md p-2">
			<IconComponent class="text-muted-foreground h-4 w-4" />
		</div>

		<!-- Field Content -->
		<div class="min-w-0 flex-1">
			<div class="flex items-start justify-between gap-2">
				<div class="min-w-0 flex-1">
					<p class={cn("truncate font-medium", field.type === "section_header" && "text-lg")}>
						{field.text || "Untitled Question"}
					</p>
					<div class="mt-1 flex flex-wrap items-center gap-2">
						<Badge variant="secondary" class="text-xs">
							{typeLabel}
						</Badge>
						{#if field.required}
							<Badge variant="destructive" class="text-xs">Required</Badge>
						{/if}
						{#if field.displayLogic}
							<Badge variant="outline" class="text-xs">Conditional</Badge>
						{/if}
					</div>
				</div>

				<!-- Actions -->
				<div class="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8"
						onclick={(e) => {
							e.stopPropagation();
							isExpanded = !isExpanded;
						}}
					>
						<SettingsIcon class="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						class="text-destructive hover:text-destructive h-8 w-8"
						onclick={(e) => {
							e.stopPropagation();
							onDelete();
						}}
					>
						<TrashIcon class="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	</div>

	<!-- Expanded Editor -->
	{#if isExpanded}
		<div class="border-t px-4 py-4">
			<FieldEditor {field} {allFields} {onUpdate} />
		</div>
	{/if}
</Card.Root>
