<script lang="ts">
	import type { PageData, ActionData } from "./$types";
	import { FormBuilder } from "$lib/components/forms";
	import type { FormTemplate } from "$lib/types/forms";
	import { Button } from "$lib/components/ui/button";
	import { enhance } from "$app/forms";
	import { toast } from "svelte-sonner";
	import { goto } from "$app/navigation";

	// Icons
	import ArrowLeftIcon from "@tabler/icons-svelte/icons/arrow-left";
	import SaveIcon from "@tabler/icons-svelte/icons/device-floppy";
	import EyeIcon from "@tabler/icons-svelte/icons/eye";

	let { data }: { data: PageData } = $props();

	// Create a mutable copy of the template
	let template = $state<FormTemplate>({ ...data.template });
	let isSaving = $state(false);
	let formElement: HTMLFormElement;

	async function handleSave() {
		isSaving = true;
		formElement.requestSubmit();
	}

	function handlePreview() {
		goto(`/dashboard/forms/${template.id}/preview`);
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
					<h1 class="text-lg font-semibold">Edit Form</h1>
					<p class="text-muted-foreground text-sm">{template.name}</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<Button variant="outline" onclick={handlePreview}>
					<EyeIcon class="mr-2 h-4 w-4" />
					Preview
				</Button>
				<Button onclick={handleSave} disabled={isSaving}>
					<SaveIcon class="mr-2 h-4 w-4" />
					{isSaving ? "Saving..." : "Save Changes"}
				</Button>
			</div>
		</div>
	</div>

	<!-- Hidden form for submission -->
	<form
		bind:this={formElement}
		method="POST"
		action="?/save"
		class="hidden"
		use:enhance={() => {
			return async ({ result }) => {
				isSaving = false;
				if (result.type === "success") {
					toast.success("Form saved successfully");
				} else if (result.type === "failure") {
					toast.error("Failed to save form");
				}
			};
		}}
	>
		<input type="hidden" name="name" value={template.name} />
		<input type="hidden" name="description" value={template.description || ""} />
		<input type="hidden" name="questions" value={JSON.stringify(template.questions)} />
	</form>

	<!-- Form Builder -->
	<div class="flex-1 overflow-auto p-4 md:p-6">
		<FormBuilder
			bind:template
			onSave={async (t) => {
				template = t;
				await handleSave();
			}}
			onPreview={handlePreview}
			{isSaving}
		/>
	</div>
</div>
