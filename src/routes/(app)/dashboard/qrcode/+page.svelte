<script lang="ts">
	// Import Shadcn-Svelte components
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";

	// Import the QR code library
	import QRCode from "svelte-qrcode";

	// --- Data for the QR Code ---
	let clinicName: string = "Philippine General Hospital";
	let registrationUrl: string = "https://konsultulong.com/register/PGH-12345";

	// This variable will hold the HTML element containing the QR code for downloading
	let qrCodeContainer: HTMLElement;

	/**
	 * Handles downloading the QR code card as a PNG image.
	 */
	function handleDownload() {
		// Ensure the container element exists before trying to use it
		if (!qrCodeContainer) {
			alert("Error: QR Code container not found.");
			return;
		}

		// Find the <canvas> element that the QRCode component creates
		const canvas = qrCodeContainer.querySelector("canvas");
		if (!canvas) {
			alert("Error: Could not find the QR Code canvas element to download.");
			return;
		}

		// Create a temporary link element to trigger the download
		const link = document.createElement("a");
		link.download = `${clinicName}-QRCode.png`; // Set the filename
		link.href = canvas.toDataURL("image/png"); // Convert canvas to a PNG data URL
		link.click(); // Programmatically click the link to start the download
	}

	/**
	 * Opens the browser's print dialog.
	 */
	function handlePrint() {
		window.print();
	}
</script>

<!-- The main container that fills the page -->
<div class="h-full flex flex-col p-6">
	<div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Card One: QR Code Display -->
		<Card.Root class="flex flex-col print:shadow-none print:border-none">
			<Card.Header class="text-center">
				<Card.Title class="text-2xl">{clinicName}</Card.Title>
				<Card.Description>Scan the code with your phone's camera to begin.</Card.Description>
			</Card.Header>
			<!-- We bind the content area to our variable so we can find the canvas inside it -->
			<Card.Content
				class="flex flex-1 items-center justify-center p-4 md:p-8"
				bind:this={qrCodeContainer}
			>
				<QRCode background="#f5f3ef" value={registrationUrl} size={320} />
			</Card.Content>
		</Card.Root>

		<!-- ====================================================================== -->
		<!-- Card Two: Controls & Instructions (This is the updated section) -->
		<!-- ====================================================================== -->
		<Card.Root class="flex flex-col print:hidden">
			<Card.Header>
				<Card.Title class="text-2xl">Controls & Instructions</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-8 pt-2">
				<div class="space-y-3">
					<h3 class="font-semibold text-foreground">Export Options</h3>
					<div class="flex items-center gap-4">
						<Button onclick={handleDownload}>Download as PNG</Button>
						<Button onclick={handlePrint}>Print as PDF</Button>
					</div>
				</div>
				<div class="space-y-3">
					<h3 class="font-semibold text-foreground">Instructions for Staff</h3>
					<ol class="list-decimal list-inside space-y-2 text-muted-foreground">
						<li>Click the <strong>Print</strong> button to print the QR code sign.</li>
						<li>Place the sign in a visible location at the front desk or waiting area.</li>
						<li>Guide new patients to scan the code to start their registration on their own device.</li>
					</ol>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>