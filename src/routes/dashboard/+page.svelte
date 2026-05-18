<script lang="ts">
	let { data } = $props();
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold">Welcome, {data.user.name ?? data.user.email}</h1>
		<p class="text-muted-foreground">Role: {data.user.role}</p>
	</div>

	{#if !data.clinic}
		<div class="rounded border border-amber-400 bg-amber-50 p-4 text-sm">
			You're not part of a clinic yet. <a href="/register" class="underline">Provision one</a>.
		</div>
	{/if}
</div>
