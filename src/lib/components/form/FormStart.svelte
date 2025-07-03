<script lang="ts">
	import Button from "@/components/ui/button/button.svelte";
	import * as Select from "@/components/ui/select";
</script>

<section
	class="relative mx-5 my-10 flex h-[calc(100vh-5rem)] flex-col rounded border border-zinc-400 text-center"
>
	<div class="absolute inset-0 flex flex-col items-center justify-center space-y-10">
		<p class="text-3xl font-bold">Pre-Consultation Questionnaire</p>
		<Button class="mx-auto h-16 w-60 text-xl font-bold">Start</Button>
	</div>

	<div class="absolute bottom-10 w-full">
		<p class="font-bold">Language:</p>
		<!-- TODO: CONFIGURE AND FIX SELECT -->
		<Select.Root>
			<Select.Trigger class="mx-auto w-3/4">English</Select.Trigger>

			<Select.Content>
				<Select.Group>
					<Select.Item value="apple">Apple</Select.Item>
					<Select.Item value="banana">Banana</Select.Item>
					<Select.Item value="blueberry">Blueberry</Select.Item>
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</div>
</section>
