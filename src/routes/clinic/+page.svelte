<script lang="ts" module>
	import { z } from "zod";

	export const formSchema = z.object({
		pin: z.string().min(6, {
			message: "Your one-time password must be at least 6 characters."
		})
	});
</script>

<script lang="ts">
	import { defaults, superForm } from "sveltekit-superforms";
	import { zod } from "sveltekit-superforms/adapters";
	import { toast } from "svelte-sonner";
	import { goto } from "$app/navigation";
	import * as InputOTP from "$lib/components/ui/input-otp/index.js";
	import * as Form from "$lib/components/ui/form/index.js";

	// Function to verify clinic code with API
	async function verifyClinicCode(code: string): Promise<boolean> {
		// Place API checking code
		return true;
	}

	const form = superForm(defaults(zod(formSchema)), {
		validators: zod(formSchema),
		SPA: true,
		onSubmit: async ({ formData, cancel }) => {
			const pin = formData.get("pin") as string;

			if (pin && pin.length >= 6) {
				cancel(); // Cancel the form submission

				toast.loading("Verifying clinic code...");

				const isValid = await verifyClinicCode(pin);

				if (isValid) {
					toast.success(`Valid clinic code! Redirecting...`);
					goto(`/clinic/${pin}`);
				} else {
					toast.error("Invalid clinic code. Please try again.");
				}
			}
		},
		onError: ({ result }) => {
			toast.error("Please fix the errors in the form.");
		}
	});

	const { form: formData, enhance } = form;

	$effect(() => {
		const pin = $formData.pin;
		if (pin && pin !== pin.toUpperCase()) {
			$formData.pin = pin.toUpperCase();
		}
	});
</script>

<div class="flex h-[100vh] w-[100%] flex-col items-center justify-center space-y-8">
	<h1 class="text-3xl">Enter the Clinic's Code:</h1>
	<form method="POST" class="flex w-2/3 flex-col items-center space-y-6" use:enhance>
		<Form.Field {form} name="pin" class="flex flex-col items-center">
			<Form.Control>
				{#snippet children({ props })}
					<InputOTP.Root maxlength={6} {...props} bind:value={$formData.pin}>
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
		<Form.Button>Submit</Form.Button>
	</form>
</div>
