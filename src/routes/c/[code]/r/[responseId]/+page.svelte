<script lang="ts">
	import { Button } from "@/components/ui/button";
	import { goto } from "$app/navigation";
	import { toast } from "svelte-sonner";

	let { data } = $props();

	let submitting = $state(false);

	async function finalize() {
		submitting = true;
		const res = await fetch(`/api/responses/${data.response.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ finalize: true })
		});
		submitting = false;
		if (!res.ok) {
			toast.error("Could not submit. Please try again.");
			return;
		}
		goto(`/c/${data.clinic.code}/done/${data.response.id}`);
	}
</script>

<main class="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
	<header class="mb-6">
		<p class="text-muted-foreground text-xs uppercase tracking-wider">{data.clinic.name}</p>
		<h1 class="text-2xl font-bold">{data.template.name}</h1>
		<p class="text-muted-foreground mt-1 text-sm">For: {data.response.patientName}</p>
	</header>

	<div class="border-muted rounded border border-dashed p-6 text-center text-sm">
		<p class="font-semibold">Kiosk wizard placeholder.</p>
		<p class="text-muted-foreground mt-2">
			Question-by-question UI lands in phase 8. For now you can submit an empty response to test
			the secretary queue flow.
		</p>
	</div>

	<div class="mt-8 flex gap-3">
		<a href={`/c/${data.clinic.code}`} class="flex-1">
			<Button variant="outline" class="w-full">Cancel</Button>
		</a>
		<Button class="flex-1" onclick={finalize} disabled={submitting}>
			{submitting ? "Submitting..." : "Submit"}
		</Button>
	</div>
</main>
