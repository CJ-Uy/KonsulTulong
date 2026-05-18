<script lang="ts">
	import { ALL_RISK_TEMPLATES } from "$lib/forms/risk-templates";
</script>

<div class="space-y-6">
	<header>
		<h1 class="text-2xl font-bold">Citations</h1>
		<p class="text-muted-foreground text-sm">
			Bundled validated screening instruments and their primary references.
		</p>
	</header>

	<ul class="space-y-3">
		{#each ALL_RISK_TEMPLATES as t (t.slug)}
			<li class="rounded border p-4">
				<p class="font-semibold">{t.name}</p>
				<p class="text-muted-foreground mt-1 text-sm">{t.description}</p>
				<p class="mt-2 text-xs italic">{t.citation}</p>
				{#if t.assistedOnly}
					<p class="mt-2 text-xs text-amber-700">Assisted-only (staff administers).</p>
				{/if}
			</li>
		{/each}
	</ul>

	<div class="text-muted-foreground rounded border bg-muted/30 p-4 text-xs">
		The MMSE is intentionally excluded because it is copyrighted by PAR Inc. Mini-Cog is used
		instead. Hamilton scales are likewise excluded. PHQ-9, PHQ-2, GAD-7, AUDIT-C, Epworth, and
		STOP-BANG are free for clinical use with attribution.
	</div>
</div>
