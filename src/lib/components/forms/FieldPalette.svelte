<script lang="ts">
	import { FIELD_TYPE_OPTIONS, type FieldType } from "$lib/types/forms";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
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

	interface Props {
		onAddField: (type: FieldType) => void;
	}

	let { onAddField }: Props = $props();

	// Map icon names to components
	const iconMap: Record<string, typeof TypeIcon> = {
		type: TypeIcon,
		"align-left": AlignLeftIcon,
		hash: HashIcon,
		calendar: CalendarIcon,
		"circle-dot": CircleDotIcon,
		"check-square": CheckSquareIcon,
		"chevron-down": ChevronDownIcon,
		"toggle-left": ToggleLeftIcon,
		upload: UploadIcon,
		heading: HeadingIcon,
		"list-plus": ListPlusIcon
	};
</script>

<Card.Root class="sticky top-4">
	<Card.Header class="pb-3">
		<Card.Title class="text-sm font-medium">Add Field</Card.Title>
		<Card.Description class="text-xs">Click to add a field to your form</Card.Description>
	</Card.Header>
	<Card.Content class="grid grid-cols-2 gap-2">
		{#each FIELD_TYPE_OPTIONS as option}
			{@const IconComponent = iconMap[option.icon] || TypeIcon}
			<Button
				variant="outline"
				size="sm"
				class="h-auto flex-col gap-1 py-3 text-xs"
				onclick={() => onAddField(option.type)}
			>
				<IconComponent class="h-4 w-4" />
				<span class="text-center leading-tight">{option.label}</span>
			</Button>
		{/each}
	</Card.Content>
</Card.Root>
