<script lang="ts" module>
	import { z } from "zod";

	export const formSchema = z.object({
		pin: z.string().min(6, {
			message: "Your clinic code must be at least 6 characters."
		})
	});
</script>

<script lang="ts">
	import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";
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
	

<main class="flex h-[80vh] flex-1 flex-col items-center justify-center px-4 py-8">
	<h1 class="text-4xl md:text-7xl font-bold mb-2 text-center">KonsulTulong</h1>
	<p class="text-base md:text-xl mb-20 text-center">
		Start consultation through a 6-digit number or by scanning a QR code.
	</p>
	<form method="POST" class="flex flex-col items-center space-y-6 w-full max-w-xs md:max-w-md" use:enhance>
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
		<Form.Button>Consult</Form.Button>
	</form>

	<!-- Divider and QR code section, only on mobile/tablet -->
	<div class="w-full flex flex-col items-center mt-8 md:hidden">
		<hr class="w-full my-6 border-t" />
		<button class="mt-8 border rounded-lg px-8 py-6 flex flex-col items-center shadow-sm bg-white">
			<span class="font-semibold mb-2">QR Code</span>
			<!-- Replace with your QR code icon component if you have one -->
			<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h4v4H4V4zm0 12h4v4H4v-4zm12-12h4v4h-4V4zm0 12h4v4h-4v-4z" />
			</svg>
		</button>
	</div>
</main>

