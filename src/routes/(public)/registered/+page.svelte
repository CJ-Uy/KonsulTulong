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
	} from "$lib/components/ui/alert-dialog";
	import { page } from "$app/state";
	import { onMount } from "svelte";

	// replace this with a prop or store if the email is dynamic
	const email = "edwardjoshua.diesta@gmail.com";
	let clinicName = "";
	let clinicCode = "";

	async function generateUniqueCode() {
		console.log("HII");
		const formData = new FormData();
		formData.append("dummy", "1");
		const res = await fetch("?/generateCode", { method: "POST", body: formData });
		if (res.ok) {
			const data = await res.json();
			console.log("Full backend response:", data);
			// Parse the wrapped response
			try {
				const parsed = JSON.parse(data.data);
				// If the code is the second element (string), use that
				// If the code is in the first element as an object, use that
				if (Array.isArray(parsed)) {
					if (typeof parsed[1] === "string") {
						clinicCode = parsed[1];
					} else if (parsed[0] && typeof parsed[0].code === "string") {
						clinicCode = parsed[0].code;
					} else {
						clinicCode = "";
					}
				} else if (parsed && typeof parsed.code === "string") {
					clinicCode = parsed.code;
				} else {
					clinicCode = "";
				}
			} catch (e) {
				clinicCode = "";
			}
			console.log("clinicCode:", clinicCode);
		}
	}

	// Error modal state
	let showError = false;
	let errorMessage = "";

	// Watch for action errors from the server
	$: {
		const error = page.form?.error;
		if (error) {
			showError = true;
			errorMessage = error;
		}
	}

	onMount(() => {
		generateUniqueCode();
	});
</script>

<main class="flex h-[80vh] flex-1 flex-col items-center justify-center px-4 py-8">
	<div class="flex w-full max-w-xl flex-col items-center rounded-lg border bg-white p-8 shadow-sm">
		<h1 class="mb-2 text-center text-3xl font-bold">Welcome!</h1>
		<p class="mb-4 text-center text-lg font-semibold">You are now registered.</p>
		<p class="mb-6 text-center font-medium">
			Get added to a clinic by sending your email<br />
			to an existing clinic.
		</p>
		<input
			type="text"
			readonly
			value={email}
			class="mb-2 w-full max-w-xs cursor-text appearance-none rounded border border-dashed border-gray-300 bg-transparent px-3 py-1 text-center font-medium shadow-none select-all focus:outline-none"
			style="box-shadow: none; background: none;"
		/>
		<div class="mb-2 text-center text-gray-500">or</div>

		<AlertDialog>
			<AlertDialogTrigger>
				<span
					class="w-full max-w-xs cursor-pointer rounded border bg-gray-50 px-4 py-2 text-center font-semibold hover:bg-gray-100"
					role="button"
					tabindex="0"
				>
					Create Your Own Clinic Space
				</span>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Create Clinic Space</AlertDialogTitle>
					<AlertDialogDescription>
						Fill in the details to create your clinic.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<form method="POST" action="?/createClinic" class="mt-4 flex flex-col gap-4">
					<label class="text-sm font-semibold">
						Clinic Name
						<input
							name="clinicName"
							type="text"
							bind:value={clinicName}
							required
							class="mt-1 w-full rounded border px-3 py-2"
						/>
					</label>
					<label class="text-sm font-semibold">
						Clinic Code
						<div class="mt-1 flex gap-2">
							<input
								name="clinicCode"
								type="text"
								bind:value={clinicCode}
								maxlength="6"
								minlength="6"
								required
								class="w-full rounded border px-3 py-2 text-center font-mono tracking-widest"
							/>
							<button
								type="button"
								on:click={generateUniqueCode}
								class="rounded border bg-gray-50 px-2 py-2 whitespace-nowrap transition-colors hover:bg-gray-100"
								>Generate</button
							>
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
					<button
						type="button"
						class="rounded border bg-gray-50 px-4 py-2 font-semibold hover:bg-gray-100"
						on:click={() => (showError = false)}>OK</button
					>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	{/if}
</main>
