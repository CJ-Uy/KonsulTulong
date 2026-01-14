<script lang="ts">
	import type { PageData } from "./$types";
	import { FormFiller } from "$lib/components/forms";
	import type { ValidationResult } from "$lib/types/forms";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import { toast } from "svelte-sonner";

	// Icons
	import ArrowLeftIcon from "@tabler/icons-svelte/icons/arrow-left";
	import EditIcon from "@tabler/icons-svelte/icons/edit";
	import RefreshIcon from "@tabler/icons-svelte/icons/refresh";
	import SendIcon from "@tabler/icons-svelte/icons/send";

	let { data }: { data: PageData } = $props();

	let formData = $state<Record<string, unknown>>({});
	let validationResult = $state<ValidationResult>({ isValid: true, errors: [] });
	let isSubmitted = $state(false);

	function handleDataChange(newData: Record<string, unknown>) {
		formData = newData;
	}

	function handleValidationChange(result: ValidationResult) {
		validationResult = result;
	}

	function handleSubmit() {
		if (!validationResult.isValid) {
			toast.error("Please fill in all required fields");
			return;
		}

		isSubmitted = true;
		toast.success("Form submitted successfully (Preview mode)");
	}

	function handleReset() {
		formData = {};
		isSubmitted = false;
	}
</script>

<div class="flex flex-1 flex-col">
	<!-- Header -->
	<div class="bg-background border-b px-4 py-3">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<Button variant="ghost" size="icon" href="/dashboard/forms">
					<ArrowLeftIcon class="h-4 w-4" />
				</Button>
				<div>
					<h1 class="text-lg font-semibold">Preview Form</h1>
					<p class="text-muted-foreground text-sm">{data.template.name}</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<Button variant="outline" onclick={handleReset}>
					<RefreshIcon class="mr-2 h-4 w-4" />
					Reset
				</Button>
				<Button variant="outline" href={`/dashboard/forms/${data.template.id}/edit`}>
					<EditIcon class="mr-2 h-4 w-4" />
					Edit Form
				</Button>
			</div>
		</div>
	</div>

	<!-- Preview Content -->
	<div class="flex-1 overflow-auto p-4 md:p-6">
		<div class="mx-auto max-w-2xl">
			{#if isSubmitted}
				<!-- Submission Confirmation -->
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-center text-green-600">Form Submitted!</Card.Title>
						<Card.Description class="text-center">
							This is a preview - no actual data was saved.
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<h3 class="mb-2 font-semibold">Submitted Data:</h3>
						<pre class="bg-muted max-h-96 overflow-auto rounded-md p-4 text-sm">
{JSON.stringify(formData, null, 2)}
						</pre>
					</Card.Content>
					<Card.Footer class="justify-center">
						<Button onclick={handleReset}>
							<RefreshIcon class="mr-2 h-4 w-4" />
							Try Again
						</Button>
					</Card.Footer>
				</Card.Root>
			{:else}
				<!-- Form Preview -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{data.template.name}</Card.Title>
						{#if data.template.description}
							<Card.Description>{data.template.description}</Card.Description>
						{/if}
					</Card.Header>
					<Card.Content>
						<FormFiller
							template={data.template}
							initialData={formData}
							onDataChange={handleDataChange}
							onValidationChange={handleValidationChange}
						/>
					</Card.Content>
					<Card.Footer class="flex-col gap-4">
						{#if validationResult.errors.length > 0}
							<div class="bg-destructive/10 text-destructive w-full rounded-md p-3 text-sm">
								<p class="font-medium">Please fix the following errors:</p>
								<ul class="mt-1 list-inside list-disc">
									{#each validationResult.errors.slice(0, 3) as error}
										<li>{error.message}</li>
									{/each}
									{#if validationResult.errors.length > 3}
										<li>...and {validationResult.errors.length - 3} more</li>
									{/if}
								</ul>
							</div>
						{/if}
						<Button class="w-full" onclick={handleSubmit} disabled={!validationResult.isValid}>
							<SendIcon class="mr-2 h-4 w-4" />
							Submit Form
						</Button>
					</Card.Footer>
				</Card.Root>
			{/if}

			<!-- Preview Notice -->
			<p class="text-muted-foreground mt-4 text-center text-sm">
				This is a preview. Submissions won't be saved.
			</p>
		</div>
	</div>
</div>
