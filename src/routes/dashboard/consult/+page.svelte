<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Button } from "@/components/ui/button";
	import { Textarea } from "@/components/ui/textarea";
	import { toast } from "svelte-sonner";
	import type { FormField } from "$lib/types/forms";
	import type { ScoreResult, AnswerValue } from "$lib/types";

	type Status = "queued" | "in_consult" | "done" | "skipped";
	type VisitRow = {
		id: string;
		queueNumber: number;
		patientName: string;
		patientBirthdate: number | null;
		patientSex: "M" | "F" | "U" | null;
		status: Status;
		arrivedAt: number;
		doctorNotes: string | null;
	};
	type ResponseRow = {
		id: string;
		visitId: string | null;
		templateId: string;
		templateName: string;
		patientName: string;
		patientBirthdate: number | null;
		score: ScoreResult | null;
		status: string;
		submittedAt: number;
	};
	type ResponseDetail = {
		id: string;
		templateId: string;
		values: Record<string, AnswerValue>;
		score: ScoreResult | null;
		templateName: string;
		questions: FormField[];
	};

	let visits = $state<VisitRow[]>([]);
	let linkedResponses = $state<ResponseRow[]>([]);
	let loading = $state(true);
	let interval: ReturnType<typeof setInterval> | null = null;

	const nowServing = $derived(visits.find((v) => v.status === "in_consult") ?? null);
	let viewingId = $state<string | null>(null);
	const viewing = $derived(
		viewingId
			? visits.find((v) => v.id === viewingId) ?? null
			: nowServing
	);
	const divergent = $derived(
		viewingId !== null && nowServing !== null && viewing?.id !== nowServing.id
	);

	const responsesForViewing = $derived(
		viewing ? linkedResponses.filter((r) => r.visitId === viewing.id) : []
	);

	let detailed = $state<Record<string, ResponseDetail>>({});
	let history = $state<ResponseRow[]>([]);
	let notes = $state("");
	let notesSavedFor = $state<string | null>(null);
	let notesTimer: ReturnType<typeof setTimeout> | null = null;

	async function refresh() {
		const res = await fetch("/api/queue");
		if (!res.ok) {
			loading = false;
			return;
		}
		const p = (await res.json()) as {
			visits: VisitRow[];
			linkedResponses: ResponseRow[];
		};
		visits = p.visits;
		linkedResponses = p.linkedResponses;
		loading = false;
	}

	async function loadDetail(id: string) {
		if (detailed[id]) return;
		const res = await fetch(`/api/responses/${id}/full`);
		if (!res.ok) return;
		const d = (await res.json()) as ResponseDetail;
		detailed = { ...detailed, [id]: d };
	}

	async function loadHistory(v: VisitRow) {
		if (!v.patientBirthdate) {
			history = [];
			return;
		}
		const url = `/api/responses/history?name=${encodeURIComponent(v.patientName)}&birthdate=${v.patientBirthdate}`;
		const res = await fetch(url);
		if (!res.ok) {
			history = [];
			return;
		}
		const { history: h } = (await res.json()) as { history: ResponseRow[] };
		history = h.filter((r) => !viewing || !linkedResponses.some((lr) => lr.id === r.id));
	}

	async function callNext() {
		const res = await fetch("/api/queue/advance", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ currentVisitId: nowServing?.id ?? null })
		});
		if (!res.ok) {
			toast.error("Could not advance");
			return;
		}
		const body = (await res.json()) as { nextVisitId: string | null };
		if (!body.nextVisitId) toast("Queue is empty");
		viewingId = null;
		await refresh();
	}

	function scheduleNotesSave() {
		if (!viewing) return;
		const id = viewing.id;
		if (notesTimer) clearTimeout(notesTimer);
		notesTimer = setTimeout(async () => {
			const res = await fetch(`/api/visits/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ doctorNotes: notes })
			});
			if (res.ok) {
				notesSavedFor = id;
				setTimeout(() => (notesSavedFor = null), 1500);
			}
		}, 700);
	}

	$effect(() => {
		if (viewing) {
			notes = viewing.doctorNotes ?? "";
			loadHistory(viewing);
			for (const r of responsesForViewing) loadDetail(r.id);
		} else {
			notes = "";
			history = [];
		}
	});

	onMount(() => {
		refresh();
		interval = setInterval(refresh, 4000);
	});
	onDestroy(() => {
		if (interval) clearInterval(interval);
		if (notesTimer) clearTimeout(notesTimer);
	});

	function ageYears(birthMs: number | null): number | null {
		if (!birthMs) return null;
		return Math.floor((Date.now() - birthMs) / (365.25 * 24 * 60 * 60 * 1000));
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between gap-3">
		<div>
			<h1 class="text-2xl font-bold">Consult</h1>
			{#if nowServing}
				<p class="text-muted-foreground text-sm">
					Now serving #{nowServing.queueNumber} · {nowServing.patientName}
				</p>
			{:else}
				<p class="text-muted-foreground text-sm">No one is currently being seen.</p>
			{/if}
		</div>
		<div class="flex gap-2">
			<select
				class="bg-background rounded border p-2 text-sm"
				value={viewingId ?? ""}
				onchange={(e) => {
					const v = (e.currentTarget as HTMLSelectElement).value;
					viewingId = v === "" ? null : v;
				}}
			>
				<option value="">Auto: now serving</option>
				{#each visits as v (v.id)}
					<option value={v.id}>
						#{v.queueNumber} · {v.patientName} ({v.status})
					</option>
				{/each}
			</select>
			<Button onclick={callNext}>Done · Next</Button>
		</div>
	</div>

	{#if divergent && nowServing && viewing}
		<div class="rounded border border-amber-400 bg-amber-50 p-3 text-sm">
			You are viewing #{viewing.queueNumber} ({viewing.patientName}). Now serving is #{nowServing.queueNumber}
			({nowServing.patientName}).
			<button class="underline" onclick={() => (viewingId = null)}>Jump to now serving</button>
		</div>
	{/if}

	{#if !viewing}
		<div class="rounded border border-dashed p-8 text-center text-sm">
			Pick a patient from the dropdown or click Done · Next.
		</div>
	{:else}
		<header class="rounded border p-4">
			<p class="text-2xl font-bold">
				#{viewing.queueNumber} · {viewing.patientName}
			</p>
			<p class="text-muted-foreground text-sm">
				{#if viewing.patientSex && viewing.patientSex !== "U"}{viewing.patientSex} ·{/if}
				{#if ageYears(viewing.patientBirthdate) !== null}{ageYears(viewing.patientBirthdate)}y ·{/if}
				Arrived {new Date(viewing.arrivedAt).toLocaleTimeString()}
			</p>
		</header>

		{#if responsesForViewing.length === 0}
			<div class="rounded border border-dashed p-8 text-center text-sm">
				<p class="font-semibold">No form submitted.</p>
				<p class="text-muted-foreground mt-1">
					This patient did not fill out the form. Proceed with consultation.
				</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each responsesForViewing as r (r.id)}
					{@const detail = detailed[r.id]}
					<section class="rounded border p-4">
						<div class="flex items-center justify-between">
							<h2 class="font-semibold">{r.templateName}</h2>
							{#if r.score}
								<span
									class="rounded px-3 py-1 text-sm font-semibold text-white"
									style:background-color={r.score.band.color}
								>
									{r.score.total} · {r.score.band.label}
								</span>
							{/if}
						</div>
						{#if r.score?.redFlags}
							<div class="mt-3 rounded border border-red-400 bg-red-50 p-3 text-sm">
								<p class="font-semibold text-red-700">Red flags</p>
								<ul class="mt-1 list-inside list-disc text-red-700">
									{#each r.score.redFlags as f (f.questionId)}
										<li>{f.message}</li>
									{/each}
								</ul>
							</div>
						{/if}
						{#if r.score}
							<p class="mt-2 text-sm">{r.score.band.advice}</p>
						{/if}
						{#if detail}
							<details class="mt-3 text-sm">
								<summary class="cursor-pointer underline">Show answers</summary>
								<dl class="mt-2 space-y-1">
									{#each detail.questions as q (q.id)}
										{#if q.type !== "section_header"}
											<div class="grid grid-cols-2 gap-2 border-b py-1">
												<dt class="text-muted-foreground">{q.text}</dt>
												<dd>
													{#if Array.isArray(detail.values[q.id])}
														{(detail.values[q.id] as string[]).join(", ")}
													{:else if typeof detail.values[q.id] === "boolean"}
														{detail.values[q.id] ? "Yes" : "No"}
													{:else if detail.values[q.id] === null || detail.values[q.id] === undefined}
														<span class="text-muted-foreground italic">(empty)</span>
													{:else}
														{String(detail.values[q.id])}
													{/if}
												</dd>
											</div>
										{/if}
									{/each}
								</dl>
							</details>
						{/if}
					</section>
				{/each}
			</div>
		{/if}

		{#if history.length > 0}
			<section class="rounded border p-4">
				<h2 class="font-semibold">History (same name + birthdate)</h2>
				<ul class="mt-2 space-y-1 text-sm">
					{#each history as h (h.id)}
						<li class="flex items-center justify-between border-b py-1">
							<span>
								{new Date(h.submittedAt).toLocaleDateString()} · {h.templateName}
							</span>
							{#if h.score}
								<span
									class="rounded px-2 py-0.5 text-xs font-semibold text-white"
									style:background-color={h.score.band.color}
								>
									{h.score.total} · {h.score.band.label}
								</span>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<section class="rounded border p-4">
			<div class="mb-2 flex items-center justify-between">
				<h2 class="font-semibold">Notes</h2>
				{#if notesSavedFor === viewing.id}
					<span class="text-xs text-green-700">Saved</span>
				{/if}
			</div>
			<Textarea rows={4} bind:value={notes} oninput={scheduleNotesSave} />
		</section>
	{/if}
</div>
