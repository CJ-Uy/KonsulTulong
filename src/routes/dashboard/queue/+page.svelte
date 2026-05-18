<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Button } from "@/components/ui/button";
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
	import * as Dialog from "@/components/ui/dialog";
	import { toast } from "svelte-sonner";

	let { data } = $props();

	type VisitRow = {
		id: string;
		queueNumber: number;
		patientName: string;
		patientBirthdate: number | null;
		patientSex: "M" | "F" | "U" | null;
		status: "queued" | "in_consult" | "done" | "skipped";
		arrivedAt: number;
	};
	type Score = { total: number; band: { label: string; severity: string; color: string } } | null;
	type ResponseRow = {
		id: string;
		visitId: string | null;
		templateId: string;
		templateName: string;
		patientName: string;
		patientBirthdate: number | null;
		score: Score;
		status: string;
		submittedAt: number;
	};

	let visits = $state<VisitRow[]>([]);
	let linkedResponses = $state<ResponseRow[]>([]);
	let unmatched = $state<ResponseRow[]>([]);
	let loading = $state(true);
	let interval: ReturnType<typeof setInterval> | null = null;

	const role = data.user.role;
	const showScoresExpanded = role === "doctor" || role === "admin";

	async function refresh() {
		const res = await fetch("/api/queue");
		if (!res.ok) {
			toast.error("Could not load queue");
			loading = false;
			return;
		}
		const payload = (await res.json()) as {
			visits: VisitRow[];
			linkedResponses: ResponseRow[];
			unmatched: ResponseRow[];
		};
		visits = payload.visits;
		linkedResponses = payload.linkedResponses;
		unmatched = payload.unmatched;
		loading = false;
	}

	onMount(() => {
		refresh();
		interval = setInterval(refresh, 4000);
	});
	onDestroy(() => {
		if (interval) clearInterval(interval);
	});

	const nowServing = $derived(visits.find((v) => v.status === "in_consult") ?? null);

	function ageYears(birthMs: number | null): number | null {
		if (!birthMs) return null;
		const diff = Date.now() - birthMs;
		return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
	}

	function responsesFor(visitId: string): ResponseRow[] {
		return linkedResponses.filter((r) => r.visitId === visitId);
	}

	// Manual add dialog
	let dialogOpen = $state(false);
	let newName = $state("");
	let newBirthYear = $state("");
	let newBirthMonth = $state("");
	let newBirthDay = $state("");
	let newSex = $state<"M" | "F" | "U">("U");
	let newPhone = $state("");
	let adding = $state(false);

	function newBirthdateMs(): number | null {
		const y = Number(newBirthYear);
		const m = Number(newBirthMonth);
		const d = Number(newBirthDay);
		if (!y || !m || !d) return null;
		return Date.UTC(y, m - 1, d);
	}

	async function addVisit(e: Event) {
		e.preventDefault();
		if (!newName.trim()) {
			toast.error("Name required");
			return;
		}
		adding = true;
		const res = await fetch("/api/visits", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: newName,
				birthdate: newBirthdateMs(),
				sex: newSex,
				phone: newPhone.trim() || null
			})
		});
		adding = false;
		if (!res.ok) {
			toast.error("Could not add patient");
			return;
		}
		newName = "";
		newBirthYear = "";
		newBirthMonth = "";
		newBirthDay = "";
		newSex = "U";
		newPhone = "";
		dialogOpen = false;
		toast.success("Added to queue");
		refresh();
	}

	async function setStatus(id: string, status: VisitRow["status"]) {
		const res = await fetch(`/api/visits/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status })
		});
		if (!res.ok) {
			toast.error("Could not update status");
			return;
		}
		refresh();
	}

	async function callNext(currentId: string | null) {
		const res = await fetch("/api/queue/advance", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ currentVisitId: currentId })
		});
		if (!res.ok) {
			toast.error("Could not advance");
			return;
		}
		const body = (await res.json()) as { nextVisitId: string | null };
		if (!body.nextVisitId) toast("Queue is empty");
		refresh();
	}

	async function linkResponse(responseId: string, visitId: string | null) {
		const res = await fetch(`/api/responses/${responseId}/link`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ visitId })
		});
		if (!res.ok) {
			toast.error("Could not link");
			return;
		}
		toast.success(visitId ? "Linked" : "Unlinked");
		refresh();
	}

	function suggestVisitFor(r: ResponseRow): VisitRow[] {
		const namePart = r.patientName.toLowerCase().trim();
		return visits
			.filter((v) => v.status === "queued" || v.status === "in_consult")
			.filter((v) => v.patientName.toLowerCase().trim().includes(namePart.split(" ")[0]));
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold">Queue</h1>
			<p class="text-muted-foreground text-sm">Today, {new Date().toDateString()}</p>
		</div>
		<div class="flex gap-2">
			<Button onclick={() => (dialogOpen = true)}>+ Add patient</Button>
			{#if role === "doctor" || role === "admin"}
				<Button variant="outline" onclick={() => callNext(nowServing?.id ?? null)}>
					Done · Next
				</Button>
			{/if}
		</div>
	</div>

	<div class="rounded border bg-muted/40 p-4">
		<p class="text-muted-foreground text-xs uppercase tracking-wider">Now serving</p>
		{#if nowServing}
			<p class="mt-1 text-2xl font-semibold">
				#{nowServing.queueNumber} · {nowServing.patientName}
			</p>
		{:else}
			<p class="text-muted-foreground mt-1 text-base italic">Nobody yet.</p>
		{/if}
	</div>

	<div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
		<section class="space-y-3">
			<h2 class="font-semibold">Queue ({visits.length})</h2>
			{#if loading && visits.length === 0}
				<p class="text-muted-foreground text-sm">Loading...</p>
			{:else if visits.length === 0}
				<p class="text-muted-foreground text-sm">No patients today yet.</p>
			{:else}
				<ul class="space-y-2">
					{#each visits as v (v.id)}
						{@const responses = responsesFor(v.id)}
						{@const age = ageYears(v.patientBirthdate)}
						<li class="rounded border p-3">
							<div class="flex items-center justify-between gap-3">
								<div>
									<p class="font-semibold">
										#{v.queueNumber} · {v.patientName}
										{#if age !== null}
											<span class="text-muted-foreground text-xs">· {age}y</span>
										{/if}
										{#if v.patientSex && v.patientSex !== "U"}
											<span class="text-muted-foreground text-xs">· {v.patientSex}</span>
										{/if}
									</p>
									<p class="text-muted-foreground text-xs">
										Status: {v.status}
										· Arrived {new Date(v.arrivedAt).toLocaleTimeString()}
									</p>
								</div>
								<div class="flex gap-2">
									{#if v.status === "queued"}
										<Button size="sm" variant="outline" onclick={() => setStatus(v.id, "skipped")}>
											Skip
										</Button>
										{#if role === "doctor" || role === "admin"}
											<Button size="sm" onclick={() => setStatus(v.id, "in_consult")}>
												Call
											</Button>
										{/if}
									{:else if v.status === "in_consult" && (role === "doctor" || role === "admin")}
										<Button size="sm" onclick={() => setStatus(v.id, "done")}>Done</Button>
									{:else if v.status === "skipped"}
										<Button size="sm" variant="outline" onclick={() => setStatus(v.id, "queued")}>
											Re-add
										</Button>
									{/if}
								</div>
							</div>

							{#if responses.length > 0}
								<div class="mt-2 space-y-1 border-t pt-2 text-xs">
									{#each responses as r (r.id)}
										<div class="flex items-center justify-between gap-2">
											<span>
												<span class="font-medium">{r.templateName}</span>
												{#if showScoresExpanded && r.score}
													<span
														class="ml-2 inline-block rounded px-2 py-0.5 text-xs font-semibold text-white"
														style:background-color={r.score.band.color}
													>
														{r.score.total} · {r.score.band.label}
													</span>
												{:else if r.score}
													<span class="text-muted-foreground ml-2">(score available)</span>
												{/if}
											</span>
											<button
												class="text-muted-foreground hover:underline"
												onclick={() => linkResponse(r.id, null)}
											>
												unlink
											</button>
										</div>
									{/each}
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section class="space-y-3">
			<h2 class="font-semibold">Incoming responses ({unmatched.length})</h2>
			{#if unmatched.length === 0}
				<p class="text-muted-foreground text-sm">No pending matches.</p>
			{:else}
				<ul class="space-y-2">
					{#each unmatched as r (r.id)}
						{@const candidates = suggestVisitFor(r)}
						<li class="rounded border p-3">
							<p class="font-semibold">{r.patientName}</p>
							<p class="text-muted-foreground text-xs">
								{r.templateName} · {new Date(r.submittedAt).toLocaleTimeString()}
							</p>
							<div class="mt-2">
								<Label class="text-muted-foreground text-xs">Link to queue:</Label>
								<select
									class="bg-background mt-1 w-full rounded border p-1 text-sm"
									onchange={(e) => {
										const v = (e.currentTarget as HTMLSelectElement).value;
										if (v) linkResponse(r.id, v);
									}}
								>
									<option value="">Choose a patient...</option>
									{#if candidates.length > 0}
										<optgroup label="Likely match">
											{#each candidates as c (c.id)}
												<option value={c.id}>
													#{c.queueNumber} · {c.patientName}
												</option>
											{/each}
										</optgroup>
									{/if}
									<optgroup label="All today">
										{#each visits as v (v.id)}
											<option value={v.id}>
												#{v.queueNumber} · {v.patientName} ({v.status})
											</option>
										{/each}
									</optgroup>
								</select>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
</div>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add patient to queue</Dialog.Title>
			<Dialog.Description>Walk-in or pre-arrival check-in.</Dialog.Description>
		</Dialog.Header>
		<form onsubmit={addVisit} class="space-y-3">
			<div class="space-y-1">
				<Label for="add-name">Full name</Label>
				<Input id="add-name" required bind:value={newName} />
			</div>
			<div class="space-y-1">
				<Label>Birthdate (optional)</Label>
				<div class="grid grid-cols-3 gap-2">
					<Input placeholder="YYYY" maxlength={4} bind:value={newBirthYear} />
					<Input placeholder="MM" maxlength={2} bind:value={newBirthMonth} />
					<Input placeholder="DD" maxlength={2} bind:value={newBirthDay} />
				</div>
			</div>
			<div class="space-y-1">
				<Label>Sex</Label>
				<div class="grid grid-cols-3 gap-2">
					<Button
						type="button"
						variant={newSex === "F" ? "default" : "outline"}
						size="sm"
						onclick={() => (newSex = "F")}
					>
						F
					</Button>
					<Button
						type="button"
						variant={newSex === "M" ? "default" : "outline"}
						size="sm"
						onclick={() => (newSex = "M")}
					>
						M
					</Button>
					<Button
						type="button"
						variant={newSex === "U" ? "default" : "outline"}
						size="sm"
						onclick={() => (newSex = "U")}
					>
						—
					</Button>
				</div>
			</div>
			<div class="space-y-1">
				<Label for="add-phone">Phone (optional)</Label>
				<Input id="add-phone" inputmode="tel" bind:value={newPhone} />
			</div>
			<div class="flex justify-end gap-2 pt-2">
				<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
				<Button type="submit" disabled={adding}>{adding ? "Adding..." : "Add"}</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
