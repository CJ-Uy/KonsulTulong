<script lang="ts">
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { Label } from "$lib/components/ui/label";
	import TrashIcon from "@tabler/icons-svelte/icons/trash";
	import PlusIcon from "@tabler/icons-svelte/icons/plus";
	import GripVerticalIcon from "@tabler/icons-svelte/icons/grip-vertical";

	interface Props {
		options: string[];
		onUpdate: (options: string[]) => void;
	}

	let { options, onUpdate }: Props = $props();

	function updateOption(index: number, value: string) {
		const newOptions = [...options];
		newOptions[index] = value;
		onUpdate(newOptions);
	}

	function addOption() {
		onUpdate([...options, `Option ${options.length + 1}`]);
	}

	function removeOption(index: number) {
		if (options.length <= 1) return; // Keep at least one option
		const newOptions = [...options];
		newOptions.splice(index, 1);
		onUpdate(newOptions);
	}

	function moveOption(index: number, direction: "up" | "down") {
		const newIndex = direction === "up" ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= options.length) return;

		const newOptions = [...options];
		[newOptions[index], newOptions[newIndex]] = [newOptions[newIndex], newOptions[index]];
		onUpdate(newOptions);
	}
</script>

<div class="space-y-2">
	<Label class="text-muted-foreground text-xs font-medium">Options</Label>
	<div class="space-y-2">
		{#each options as option, index}
			<div class="flex items-center gap-2">
				<div class="flex flex-col">
					<button
						type="button"
						class="text-muted-foreground hover:text-foreground p-0.5 disabled:opacity-30"
						disabled={index === 0}
						onclick={() => moveOption(index, "up")}
					>
						<svg
							class="h-3 w-3"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M18 15l-6-6-6 6" />
						</svg>
					</button>
					<button
						type="button"
						class="text-muted-foreground hover:text-foreground p-0.5 disabled:opacity-30"
						disabled={index === options.length - 1}
						onclick={() => moveOption(index, "down")}
					>
						<svg
							class="h-3 w-3"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M6 9l6 6 6-6" />
						</svg>
					</button>
				</div>
				<span class="text-muted-foreground w-6 text-center text-xs">{index + 1}.</span>
				<Input
					value={option}
					class="h-8 text-sm"
					placeholder="Option text"
					oninput={(e) => updateOption(index, e.currentTarget.value)}
				/>
				<Button
					variant="ghost"
					size="icon"
					class="h-8 w-8 shrink-0"
					disabled={options.length <= 1}
					onclick={() => removeOption(index)}
				>
					<TrashIcon class="text-destructive h-4 w-4" />
				</Button>
			</div>
		{/each}
	</div>
	<Button variant="outline" size="sm" class="mt-2 w-full" onclick={addOption}>
		<PlusIcon class="mr-2 h-4 w-4" />
		Add Option
	</Button>
</div>
