<script lang="ts">
	import { Button } from "@/components/ui/button";
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
	import { signUp } from "$lib/auth-client";
	import { goto } from "$app/navigation";
	import { toast } from "svelte-sonner";

	let firstName = $state("");
	let lastName = $state("");
	let clinicName = $state("");
	let email = $state("");
	let password = $state("");
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		const { error } = await signUp.email({
			email,
			password,
			name: `${firstName} ${lastName}`.trim(),
			// @ts-expect-error — additionalFields propagated via Better-Auth user.additionalFields
			firstName,
			lastName
		});
		if (error) {
			loading = false;
			toast.error(error.message ?? "Sign-up failed");
			return;
		}

		const provisionRes = await fetch("/api/clinic", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: clinicName })
		});
		loading = false;
		if (!provisionRes.ok) {
			toast.error("Account created but clinic provisioning failed. Try again from settings.");
			goto("/dashboard");
			return;
		}
		goto("/dashboard");
	}
</script>

<main class="flex min-h-screen items-center justify-center px-4 py-8">
	<div class="w-full max-w-md space-y-6">
		<div class="space-y-2 text-center">
			<h1 class="text-3xl font-bold">Register a clinic</h1>
			<p class="text-muted-foreground text-sm">
				The first user becomes the admin and owns the clinic.
			</p>
		</div>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="grid grid-cols-2 gap-3">
				<div class="space-y-2">
					<Label for="first">First name</Label>
					<Input id="first" required bind:value={firstName} />
				</div>
				<div class="space-y-2">
					<Label for="last">Last name</Label>
					<Input id="last" required bind:value={lastName} />
				</div>
			</div>

			<div class="space-y-2">
				<Label for="clinic">Clinic name</Label>
				<Input id="clinic" required bind:value={clinicName} />
			</div>

			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input id="email" type="email" autocomplete="email" required bind:value={email} />
			</div>

			<div class="space-y-2">
				<Label for="password">Password</Label>
				<Input
					id="password"
					type="password"
					autocomplete="new-password"
					minlength={8}
					required
					bind:value={password}
				/>
			</div>

			<Button type="submit" disabled={loading} class="w-full">
				{loading ? "Creating…" : "Create clinic"}
			</Button>
		</form>

		<p class="text-muted-foreground text-center text-xs">
			Already have an account? <a class="underline" href="/login">Sign in</a>
		</p>
	</div>
</main>
