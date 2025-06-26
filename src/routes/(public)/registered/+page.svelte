<script lang="ts">
	import {
		Root as AlertDialog,
		Trigger as AlertDialogTrigger,
		Content as AlertDialogContent,
		Title as AlertDialogTitle,
		Description as AlertDialogDescription,
		Action as AlertDialogAction,
		Cancel as AlertDialogCancel,
		Footer as AlertDialogFooter,
		Header as AlertDialogHeader
	} from '$lib/components/ui/alert-dialog';
	import { page } from '$app/state';

	// replace this with a prop or store if the email is dynamic
	const email = "edwardjoshua.diesta@gmail.com";
	let clinicName = '';
	let clinicCode = randomCode();

	function randomCode() {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
	}

	function handleRandomize() {
		clinicCode = randomCode();
	}

	// Error modal state
	let showError = false;
	let errorMessage = '';

	// Watch for action errors from the server
	$: {
		const error = page.form?.error;
		if (error) {
			showError = true;
			errorMessage = error;
		}
	}
</script>

<main class="flex h-[80vh] flex-1 flex-col items-center justify-center px-4 py-8">
	<div class="bg-white rounded-lg border shadow-sm p-8 w-full max-w-xl flex flex-col items-center">
		<h1 class="text-3xl font-bold text-center mb-2">Welcome!</h1>
		<p class="text-lg font-semibold text-center mb-4">You are now registered.</p>
		<p class="text-center mb-6 font-medium">
			Get added to a clinic by sending your email<br />
			to an existing clinic.
		</p>
		<input
			type="text"
			readonly
			value={email}
			class="border border-gray-300 border-dashed rounded px-3 py-1 mb-2 w-full max-w-xs font-medium text-center bg-transparent focus:outline-none select-all shadow-none appearance-none cursor-text"
			style="box-shadow: none; background: none;"
		/>
		<div class="text-center text-gray-500 mb-2">or</div>

		<AlertDialog>
			<AlertDialogTrigger>
				<button class="border rounded px-4 py-2 w-full max-w-xs font-semibold bg-gray-50 hover:bg-gray-100">
					Create Your Own Clinic Space
				</button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Create Clinic Space</AlertDialogTitle>
					<AlertDialogDescription>
						Fill in the details to create your clinic.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<form method="POST" action="?/createClinic" class="flex flex-col gap-4 mt-4">
					<label class="font-semibold text-sm">
						Clinic Name
						<input name="clinicName" type="text" bind:value={clinicName} required class="border rounded px-3 py-2 w-full mt-1" />
					</label>
					<label class="font-semibold text-sm">
						Clinic Code
						<div class="flex gap-2 mt-1">
							<input name="clinicCode" type="text" bind:value={clinicCode} maxlength="6" minlength="6" required class="border rounded px-3 py-2 w-full font-mono tracking-widest text-center" />
							<button type="button" on:click={handleRandomize} class="border rounded px-2 py-2 whitespace-nowrap">Randomize</button>
						</div>
					</label>
					<AlertDialogFooter>
						<AlertDialogCancel type="button">Cancel</AlertDialogCancel>
						<AlertDialogAction type="submit">Create</AlertDialogAction>
					</AlertDialogFooter>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	</div>

	<!-- Error Modal -->
	{#if showError}
		<AlertDialog open>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Error</AlertDialogTitle>
				</AlertDialogHeader>
				<p class="text-red-600">{errorMessage}</p>
				<AlertDialogFooter>
					<button type="button" class="border rounded px-4 py-2 font-semibold bg-gray-50 hover:bg-gray-100" on:click={() => (showError = false)}>OK</button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	{/if}
</main>
