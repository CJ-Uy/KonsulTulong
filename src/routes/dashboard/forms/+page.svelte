<script lang="ts">
	import { Button } from "@/components/ui/button";
	import { goto, invalidateAll } from "$app/navigation";
	import { toast } from "svelte-sonner";

	let { data } = $props();

	async function createBlank() {
		const res = await fetch("/api/templates", { method: "POST" });
		if (!res.ok) {
			toast.error("Could not create");
			return;
		}
		const { id } = (await res.json()) as { id: string };
		goto(`/dashboard/forms/${id}/edit`);
	}

	async function remove(id: string) {
		if (!confirm("Delete this form? Submitted responses keep their copy.")) return;
		const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
		if (!res.ok) {
			toast.error("Could not delete");
			return;
		}
		invalidateAll();
	}

	async function seed() {
		const res = await fetch("/api/templates/seed", { method: "POST" });
		if (!res.ok) {
			toast.error("Could not seed");
			return;
		}
		const { inserted } = (await res.json()) as { inserted: { name: string }[] };
		if (inserted.length === 0) toast("All validated templates already present.");
		else toast.success(`Installed ${inserted.length} validated template(s).`);
		invalidateAll();
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Forms</h1>
		<div class="flex gap-2">
			<Button variant="outline" onclick={seed}>Install validated templates</Button>
			<Button onclick={createBlank}>+ New form</Button>
		</div>
	</div>

	{#if data.templates.length === 0}
		<div class="rounded border border-dashed p-8 text-center text-sm">
			<p>No forms yet. Create one to start collecting patient answers.</p>
		</div>
	{:else}
		<ul class="space-y-2">
			{#each data.templates as t (t.id)}
				<li class="rounded border p-4">
					<div class="flex items-center justify-between gap-3">
						<div>
							<p class="font-semibold">
								{t.name}
								{#if !t.isActive}
									<span class="text-muted-foreground ml-2 text-xs">(inactive)</span>
								{/if}
								{#if t.assistedOnly}
									<span class="ml-2 text-xs text-amber-600">assisted-only</span>
								{/if}
							</p>
							{#if t.description}
								<p class="text-muted-foreground mt-1 text-sm">{t.description}</p>
							{/if}
							<p class="text-muted-foreground mt-1 text-xs">
								v{t.version} · updated {new Date(t.updatedAt).toLocaleString()}
							</p>
						</div>
						<div class="flex gap-2">
							<a href={`/dashboard/forms/${t.id}/preview`}>
								<Button size="sm" variant="outline">Preview</Button>
							</a>
							<a href={`/dashboard/forms/${t.id}/edit`}>
								<Button size="sm">Edit</Button>
							</a>
							<Button size="sm" variant="outline" onclick={() => remove(t.id)}>Delete</Button>
						</div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
