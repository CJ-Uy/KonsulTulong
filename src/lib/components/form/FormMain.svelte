<script lang="ts">
	import Button from "@/components/ui/button/button.svelte";
	import * as Select from "@/components/ui/select";
	import Input from "../ui/input/input.svelte";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import { DateFormatter, type DateValue, getLocalTimeZone } from "@internationalized/date";
	import { cn } from "$lib/utils.js";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import { Calendar } from "$lib/components/ui/calendar/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import FormNav from "$lib/components/form/FormNav.svelte";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import BoldIcon from "@lucide/svelte/icons/bold";
	import ItalicIcon from "@lucide/svelte/icons/italic";
	import UnderlineIcon from "@lucide/svelte/icons/underline";
	import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";

	// Chechbox question
	const checkboxOptions = [
		{ id: "item1", label: "item1" },
		{ id: "item2", label: "item2" },
		{ id: "item3", label: "item3" },
		{ id: "item4", label: "item4" }
	];

	let selectedCheckboxes = $state<string[]>([]);
	function handleCheckboxChange(optionId: string, checked: boolean) {
		if (checked) {
			selectedCheckboxes = [...selectedCheckboxes, optionId];
		} else {
			selectedCheckboxes = selectedCheckboxes.filter((id) => id !== optionId);
		}
	}

	// Single Toggle Question
	const singleToggleItems = [
		{ id: "item1", label: "item1" },
		{ id: "item2", label: "item2" },
		{ id: "item3", label: "item3" },
		{ id: "item4", label: "item4" }
	];
</script>

<main class="grid grid-cols-1 md:grid-cols-6">
	<FormNav />
	<form class="flex flex-col space-y-30 text-center md:col-span-5 md:mx-10 md:mt-10">
		<section
			class="relative mx-5 my-10 flex flex-col items-center rounded border border-zinc-400 py-25"
		>
			<header
				class="bg-primary absolute -top-10 flex h-20 w-80 items-center justify-center rounded-md border border-neutral-400"
			>
				<p class="text-sm font-bold">I. PERSONAL INFORMATION</p>
			</header>

			<div class="w-full space-y-20 px-8">
				<section class="flex flex-col items-center">
					<Button class="bg-transparent"
						><img src="/speaker-icon.svg" alt="Speaker Icon" class=" max-w-8" /></Button
					>
					<header class="text-2xl font-bold">What is your name?</header>
					<p class="mt-5 text-sm font-bold">First Name</p>
					<Input placeholder="Juan" class=" max-w-90 text-center" />

					<p class="text-sm font-bold">Surname</p>
					<Input placeholder="De Jesus" class=" max-w-90 text-center" />
				</section>

				<section class="flex flex-1 flex-col items-center">
					<Button class="bg-transparent"
						><img src="/speaker-icon.svg" alt="Speaker Icon" class=" max-w-8" />
					</Button>
					<header class="text-2xl font-bold">When were you born?</header>
					<div class="align-between mt-5 flex space-x-3 text-center">
						<div class="max-w-25">
							<p class=" text-sm font-bold">Month</p>
							<Input placeholder="June" class=" text-center " />
						</div>

						<div class="max-w-25">
							<p class=" text-sm font-bold">Day</p>
							<Input placeholder="11" class=" text-center " />
						</div>
						<div class="max-w-25">
							<p class=" text-sm font-bold">Year</p>
							<Input placeholder="2000" class=" text-center " />
						</div>
					</div>
				</section>
			</div>
		</section>

		<section
			class="relative mx-5 my-10 flex flex-col items-center space-y-20 rounded border border-zinc-400 py-25"
		>
			<header
				class="bg-primary absolute -top-10 flex h-20 w-80 items-center justify-center rounded-md border border-neutral-400"
			>
				<p class="text-sm font-bold">II. COMPLAINT</p>
			</header>

			<div class="w-full space-y-20 px-8">
				<section class="flex w-full flex-col items-center">
					<Button class="bg-transparent">
						<img src="/speaker-icon.svg" alt="Speaker Icon" class=" max-w-8" />
					</Button>
					<header class="text-2xl font-bold">CheckBox</header>

					<div
						class="align-center mt-7 flex w-full max-w-200 flex-col flex-wrap space-y-6 px-5 text-left"
					>
						{#each checkboxOptions as item}
							<div class="wrap flex items-center space-x-8">
								<Checkbox id={item.id} class="scale-300" />
								<Label for={item.id} class="text-md">{item.label}</Label>
							</div>
						{/each}
					</div>
				</section>
			</div>
		</section>

		<section
			class="relative mx-5 my-10 flex flex-col items-center space-y-20 rounded border border-zinc-400 py-25"
		>
			<header
				class="bg-primary absolute -top-10 flex h-20 w-80 items-center justify-center rounded-md border border-neutral-400"
			>
				<p class="text-sm font-bold">III. OTHER INFORMATION</p>
			</header>

			<div class="w-full space-y-20 px-8">
				<section class="flex w-full flex-col items-center">
					<Button class="bg-transparent">
						<img src="/speaker-icon.svg" alt="Speaker Icon" class=" max-w-8" />
					</Button>
					<header class="text-2xl font-bold">How long have you been smoking?</header>

					<!-- TODO: FIX TOGGLEGROUP -->
					<div class="align-center justify-c enter mt-7 flex w-full max-w-200">
						<ToggleGroup.Root type="single" class="flex flex-col space-y-5 rounded-none">
							{#each singleToggleItems as item}
								<ToggleGroup.Item value="bold" aria-label="Toggle bold" class="w-full max-w-90"
									>{item.label}</ToggleGroup.Item
								>
							{/each}
						</ToggleGroup.Root>

						<!-- {#each question1Options as item}
							<div class="wrap flex items-center space-x-8"></div>
						{/each} -->
					</div>
				</section>
			</div>
		</section>
		<section
			class="mx-5 my-10 flex flex-col items-center space-y-10 rounded border border-zinc-400 px-5 py-10"
		>
			<header class="text-xl font-bold">You've reached the end of the form.</header>
			<Button class="bg-secondary/50 mx-auto h-16 w-60 text-xl font-bold">Submit Answers</Button>
		</section>
	</form>
</main>
