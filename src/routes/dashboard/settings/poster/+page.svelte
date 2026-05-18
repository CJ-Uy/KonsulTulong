<script lang="ts">
	import { Button } from "@/components/ui/button";

	let { data } = $props();

	function printPoster() {
		window.print();
	}
</script>

<div class="space-y-4 print:hidden">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Clinic QR poster</h1>
		<Button onclick={printPoster}>Print / Save as PDF</Button>
	</div>
	<p class="text-muted-foreground text-sm">
		Use your browser's print dialog and select "Save as PDF" to download. Choose A4 paper size
		and remove headers and footers for the cleanest result.
	</p>
</div>

<div class="poster mx-auto mt-6">
	<div class="poster-inner">
		<header class="poster-header">
			<p class="poster-eyebrow">Welcome to</p>
			<h1 class="poster-title">{data.clinic.name}</h1>
			<p class="poster-tagline">{data.tagline}</p>
		</header>

		<div class="poster-qr">
			{@html data.qrSvg}
		</div>

		<div class="poster-instructions">
			<p>1. Use your phone's camera and scan the QR code above.</p>
			<p>2. Or open this on your browser:</p>
			<p class="poster-url">{data.target}</p>
			<p>3. Or type the clinic code on the homepage:</p>
			<p class="poster-code">{data.clinic.code}</p>
		</div>

		<footer class="poster-footer">
			<p>Powered by KonsulTulong</p>
		</footer>
	</div>
</div>

<style>
	.poster {
		width: 210mm;
		min-height: 297mm;
		background: white;
		color: #111;
		box-shadow: 0 0 0 1px #ddd;
	}
	.poster-inner {
		padding: 25mm 20mm;
		display: flex;
		flex-direction: column;
		height: 297mm;
		box-sizing: border-box;
	}
	.poster-header {
		text-align: center;
	}
	.poster-eyebrow {
		text-transform: uppercase;
		letter-spacing: 0.2em;
		font-size: 14pt;
		color: #555;
		margin: 0;
	}
	.poster-title {
		font-size: 42pt;
		font-weight: 800;
		margin: 4pt 0 0;
	}
	.poster-tagline {
		font-size: 18pt;
		margin: 6pt 0 0;
		color: #444;
	}
	.poster-qr {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10mm 0;
	}
	.poster-qr :global(svg) {
		width: 140mm;
		height: 140mm;
	}
	.poster-instructions {
		font-size: 14pt;
		line-height: 1.6;
	}
	.poster-instructions p {
		margin: 4pt 0;
	}
	.poster-url {
		font-family: ui-monospace, monospace;
		background: #f5f5f5;
		padding: 6pt 10pt;
		border-radius: 4pt;
		font-size: 12pt;
		word-break: break-all;
	}
	.poster-code {
		font-family: ui-monospace, monospace;
		font-size: 32pt;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-align: center;
		background: #f5f5f5;
		padding: 8pt 0;
		border-radius: 4pt;
	}
	.poster-footer {
		margin-top: auto;
		text-align: center;
		font-size: 10pt;
		color: #777;
	}

	@media print {
		.poster {
			box-shadow: none;
		}
		:global(body) {
			margin: 0;
			padding: 0;
		}
	}
</style>
