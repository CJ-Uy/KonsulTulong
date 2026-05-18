<script lang="ts">
	import { Button } from "@/components/ui/button";
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
	import { goto } from "$app/navigation";
	import { toast } from "svelte-sonner";
	import { CONSENT_TEXT_EN, CONSENT_VERSION } from "$lib/forms/consent";

	let { data } = $props();

	type Step = "consent" | "identity";
	let step = $state<Step>("consent");

	let name = $state("");
	let birthYear = $state("");
	let birthMonth = $state("");
	let birthDay = $state("");
	let sex = $state<"M" | "F" | "U">("U");
	let phone = $state("");
	let submitting = $state(false);

	function birthdateMs(): number | null {
		const y = Number(birthYear);
		const m = Number(birthMonth);
		const d = Number(birthDay);
		if (!y || !m || !d) return null;
		if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
		return Date.UTC(y, m - 1, d);
	}

	async function startResponse(e: Event) {
		e.preventDefault();
		if (!name.trim()) {
			toast.error("Please enter your name.");
			return;
		}
		const bd = birthdateMs();
		if (!bd) {
			toast.error("Please enter a complete birthdate.");
			return;
		}
		submitting = true;
		const res = await fetch("/api/responses", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				clinicCode: data.clinic.code,
				templateId: data.template.id,
				patient: {
					name: name.trim(),
					birthdate: bd,
					sex,
					phone: phone.trim() || null
				},
				consent: {
					text: CONSENT_TEXT_EN,
					version: CONSENT_VERSION
				}
			})
		});
		submitting = false;
		if (!res.ok) {
			toast.error("Could not start the form. Please try again.");
			return;
		}
		const { responseId } = (await res.json()) as { responseId: string };
		goto(`/c/${data.clinic.code}/r/${responseId}`);
	}
</script>

<main class="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
	<header class="mb-6">
		<p class="text-muted-foreground text-xs uppercase tracking-wider">{data.clinic.name}</p>
		<h1 class="text-2xl font-bold">{data.template.name}</h1>
	</header>

	{#if step === "consent"}
		<section class="space-y-4">
			<h2 class="text-lg font-semibold">Before we begin</h2>
			<p class="text-sm leading-relaxed">{CONSENT_TEXT_EN}</p>
			<div class="flex gap-3 pt-4">
				<a href={`/c/${data.clinic.code}`} class="flex-1">
					<Button variant="outline" class="w-full">Cancel</Button>
				</a>
				<Button class="flex-1" onclick={() => (step = "identity")}>I agree</Button>
			</div>
		</section>
	{:else}
		<form onsubmit={startResponse} class="space-y-5">
			<div class="space-y-2">
				<Label for="name">Full name</Label>
				<Input id="name" required autocomplete="name" bind:value={name} />
			</div>

			<div class="space-y-2">
				<Label>Birthdate</Label>
				<div class="grid grid-cols-3 gap-2">
					<Input
						placeholder="YYYY"
						inputmode="numeric"
						maxlength={4}
						bind:value={birthYear}
					/>
					<Input
						placeholder="MM"
						inputmode="numeric"
						maxlength={2}
						bind:value={birthMonth}
					/>
					<Input
						placeholder="DD"
						inputmode="numeric"
						maxlength={2}
						bind:value={birthDay}
					/>
				</div>
			</div>

			<div class="space-y-2">
				<Label>Sex</Label>
				<div class="grid grid-cols-3 gap-2">
					<Button
						type="button"
						variant={sex === "F" ? "default" : "outline"}
						onclick={() => (sex = "F")}
					>
						Female
					</Button>
					<Button
						type="button"
						variant={sex === "M" ? "default" : "outline"}
						onclick={() => (sex = "M")}
					>
						Male
					</Button>
					<Button
						type="button"
						variant={sex === "U" ? "default" : "outline"}
						onclick={() => (sex = "U")}
					>
						Prefer not to say
					</Button>
				</div>
			</div>

			<div class="space-y-2">
				<Label for="phone">Phone (optional)</Label>
				<Input id="phone" inputmode="tel" autocomplete="tel" bind:value={phone} />
			</div>

			<div class="flex gap-3 pt-4">
				<Button
					type="button"
					variant="outline"
					class="flex-1"
					onclick={() => (step = "consent")}
				>
					Back
				</Button>
				<Button type="submit" class="flex-1" disabled={submitting}>
					{submitting ? "Starting..." : "Start"}
				</Button>
			</div>
		</form>
	{/if}
</main>
