<script lang="ts">
	let { data } = $props();
</script>

<main class="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-10 text-center">
	<div class="rounded-full bg-green-100 p-6 text-5xl">✓</div>
	<h1 class="mt-6 text-3xl font-bold">Thank you, {data.response.patientName.split(" ")[0]}!</h1>
	<p class="text-muted-foreground mt-3 text-base">
		Please sit down and wait. The clinic staff will call you when it is your turn.
	</p>
	<p class="text-muted-foreground mt-6 text-xs">{data.clinic.name}</p>
</main>
