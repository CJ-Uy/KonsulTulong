<script>
	import { Logo, Google, Facebook } from "$lib/components/icons";
	import { Button } from "@/components/ui/button";
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";

	export let form;
</script>

<section class="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
	<form
		method="POST"
		class="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
	>
		{#if form?.success}
			<p class="p-4 text-green-600">Success! Check {form?.message} to verify your account.</p>
		{:else if form?.error}
			<p class="p-4 text-red-600">Error: {form.error}</p>
		{/if}
		<div class="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
			<div class="text-center">
				<a href="/" aria-label="go home" class="mx-auto block w-fit">
					<Logo width="32" height="32" />
				</a>
				<h1 class="text-title mt-4 mb-1 text-xl font-semibold">Create a KonsulTulong Account</h1>
				<p class="text-sm">Welcome! Create an account to get started.</p>
			</div>

			<div class="mt-6 space-y-6">
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-2">
						<Label for="firstName" class="block text-sm">First Name</Label>
						<Input type="text" required name="firstName" id="firstName" />
					</div>
					<div class="space-y-2">
						<Label for="lastName" class="block text-sm">Last Name</Label>
						<Input type="text" required name="lastName" id="lastName" />
					</div>
				</div>

				<!-- Added Nickname Field -->
				<div class="space-y-2">
					<Label for="nickname" class="block text-sm">Nickname</Label>
					<Input type="text" required name="nickname" id="nickname" />
				</div>

				<div class="space-y-2">
					<Label for="email" class="block text-sm">Email</Label>
					<Input type="email" required name="email" id="email" />
				</div>

				<div class="space-y-0.5">
					<div class="flex items-center justify-between">
						<Label for="password" class="text-title text-sm">Password</Label>
					</div>
					<Input
						type="password"
						required
						name="password"
						id="password"
						class="input sz-md variant-mixed"
					/>
				</div>

				<Button type="submit" class="w-full">Sign Up</Button>
			</div>

			<div class="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
				<hr class="border-dashed" />
				<span class="text-muted-foreground text-xs">Or continue With</span>
				<hr class="border-dashed" />
			</div>

			<div class="grid grid-cols-2 gap-3">
				<Button type="button" variant="outline">
					<Google width="0.98em" height="1em" style="margin-right: 0.5em;" />
					<span>Google</span>
				</Button>
				<Button type="button" variant="outline">
					<Facebook width="1em" height="1em" style="margin-right: 0.5em;" />
					<span>Facebook</span>
				</Button>
			</div>
		</div>

		<div class="p-3">
			<p class="text-accent-foreground text-center text-sm">
				Have an account?
				<Button variant="link" href="/login" class="px-2">Sign In</Button>
			</p>
		</div>
	</form>
</section>
