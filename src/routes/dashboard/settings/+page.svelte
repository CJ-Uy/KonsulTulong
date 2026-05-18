<script lang="ts">
	import { Button } from "@/components/ui/button";
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
	import { toast } from "svelte-sonner";

	let eraseName = $state("");
	let bdYear = $state("");
	let bdMonth = $state("");
	let bdDay = $state("");
	let erasing = $state(false);

	async function erase() {
		const y = Number(bdYear);
		const m = Number(bdMonth);
		const d = Number(bdDay);
		if (!eraseName.trim() || !y || !m || !d) {
			toast.error("Name and birthdate required");
			return;
		}
		if (!confirm(`Permanently delete all responses for "${eraseName}" born ${y}-${m}-${d}? This cannot be undone.`)) return;
		erasing = true;
		const res = await fetch("/api/admin/erase", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: eraseName.trim(),
				birthdate: Date.UTC(y, m - 1, d)
			})
		});
		erasing = false;
		if (!res.ok) {
			toast.error("Erasure failed");
			return;
		}
		const { deleted } = (await res.json()) as { deleted: number };
		toast.success(`Deleted ${deleted} response(s).`);
		eraseName = "";
		bdYear = "";
		bdMonth = "";
		bdDay = "";
	}
</script>

<div class="space-y-6">
	<h1 class="text-2xl font-bold">Settings</h1>

	<section class="space-y-2 rounded border p-4">
		<h2 class="font-semibold">Clinic QR poster</h2>
		<p class="text-muted-foreground text-sm">
			Print or save an A4 poster patients can scan to fill the form.
		</p>
		<a href="/dashboard/settings/poster">
			<Button variant="outline">Open poster</Button>
		</a>
	</section>

	<section class="space-y-3 rounded border p-4">
		<h2 class="font-semibold">Patient data erasure</h2>
		<p class="text-muted-foreground text-sm">
			Delete every response and attached file for a patient. Use only on a verified
			patient request. The action is logged in the audit trail.
		</p>
		<div class="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-end">
			<div class="space-y-1">
				<Label class="text-xs">Patient name (exact match)</Label>
				<Input bind:value={eraseName} />
			</div>
			<div class="space-y-1">
				<Label class="text-xs">Year</Label>
				<Input bind:value={bdYear} maxlength={4} inputmode="numeric" />
			</div>
			<div class="space-y-1">
				<Label class="text-xs">Month</Label>
				<Input bind:value={bdMonth} maxlength={2} inputmode="numeric" />
			</div>
			<div class="space-y-1">
				<Label class="text-xs">Day</Label>
				<Input bind:value={bdDay} maxlength={2} inputmode="numeric" />
			</div>
			<Button variant="destructive" onclick={erase} disabled={erasing}>
				{erasing ? "Erasing..." : "Erase"}
			</Button>
		</div>
	</section>
</div>
