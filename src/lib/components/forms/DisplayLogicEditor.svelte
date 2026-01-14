<script lang="ts">
	import type { FormField, DisplayLogic, DisplayLogicOperator } from "$lib/types/forms";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Button } from "$lib/components/ui/button";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import * as Select from "$lib/components/ui/select";
	import TrashIcon from "@tabler/icons-svelte/icons/trash";
	import PlusIcon from "@tabler/icons-svelte/icons/plus";

	interface Props {
		logic: DisplayLogic | undefined;
		allFields: FormField[];
		currentFieldId: string;
		onUpdate: (logic: DisplayLogic | undefined) => void;
	}

	let { logic, allFields, currentFieldId, onUpdate }: Props = $props();

	// Filter out current field and section headers from trigger options
	let availableFields = $derived(
		allFields.filter((f) => f.id !== currentFieldId && f.type !== "section_header")
	);

	let isEnabled = $state(!!logic);

	const operators: { value: DisplayLogicOperator; label: string }[] = [
		{ value: "equals", label: "Equals" },
		{ value: "notEquals", label: "Does not equal" },
		{ value: "greaterThan", label: "Greater than" },
		{ value: "lessThan", label: "Less than" },
		{ value: "contains", label: "Contains" },
		{ value: "ageGreaterThan", label: "Age greater than" },
		{ value: "ageLessThan", label: "Age less than" }
	];

	const conditions = [
		{ value: "AND", label: "ALL rules match (AND)" },
		{ value: "OR", label: "ANY rule matches (OR)" }
	];

	function toggleLogic(enabled: boolean) {
		isEnabled = enabled;
		if (!enabled) {
			onUpdate(undefined);
		} else {
			onUpdate({
				triggerQuestionId: availableFields[0]?.id || "",
				operator: "equals",
				value: ""
			});
		}
	}

	function updateSimpleLogic(updates: Partial<DisplayLogic>) {
		onUpdate({ ...logic, ...updates });
	}

	function switchToCompound() {
		if (logic?.triggerQuestionId) {
			onUpdate({
				condition: "AND",
				rules: [
					{
						triggerQuestionId: logic.triggerQuestionId,
						operator: logic.operator || "equals",
						value: logic.value as string | number | boolean
					}
				]
			});
		}
	}

	function addRule() {
		const rules = logic?.rules || [];
		onUpdate({
			...logic,
			condition: logic?.condition || "AND",
			rules: [
				...rules,
				{
					triggerQuestionId: availableFields[0]?.id || "",
					operator: "equals",
					value: ""
				}
			]
		});
	}

	function updateRule(index: number, updates: Partial<DisplayLogic["rules"][0]>) {
		const rules = [...(logic?.rules || [])];
		rules[index] = { ...rules[index], ...updates };
		onUpdate({ ...logic, rules });
	}

	function removeRule(index: number) {
		const rules = [...(logic?.rules || [])];
		rules.splice(index, 1);
		if (rules.length === 0) {
			onUpdate(undefined);
			isEnabled = false;
		} else if (rules.length === 1) {
			// Convert back to simple logic
			onUpdate({
				triggerQuestionId: rules[0].triggerQuestionId,
				operator: rules[0].operator,
				value: rules[0].value
			});
		} else {
			onUpdate({ ...logic, rules });
		}
	}

	let isCompound = $derived(logic?.rules && logic.rules.length > 0);
</script>

<div class="bg-muted/30 space-y-3 rounded-md border p-3">
	<div class="flex items-center justify-between">
		<Label class="text-muted-foreground text-xs font-medium">Conditional Display</Label>
		<div class="flex items-center gap-2">
			<Checkbox
				id="enableLogic"
				checked={isEnabled}
				onCheckedChange={(checked) => toggleLogic(checked === true)}
			/>
			<Label for="enableLogic" class="text-xs">Enable</Label>
		</div>
	</div>

	{#if isEnabled && logic}
		{#if !isCompound}
			<!-- Simple single-rule logic -->
			<div class="space-y-2">
				<div class="space-y-1">
					<Label class="text-xs">Show this field when</Label>
					<Select.Root
						type="single"
						value={availableFields.find((f) => f.id === logic.triggerQuestionId)}
						onValueChange={(v) => {
							if (v) updateSimpleLogic({ triggerQuestionId: v.id });
						}}
					>
						<Select.Trigger class="h-8 text-sm">
							{availableFields.find((f) => f.id === logic.triggerQuestionId)?.text ||
								"Select field..."}
						</Select.Trigger>
						<Select.Content>
							{#each availableFields as field}
								<Select.Item value={field}>{field.text}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<Select.Root
					type="single"
					value={operators.find((o) => o.value === logic.operator)}
					onValueChange={(v) => {
						if (v) updateSimpleLogic({ operator: v.value });
					}}
				>
					<Select.Trigger class="h-8 text-sm">
						{operators.find((o) => o.value === logic.operator)?.label || "Select operator..."}
					</Select.Trigger>
					<Select.Content>
						{#each operators as op}
							<Select.Item value={op}>{op.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>

				<Input
					class="h-8 text-sm"
					placeholder="Value"
					value={logic.value?.toString() ?? ""}
					oninput={(e) => {
						const val = e.currentTarget.value;
						// Try to parse as number or boolean
						let parsedValue: string | number | boolean = val;
						if (val === "true") parsedValue = true;
						else if (val === "false") parsedValue = false;
						else if (!isNaN(Number(val)) && val !== "") parsedValue = Number(val);
						updateSimpleLogic({ value: parsedValue });
					}}
				/>

				<Button variant="outline" size="sm" class="w-full text-xs" onclick={switchToCompound}>
					<PlusIcon class="mr-1 h-3 w-3" />
					Add another condition
				</Button>
			</div>
		{:else}
			<!-- Compound multi-rule logic -->
			<div class="space-y-3">
				<Select.Root
					type="single"
					value={conditions.find((c) => c.value === logic.condition)}
					onValueChange={(v) => {
						if (v) onUpdate({ ...logic, condition: v.value as "AND" | "OR" });
					}}
				>
					<Select.Trigger class="h-8 text-sm">
						{conditions.find((c) => c.value === logic.condition)?.label || "Select condition..."}
					</Select.Trigger>
					<Select.Content>
						{#each conditions as cond}
							<Select.Item value={cond}>{cond.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>

				{#each logic.rules || [] as rule, index}
					<div class="bg-background space-y-2 rounded border p-2">
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground text-xs">Rule {index + 1}</span>
							<Button variant="ghost" size="icon" class="h-6 w-6" onclick={() => removeRule(index)}>
								<TrashIcon class="text-destructive h-3 w-3" />
							</Button>
						</div>

						<Select.Root
							type="single"
							value={availableFields.find((f) => f.id === rule.triggerQuestionId)}
							onValueChange={(v) => {
								if (v) updateRule(index, { triggerQuestionId: v.id });
							}}
						>
							<Select.Trigger class="h-7 text-xs">
								{availableFields.find((f) => f.id === rule.triggerQuestionId)?.text || "Select..."}
							</Select.Trigger>
							<Select.Content>
								{#each availableFields as field}
									<Select.Item value={field}>{field.text}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>

						<Select.Root
							type="single"
							value={operators.find((o) => o.value === rule.operator)}
							onValueChange={(v) => {
								if (v) updateRule(index, { operator: v.value });
							}}
						>
							<Select.Trigger class="h-7 text-xs">
								{operators.find((o) => o.value === rule.operator)?.label || "Select..."}
							</Select.Trigger>
							<Select.Content>
								{#each operators as op}
									<Select.Item value={op}>{op.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>

						<Input
							class="h-7 text-xs"
							placeholder="Value"
							value={rule.value?.toString() ?? ""}
							oninput={(e) => {
								const val = e.currentTarget.value;
								let parsedValue: string | number | boolean = val;
								if (val === "true") parsedValue = true;
								else if (val === "false") parsedValue = false;
								else if (!isNaN(Number(val)) && val !== "") parsedValue = Number(val);
								updateRule(index, { value: parsedValue });
							}}
						/>
					</div>
				{/each}

				<Button variant="outline" size="sm" class="w-full text-xs" onclick={addRule}>
					<PlusIcon class="mr-1 h-3 w-3" />
					Add Rule
				</Button>
			</div>
		{/if}
	{:else if !isEnabled}
		<p class="text-muted-foreground text-xs">
			Enable to show this field only when certain conditions are met.
		</p>
	{/if}
</div>
