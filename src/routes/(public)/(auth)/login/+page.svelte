<script lang="ts">
	import { Button } from "@/components/ui/button";
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
	import { signIn } from "$lib/auth-client";
	import { goto } from "$app/navigation";
	import { toast } from "svelte-sonner";

	let email = $state("");
	let password = $state("");
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		const { error } = await signIn.email({ email, password });
		loading = false;
		if (error) {
			toast.error(error.message ?? "Sign-in failed");
			return;
		}
		goto("/dashboard");
	}
</script>

<main class="flex min-h-screen items-center justify-center px-4 py-8">
	<div class="w-full max-w-sm space-y-6">
		<div class="space-y-2 text-center">
			<h1 class="text-3xl font-bold">Sign in</h1>
			<p class="text-muted-foreground text-sm">Welcome back to KonsulTulong.</p>
		</div>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input id="email" type="email" autocomplete="email" required bind:value={email} />
			</div>

			<div class="space-y-2">
				<Label for="password">Password</Label>
				<Input
					id="password"
					type="password"
					autocomplete="current-password"
					required
					bind:value={password}
				/>
			</div>

			<Button type="submit" disabled={loading} class="w-full">
				{loading ? "Signing in…" : "Sign in"}
			</Button>
		</form>

		<p class="text-muted-foreground text-center text-xs">
			No account? <a class="underline" href="/register">Register a clinic</a>
		</p>
	</div>
</main>
