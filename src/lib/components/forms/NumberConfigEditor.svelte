<script lang="ts">
	import type { NumberFieldConfig } from "$lib/types/forms";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import * as Select from "$lib/components/ui/select";

	interface Props {
		config: NumberFieldConfig;
		onUpdate: (config: NumberFieldConfig) => void;
	}

	let { config, onUpdate }: Props = $props();

	function updateConfig(updates: Partial<NumberFieldConfig>) {
		onUpdate({ ...config, ...updates });
	}

	const validationTypes = [
		{ value: "none", label: "No Validation" },
		{ value: "min", label: "Minimum Value" },
		{ value: "max", label: "Maximum Value" },
		{ value: "range", label: "Range (Min-Max)" }
	];

	let selectedValidationType = $derived(
		validationTypes.find((t) => t.value === (config.validationType || "none"))
	);
</script>

<div class="bg-muted/30 space-y-4 rounded-md border p-3">
	<h4 class="text-muted-foreground text-xs font-medium">Number Settings</h4>

	<div class="flex items-center gap-2">
		<Checkbox
			id="wholeNumbers"
			checked={config.wholeNumbersOnly === true}
			onCheckedChange={(checked) => updateConfig({ wholeNumbersOnly: checked === true })}
		/>
		<Label for="wholeNumbers" class="text-sm">Whole numbers only</Label>
	</div>

	<div class="flex items-center gap-2">
		<Checkbox
			id="allowNegative"
			checked={config.allowNegative !== false}
			onCheckedChange={(checked) => updateConfig({ allowNegative: checked === true })}
		/>
		<Label for="allowNegative" class="text-sm">Allow negative numbers</Label>
	</div>

	<div class="space-y-2">
		<Label class="text-xs">Validation Type</Label>
		<Select.Root
			type="single"
			value={selectedValidationType}
			onValueChange={(v) => {
				if (v) updateConfig({ validationType: v.value as NumberFieldConfig["validationType"] });
			}}
		>
			<Select.Trigger class="h-8 text-sm">
				{selectedValidationType?.label || "Select..."}
			</Select.Trigger>
			<Select.Content>
				{#each validationTypes as vt}
					<Select.Item value={vt}>{vt.label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	{#if config.validationType === "min" || config.validationType === "range"}
		<div class="space-y-1">
			<Label class="text-xs">Minimum Value</Label>
			<Input
				type="number"
				class="h-8 text-sm"
				value={config.min ?? ""}
				oninput={(e) => {
					const val = e.currentTarget.value;
					updateConfig({ min: val ? Number(val) : undefined });
				}}
			/>
		</div>
	{/if}

	{#if config.validationType === "max" || config.validationType === "range"}
		<div class="space-y-1">
			<Label class="text-xs">Maximum Value</Label>
			<Input
				type="number"
				class="h-8 text-sm"
				value={config.max ?? ""}
				oninput={(e) => {
					const val = e.currentTarget.value;
					updateConfig({ max: val ? Number(val) : undefined });
				}}
			/>
		</div>
	{/if}
</div>
