<script lang="ts" module>
	import { z } from "zod";

	export const formSchema = z.object({
		code: z
			.string()
			.min(6, { message: "Clinic code must be 6 characters." })
			.max(6, { message: "Clinic code must be 6 characters." })
	});
</script>

<script lang="ts">
	import { defaults, superForm } from "sveltekit-superforms";
	import { zod } from "sveltekit-superforms/adapters";
	import { toast } from "svelte-sonner";
	import { goto } from "$app/navigation";
	import * as InputOTP from "$lib/components/ui/input-otp/index.js";
	import * as Form from "$lib/components/ui/form/index.js";

	const form = superForm(defaults(zod(formSchema)), {
		validators: zod(formSchema),
		SPA: true,
		onSubmit: async ({ formData, cancel }) => {
			cancel();
			const code = (formData.get("code") as string)?.toUpperCase();
			if (!code) return;

			toast.loading("Checking clinic code…", { id: "verify" });
			const res = await fetch(`/api/clinic/${encodeURIComponent(code)}`);
			toast.dismiss("verify");

			if (!res.ok) {
				toast.error("Clinic not found. Please check the code.");
				return;
			}
			goto(`/c/${code}`);
		}
	});

	const { form: formData, enhance } = form;

	$effect(() => {
		const v = $formData.code;
		if (v && v !== v.toUpperCase()) $formData.code = v.toUpperCase();
	});
</script>

<main class="flex min-h-screen flex-1 flex-col items-center justify-center px-4 py-8">
	<h1 class="mb-2 text-center text-4xl font-bold md:text-7xl">KonsulTulong</h1>
	<p class="text-muted-foreground mb-12 text-center text-base md:text-xl">
		Enter the 6-character clinic code or scan the QR poster.
	</p>

	<form
		method="POST"
		class="flex w-full max-w-xs flex-col items-center space-y-6 md:max-w-md"
		use:enhance
	>
		<Form.Field {form} name="code" class="flex flex-col items-center">
			<Form.Control>
				{#snippet children({ props })}
					<InputOTP.Root maxlength={6} {...props} bind:value={$formData.code}>
						{#snippet children({ cells })}
							<InputOTP.Group>
								{#each cells as cell, i (i)}
									<InputOTP.Slot {cell} />
								{/each}
							</InputOTP.Group>
						{/snippet}
					</InputOTP.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors class="text-center" />
		</Form.Field>
		<Form.Button>Continue</Form.Button>
	</form>

	<p class="text-muted-foreground mt-12 text-xs">
		Are you a clinic? <a class="underline" href="/login">Sign in</a> ·
		<a class="underline" href="/register">Register</a>
	</p>
</main>
