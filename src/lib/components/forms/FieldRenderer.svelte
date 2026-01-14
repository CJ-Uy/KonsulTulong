<script lang="ts">
	import type { FormField } from "$lib/types/forms";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Label } from "$lib/components/ui/label";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import { RadioGroup, RadioGroupItem } from "$lib/components/ui/radio-group";
	import * as Select from "$lib/components/ui/select";
	import { cn } from "$lib/utils";

	interface Props {
		field: FormField;
		value: unknown;
		onChange: (value: unknown) => void;
		error?: string;
		disabled?: boolean;
	}

	let { field, value, onChange, error, disabled = false }: Props = $props();

	// Helper for required indicator
	let requiredIndicator = $derived(field.required ? " *" : "");
</script>

<div class="space-y-2">
	<!-- Section Header -->
	{#if field.type === "section_header"}
		<div class="border-b pt-4 pb-2">
			<h3 class="text-lg font-semibold">{field.text}</h3>
		</div>

		<!-- Short Answer -->
	{:else if field.type === "short_answer"}
		<Label for={field.id}>
			{field.text}{requiredIndicator}
		</Label>
		<Input
			id={field.id}
			type="text"
			placeholder={field.placeholder}
			value={(value as string) || ""}
			{disabled}
			class={cn(error && "border-destructive")}
			oninput={(e) => onChange(e.currentTarget.value)}
		/>

		<!-- Long Text -->
	{:else if field.type === "long_text"}
		<Label for={field.id}>
			{field.text}{requiredIndicator}
		</Label>
		<Textarea
			id={field.id}
			placeholder={field.placeholder}
			value={(value as string) || ""}
			{disabled}
			class={cn("min-h-[100px]", error && "border-destructive")}
			oninput={(e) => onChange(e.currentTarget.value)}
		/>

		<!-- Number -->
	{:else if field.type === "number"}
		<Label for={field.id}>
			{field.text}{requiredIndicator}
		</Label>
		<Input
			id={field.id}
			type="number"
			placeholder={field.placeholder}
			value={(value as string) || ""}
			{disabled}
			step={field.numberConfig?.wholeNumbersOnly ? "1" : "any"}
			min={field.numberConfig?.min}
			max={field.numberConfig?.max}
			class={cn(error && "border-destructive")}
			oninput={(e) => onChange(e.currentTarget.value)}
		/>
		{#if field.numberConfig}
			<p class="text-muted-foreground text-xs">
				{#if field.numberConfig.wholeNumbersOnly}Whole numbers only.
				{/if}
				{#if field.numberConfig.allowNegative === false}Positive numbers only.
				{/if}
				{#if field.numberConfig.validationType === "min" && field.numberConfig.min !== undefined}
					Minimum: {field.numberConfig.min}.
				{/if}
				{#if field.numberConfig.validationType === "max" && field.numberConfig.max !== undefined}
					Maximum: {field.numberConfig.max}.
				{/if}
				{#if field.numberConfig.validationType === "range" && field.numberConfig.min !== undefined && field.numberConfig.max !== undefined}
					Range: {field.numberConfig.min} - {field.numberConfig.max}.
				{/if}
			</p>
		{/if}

		<!-- Date -->
	{:else if field.type === "date"}
		<Label for={field.id}>
			{field.text}{requiredIndicator}
		</Label>
		<Input
			id={field.id}
			type="date"
			value={(value as string) || ""}
			{disabled}
			class={cn(error && "border-destructive")}
			oninput={(e) => onChange(e.currentTarget.value)}
		/>

		<!-- Multiple Choice (Radio) -->
	{:else if field.type === "multiple_choice"}
		<div class="space-y-3">
			<Label>
				{field.text}{requiredIndicator}
			</Label>
			<RadioGroup value={(value as string) || ""} onValueChange={onChange} {disabled}>
				{#each field.options || [] as option}
					<div class="flex items-center space-x-2">
						<RadioGroupItem value={option} id={`${field.id}-${option}`} />
						<Label for={`${field.id}-${option}`} class="font-normal">{option}</Label>
					</div>
				{/each}
			</RadioGroup>
			{#if value}
				<button
					type="button"
					class="text-muted-foreground hover:text-foreground text-xs underline"
					onclick={() => onChange("")}
				>
					Clear selection
				</button>
			{/if}
		</div>

		<!-- Checkbox (Multiple Select) -->
	{:else if field.type === "checkbox"}
		<div class="space-y-3">
			<Label>
				{field.text}{requiredIndicator}
			</Label>
			<div class="space-y-2">
				{#each field.options || [] as option}
					{@const checked = (value as Record<string, boolean>)?.[option] || false}
					<div class="flex items-center space-x-2">
						<Checkbox
							id={`${field.id}-${option}`}
							{checked}
							{disabled}
							onCheckedChange={(c) => {
								const current = (value as Record<string, boolean>) || {};
								onChange({ ...current, [option]: c === true });
							}}
						/>
						<Label for={`${field.id}-${option}`} class="font-normal">{option}</Label>
					</div>
				{/each}
			</div>
		</div>

		<!-- Select (Dropdown) -->
	{:else if field.type === "select"}
		<Label for={field.id}>
			{field.text}{requiredIndicator}
		</Label>
		<Select.Root
			type="single"
			{disabled}
			value={field.options?.find((o) => o === value)
				? { value: value as string, label: value as string }
				: undefined}
			onValueChange={(v) => onChange(v?.value || "")}
		>
			<Select.Trigger id={field.id} class={cn(error && "border-destructive")}>
				{(value as string) || "Select an option..."}
			</Select.Trigger>
			<Select.Content>
				{#each field.options || [] as option}
					<Select.Item value={{ value: option, label: option }}>{option}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>

		<!-- Boolean (Yes/No) -->
	{:else if field.type === "boolean"}
		<div class="space-y-3">
			<Label>
				{field.text}{requiredIndicator}
			</Label>
			<RadioGroup
				value={value === true ? "yes" : value === false ? "no" : ""}
				onValueChange={(v) => onChange(v === "yes" ? true : v === "no" ? false : undefined)}
				{disabled}
			>
				<div class="flex items-center space-x-2">
					<RadioGroupItem value="yes" id={`${field.id}-yes`} />
					<Label for={`${field.id}-yes`} class="font-normal">Yes</Label>
				</div>
				<div class="flex items-center space-x-2">
					<RadioGroupItem value="no" id={`${field.id}-no`} />
					<Label for={`${field.id}-no`} class="font-normal">No</Label>
				</div>
			</RadioGroup>
			{#if value !== undefined}
				<button
					type="button"
					class="text-muted-foreground hover:text-foreground text-xs underline"
					onclick={() => onChange(undefined)}
				>
					Clear selection
				</button>
			{/if}
		</div>

		<!-- File Upload -->
	{:else if field.type === "file_upload"}
		<Label for={field.id}>
			{field.text}{requiredIndicator}
		</Label>
		<Input
			id={field.id}
			type="file"
			{disabled}
			class={cn(error && "border-destructive")}
			onchange={(e) => {
				const files = e.currentTarget.files;
				if (files && files.length > 0) {
					// Store file metadata - actual upload handled by parent
					onChange({
						filename: files[0].name,
						filetype: files[0].type,
						sizeBytes: files[0].size,
						file: files[0]
					});
				}
			}}
		/>
		{#if value && typeof value === "object" && "filename" in value}
			<p class="text-muted-foreground text-sm">
				Selected: {(value as { filename: string }).filename}
			</p>
		{/if}

		<!-- Unsupported field type -->
	{:else}
		<div class="border-destructive bg-destructive/10 rounded-md border p-4">
			<p class="text-destructive text-sm">
				Unsupported field type: {field.type}
			</p>
		</div>
	{/if}

	<!-- Error Message -->
	{#if error}
		<p class="text-destructive text-sm">{error}</p>
	{/if}
</div>
