<script lang="ts">
	import FormFiller from "$lib/components/forms/FormFiller.svelte";
	import { Button } from "@/components/ui/button";
	import type { FormField } from "$lib/types/forms";

	let { data } = $props();

	let variant = $state<"compact" | "kiosk">("compact");
	const fields = (data.template.questions ?? []) as FormField[];
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<a href="/dashboard/forms" class="text-muted-foreground text-sm underline">Back to forms</a>
			<h1 class="text-2xl font-bold">{data.template.name}</h1>
		</div>
		<div class="flex gap-2">
			<Button
				variant={variant === "compact" ? "default" : "outline"}
				size="sm"
				onclick={() => (variant = "compact")}
			>
				Compact
			</Button>
			<Button
				variant={variant === "kiosk" ? "default" : "outline"}
				size="sm"
				onclick={() => (variant = "kiosk")}
			>
				Kiosk
			</Button>
			<a href={`/dashboard/forms/${data.template.id}/edit`}>
				<Button size="sm">Edit</Button>
			</a>
		</div>
	</div>

	<div class={variant === "kiosk" ? "mx-auto max-w-md rounded border p-6" : "rounded border p-6"}>
		<FormFiller {fields} {variant} />
	</div>
</div>
