<script lang="ts">
	import type { PageData } from "./$types";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as AlertDialog from "$lib/components/ui/alert-dialog";
	import { Input } from "$lib/components/ui/input";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Label } from "$lib/components/ui/label";
	import { Badge } from "$lib/components/ui/badge";
	import { enhance } from "$app/forms";
	import { toast } from "svelte-sonner";

	// Icons
	import PlusIcon from "@tabler/icons-svelte/icons/plus";
	import EditIcon from "@tabler/icons-svelte/icons/edit";
	import TrashIcon from "@tabler/icons-svelte/icons/trash";
	import CopyIcon from "@tabler/icons-svelte/icons/copy";
	import FileTextIcon from "@tabler/icons-svelte/icons/file-text";
	import EyeIcon from "@tabler/icons-svelte/icons/eye";

	let { data }: { data: PageData } = $props();

	let isCreateDialogOpen = $state(false);
	let isDuplicateDialogOpen = $state(false);
	let isDeleteDialogOpen = $state(false);

	let selectedTemplateId = $state<string | null>(null);
	let selectedTemplateName = $state("");
	let newFormName = $state("");
	let newFormDescription = $state("");

	function openDuplicateDialog(templateId: string, templateName: string) {
		selectedTemplateId = templateId;
		selectedTemplateName = templateName;
		isDuplicateDialogOpen = true;
	}

	function openDeleteDialog(templateId: string, templateName: string) {
		selectedTemplateId = templateId;
		selectedTemplateName = templateName;
		isDeleteDialogOpen = true;
	}

	function resetCreateForm() {
		newFormName = "";
		newFormDescription = "";
	}
</script>

<div class="flex flex-1 flex-col">
	<div class="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold tracking-tight">Form Templates</h1>
				<p class="text-muted-foreground">Create and manage custom forms for your clinic</p>
			</div>
			<Dialog.Root bind:open={isCreateDialogOpen}>
				<Dialog.Trigger>
					{#snippet child({ props })}
						<Button {...props}>
							<PlusIcon class="mr-2 h-4 w-4" />
							Create Form
						</Button>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>Create New Form</Dialog.Title>
						<Dialog.Description>
							Start with a blank form and add fields in the builder.
						</Dialog.Description>
					</Dialog.Header>
					<form
						method="POST"
						action="?/create"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type === "redirect") {
									isCreateDialogOpen = false;
									resetCreateForm();
								} else if (result.type === "failure") {
									toast.error("Failed to create form");
								}
							};
						}}
					>
						<div class="space-y-4 py-4">
							<div class="space-y-2">
								<Label for="name">Form Name</Label>
								<Input
									id="name"
									name="name"
									placeholder="e.g., Patient Intake Form"
									bind:value={newFormName}
									required
								/>
							</div>
							<div class="space-y-2">
								<Label for="description">Description (optional)</Label>
								<Textarea
									id="description"
									name="description"
									placeholder="Describe what this form is for..."
									bind:value={newFormDescription}
								/>
							</div>
							<input type="hidden" name="clinicId" value="placeholder-clinic-id" />
						</div>
						<Dialog.Footer>
							<Button type="button" variant="outline" onclick={() => (isCreateDialogOpen = false)}>
								Cancel
							</Button>
							<Button type="submit">Create Form</Button>
						</Dialog.Footer>
					</form>
				</Dialog.Content>
			</Dialog.Root>
		</div>

		<!-- Templates Grid -->
		{#if data.templates.length === 0}
			<Card.Root class="border-2 border-dashed">
				<Card.Content class="flex flex-col items-center justify-center py-16 text-center">
					<FileTextIcon class="text-muted-foreground h-12 w-12" />
					<h3 class="mt-4 text-lg font-semibold">No forms yet</h3>
					<p class="text-muted-foreground mt-2 text-sm">
						Create your first form to start collecting patient information.
					</p>
					<Button class="mt-4" onclick={() => (isCreateDialogOpen = true)}>
						<PlusIcon class="mr-2 h-4 w-4" />
						Create Your First Form
					</Button>
				</Card.Content>
			</Card.Root>
		{:else}
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each data.templates as template}
					<Card.Root class="group relative">
						<Card.Header>
							<div class="flex items-start justify-between">
								<div class="space-y-1">
									<Card.Title class="line-clamp-1">{template.name}</Card.Title>
									{#if template.description}
										<Card.Description class="line-clamp-2">
											{template.description}
										</Card.Description>
									{/if}
								</div>
								<Badge variant={template.status === "active" ? "default" : "secondary"}>
									{template.status}
								</Badge>
							</div>
						</Card.Header>
						<Card.Content>
							<div class="text-muted-foreground text-sm">
								{template.questions.length} field{template.questions.length !== 1 ? "s" : ""}
							</div>
						</Card.Content>
						<Card.Footer class="flex gap-2">
							<Button variant="outline" size="sm" href={`/dashboard/forms/${template.id}/edit`}>
								<EditIcon class="mr-2 h-4 w-4" />
								Edit
							</Button>
							<Button variant="outline" size="sm" href={`/dashboard/forms/${template.id}/preview`}>
								<EyeIcon class="mr-2 h-4 w-4" />
								Preview
							</Button>
							<Button
								variant="ghost"
								size="icon"
								class="h-8 w-8"
								onclick={() => openDuplicateDialog(template.id, template.name)}
							>
								<CopyIcon class="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								class="text-destructive hover:text-destructive h-8 w-8"
								onclick={() => openDeleteDialog(template.id, template.name)}
							>
								<TrashIcon class="h-4 w-4" />
							</Button>
						</Card.Footer>
					</Card.Root>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Duplicate Dialog -->
<Dialog.Root bind:open={isDuplicateDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Duplicate Form</Dialog.Title>
			<Dialog.Description>
				Create a copy of "{selectedTemplateName}" with a new name.
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/duplicate"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === "redirect") {
						isDuplicateDialogOpen = false;
						toast.success("Form duplicated successfully");
					} else if (result.type === "failure") {
						toast.error("Failed to duplicate form");
					}
				};
			}}
		>
			<div class="space-y-4 py-4">
				<div class="space-y-2">
					<Label for="newName">New Form Name</Label>
					<Input
						id="newName"
						name="newName"
						placeholder="e.g., Patient Intake Form (Copy)"
						value={`${selectedTemplateName} (Copy)`}
						required
					/>
				</div>
				<input type="hidden" name="templateId" value={selectedTemplateId} />
				<input type="hidden" name="clinicId" value="placeholder-clinic-id" />
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (isDuplicateDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit">Duplicate</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={isDeleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Form</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to delete "{selectedTemplateName}"? This action cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					return async ({ result }) => {
						isDeleteDialogOpen = false;
						if (result.type === "success") {
							toast.success("Form deleted successfully");
						} else {
							toast.error("Failed to delete form");
						}
					};
				}}
			>
				<input type="hidden" name="templateId" value={selectedTemplateId} />
				<AlertDialog.Action
					type="submit"
					class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
				>
					Delete
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
