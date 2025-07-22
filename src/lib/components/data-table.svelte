<script lang="ts" module>
	export const columns: ColumnDef<Schema>[] = [
		{
			accessorKey: "patientInformation.caseNumber",
			header: "Case",
		},
		{
			id: "name",
			header: "Name",
			cell: ({ row }) => {
				// row.original is the full data object for this row (AnesthesiaSurveyData)
				const patientInfo = row.original.patientInformation;
				const lastName = patientInfo.name.last;
				const firstName = patientInfo.name.first;

				return `${lastName}, ${firstName}`; // Format the name as "Last, First"
			},
		},
		{
			accessorKey: "surgicalDetails.surgicalService",
			header: "Surgical Service",
			cell: ({ row }) => renderSnippet(DataTableType, { row }),
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => renderSnippet(DataTableStatus, { row }),
		},
		{
			accessorKey: "patientInformation.age",
			header: "Age",
		},
		{
			accessorKey: "patientInformation.sex",
			header: "Sex",
		},
		{
			accessorKey: "patientInformation.contactNo",
			header: "Contact Number",
		},
		{
			accessorKey: "waitingTime",
			header: "Time Waited",
		},
		{
			id: "view",
			cell: ({ row }) => renderSnippet(DataTableView, { row }),
		},
		{
			id: "actions",
			cell: () => renderSnippet(DataTableActions),
		},
	];
</script>

<script lang="ts">
	import {
		getCoreRowModel,
		getFacetedRowModel,
		getFacetedUniqueValues,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type Row,
		type RowSelectionState,
		type SortingState,
		type VisibilityState,
	} from "@tanstack/table-core";
	import type { Schema } from "./schemas.js";
	import {
		useSensors,
		MouseSensor,
		TouchSensor,
		KeyboardSensor,
		useSensor,
		type DragEndEvent,
		type UniqueIdentifier,
		DndContext,
		closestCenter,
	} from "@dnd-kit-svelte/core";
	import {
		arrayMove,
		SortableContext,
		useSortable,
		verticalListSortingStrategy,
	} from "@dnd-kit-svelte/sortable";
	import { createSvelteTable } from "$lib/components/ui/data-table/data-table.svelte.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import {
		FlexRender,
		renderComponent,
		renderSnippet,
	} from "$lib/components/ui/data-table/index.js";
	import ChevronsLeftIcon from "@tabler/icons-svelte/icons/chevrons-left";
	import ChevronLeftIcon from "@tabler/icons-svelte/icons/chevron-left";
	import ChevronRightIcon from "@tabler/icons-svelte/icons/chevron-right";
	import ChevronsRightIcon from "@tabler/icons-svelte/icons/chevrons-right";
	import CircleCheckFilledIcon from "@tabler/icons-svelte/icons/circle-check-filled";
	import LoaderIcon from "@tabler/icons-svelte/icons/loader";
	import DotsVerticalIcon from "@tabler/icons-svelte/icons/dots-vertical";
	import { toast } from "svelte-sonner";
	import { CSS } from "@dnd-kit-svelte/utilities";

	let { data }: { data: Schema[] } = $props();
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({});

	const dataIds: UniqueIdentifier[] = $derived(data.map((item) => item.patientInformation.caseNumber));

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get rowSelection() {
				return rowSelection;
			},
			get columnFilters() {
				return columnFilters;
			},
		},
		enableRowSelection: true,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === "function") {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === "function") {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === "function") {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === "function") {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === "function") {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		},
	});

	let views = [
		{
			id: "queue",
			label: "In Queue",
			badge: 0,
		},
		{
			id: "today",
			label: "Today",
			badge: 0,
		},
		{
			id: "week",
			label: "This Week",
			badge: 0,
		},
		{
			id: "all-time",
			label: "All Time",
			badge: 0,
		},
	];

	let view = $state("queue");
	let viewLabel = $derived(views.find((v) => view === v.id)?.label ?? "Select a view");
</script>

<Tabs.Root value="queue" class="w-full flex-col justify-start gap-6">
	<div class="flex items-center justify-between px-4 lg:px-6">
		<Label for="view-selector" class="sr-only">View</Label>
		<Select.Root type="single" bind:value={view}>
			<Select.Trigger class="@4xl/main:hidden flex w-fit" size="sm" id="view-selector">
				{viewLabel}
			</Select.Trigger>
			<Select.Content>
				{#each views as view (view.id)}
					<Select.Item value={view.id}>{view.label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
		<Tabs.List
			class="**:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex hidden"
		>
			{#each views as view (view.id)}
				<Tabs.Trigger value={view.id}>
					{view.label}
					{#if view.badge > 0}
						<Badge variant="secondary">{view.badge}</Badge>
					{/if}
				</Tabs.Trigger>
			{/each}
		</Tabs.List>
	</div>
	<Tabs.Content value="queue" class="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
		<div class="overflow-hidden rounded-lg border">
			<Table.Root>
				<Table.Header class="bg-muted sticky top-0 z-10">
					{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
						<Table.Row>
							{#each headerGroup.headers as header (header.id)}
								<Table.Head colspan={header.colSpan} class={header.index === 0 ? 'pl-4' : ''}>
									{#if !header.isPlaceholder}
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
									{/if}
								</Table.Head>
							{/each}
						</Table.Row>
					{/each}
				</Table.Header>
				<Table.Body class="**:data-[slot=table-cell]:first:w-8">
					{#if table.getRowModel().rows?.length}
						<SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
							{#each table.getRowModel().rows as row (row.id)}
								{@render DraggableRow({ row })}
							{/each}
						</SortableContext>
					{:else}
						<Table.Row>
							<Table.Cell colspan={columns.length} class="h-24 text-center">
								No results.
							</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
		</div>
		<div class="flex items-center justify-between px-4">
			<div class="text-muted-foreground hidden flex-1 text-sm lg:flex">
				{table.getFilteredSelectedRowModel().rows.length} of
				{table.getFilteredRowModel().rows.length} row(s) selected.
			</div>
			<div class="flex w-full items-center gap-8 lg:w-fit">
				<div class="hidden items-center gap-2 lg:flex">
					<Label for="rows-per-page" class="text-sm font-medium">Rows per page</Label>
					<Select.Root
						type="single"
						bind:value={
							() => `${table.getState().pagination.pageSize}`,
							(v) => table.setPageSize(Number(v))
						}
					>
						<Select.Trigger size="sm" class="w-20" id="rows-per-page">
							{table.getState().pagination.pageSize}
						</Select.Trigger>
						<Select.Content side="top">
							{#each [10, 20, 30, 40, 50] as pageSize (pageSize)}
								<Select.Item value={pageSize.toString()}>
									{pageSize}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="flex w-fit items-center justify-center text-sm font-medium">
					Page {table.getState().pagination.pageIndex + 1} of
					{table.getPageCount()}
				</div>
				<div class="ml-auto flex items-center gap-2 lg:ml-0">
					<Button
						variant="outline"
						class="hidden h-8 w-8 p-0 lg:flex"
						onclick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
					>
						<span class="sr-only">Go to first page</span>
						<ChevronsLeftIcon />
					</Button>
					<Button
						variant="outline"
						class="size-8"
						size="icon"
						onclick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<span class="sr-only">Go to previous page</span>
						<ChevronLeftIcon />
					</Button>
					<Button
						variant="outline"
						class="size-8"
						size="icon"
						onclick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<span class="sr-only">Go to next page</span>
						<ChevronRightIcon />
					</Button>
					<Button
						variant="outline"
						class="hidden size-8 lg:flex"
						size="icon"
						onclick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
					>
						<span class="sr-only">Go to last page</span>
						<ChevronsRightIcon />
					</Button>
				</div>
			</div>
		</div>
	</Tabs.Content>
	<Tabs.Content value="today" class="flex flex-col px-4 lg:px-6">
		<div class="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
	</Tabs.Content>
	<Tabs.Content value="week" class="flex flex-col px-4 lg:px-6">
		<div class="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
	</Tabs.Content>
	<Tabs.Content value="all-time" class="flex flex-col px-4 lg:px-6">
		<div class="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
	</Tabs.Content>
</Tabs.Root>


{#snippet DataTableType({ row }: { row: Row<Schema> })}
	{@const getService = (serviceObject: typeof row.original.surgicalDetails.surgicalService) => {
		// A mapping from schema keys to display names
		const serviceMap = {
			trauma: "Trauma",
			gs1: "GS1",
			gs2: "GS2",
			gs3: "GS3",
			urology: "Urology",
			pedia: "Pedia",
			burn: "Burn",
			plasticSurgery: "Plastic Surgery",
			tcvs: "TCVS",
			nss: "NSS",
			orthopedics: "Orthopedics",
			orl: "ORL",
			ophtha: "Ophtha",
			obGyn: "OB-GYN",
			dentistry: "Dentistry",
		};

		// Find the first key in the object that has a 'true' value
		for (const key in serviceObject) {
			if (Object.prototype.hasOwnProperty.call(serviceObject, key) && serviceObject[key] === true) {
				// Return the display name from our map, or the key itself as a fallback
				return serviceMap[key] || key;
			}
		}

        // Handle the 'others' text field or return a default
		return serviceObject.others || 'N/A';
	}}

	<div class="w-32 truncate">
		<Badge variant="outline" class="text-muted-foreground px-1.5">
			{getService(row.original.surgicalDetails.surgicalService)}
		</Badge>
	</div>
{/snippet}

{#snippet DataTableStatus({ row }: { row: Row<Schema> })}
	<Badge variant="outline" class="text-muted-foreground px-1.5">
		{#if row.original.status === "Done"}
			<CircleCheckFilledIcon class="fill-green-500 dark:fill-green-400" />
		{:else}
			<LoaderIcon />
		{/if}
		{row.original.status}
	</Badge>
{/snippet}

{#snippet DataTableActions()}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class="data-[state=open]:bg-muted text-muted-foreground flex size-8">
			{#snippet child({ props })}
				<Button variant="ghost" size="icon" {...props}>
					<DotsVerticalIcon />
					<span class="sr-only">Open menu</span>
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" class="w-32">				
			<DropdownMenu.Item variant="destructive">Delete</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/snippet}

{#snippet DraggableRow({ row }: { row: Row<Schema> })}
	{@const { transform, transition, node, isDragging } = useSortable({
		id: () => row.original.patientInformation.caseNumber,
	})}

	<Table.Row
		data-state={row.getIsSelected() && "selected"}
		data-dragging={isDragging.current}
		bind:ref={node.current}
		class="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
		style="transition: {transition.current}; transform: {CSS.Transform.toString(
			transform.current
		)}"
	>
		{#each row.getVisibleCells() as cell, i (cell.id)}
			<Table.Cell class={i === 0 ? 'pl-4' : ''}>
				<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
			</Table.Cell>
		{/each}
	</Table.Row>
{/snippet}

{#snippet DataTableView({ row }: { row: Row<Schema> })}
	{@const patient = row.original}

	<Dialog.Root>
		<Dialog.Trigger>
			<Button variant="outline" size="sm">View</Button>
		</Dialog.Trigger>
		<Dialog.Content class="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
			<!-- Top Summary Header -->
			<Dialog.Header>
				<Dialog.Title class="text-2xl">
					{`${patient.patientInformation.name.last}, ${patient.patientInformation.name.first} ${patient.patientInformation.name.middle ?? ''}`}
				</Dialog.Title>
				<Dialog.Description>
					Case #{patient.patientInformation.caseNumber} • {patient.patientInformation.age} years old • {patient.patientInformation.sex}
				</Dialog.Description>
			</Dialog.Header>

			<!-- Detailed Information Sections -->
			<div class="py-4 space-y-6 text-sm">

				<!-- Section: Patient Information -->
				<section>
					<h3 class="text-lg font-semibold border-b pb-2 mb-3">Patient Information</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
						<div><span class="font-medium text-muted-foreground">Location:</span> {patient.patientInformation.patientLocation ?? 'N/A'}</div>
						<div><span class="font-medium text-muted-foreground">Date of Birth:</span> {new Date(patient.patientInformation.dateOfBirth).toLocaleDateString()}</div>
						<div><span class="font-medium text-muted-foreground">Contact No:</span> {patient.patientInformation.contactNo ?? 'N/A'}</div>
						<div class="col-span-full"><span class="font-medium text-muted-foreground">Address:</span> {patient.patientInformation.address ?? 'N/A'}</div>
						<div><span class="font-medium text-muted-foreground">Emergency Contact:</span> {patient.patientInformation.emergencyContact.name ?? 'N/A'}</div>
						<div><span class="font-medium text-muted-foreground">Relationship:</span> {patient.patientInformation.emergencyContact.relationship ?? 'N/A'}</div>
						<div><span class="font-medium text-muted-foreground">Emergency Contact No:</span> {patient.patientInformation.emergencyContact.contactNo ?? 'N/A'}</div>
					</div>
				</section>

				<!-- Section: Surgical Details -->
				<section>
					<h3 class="text-lg font-semibold border-b pb-2 mb-3">Surgical Details</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
						<div class="col-span-full"><span class="font-medium text-muted-foreground">Diagnosis:</span> {patient.surgicalDetails.preOperativeDiagnosis ?? 'N/A'}</div>
						<div class="col-span-full"><span class="font-medium text-muted-foreground">Proposed Plan:</span> {patient.surgicalDetails.proposedSurgicalPlan ?? 'N/A'}</div>
						<div><span class="font-medium text-muted-foreground">Est. Blood Loss:</span> {patient.surgicalDetails.estimatedBloodLoss ?? 'N/A'}</div>
					</div>
				</section>
				
				<!-- Section: Pre-Operative History -->
				<section>
					<h3 class="text-lg font-semibold border-b pb-2 mb-3">Pre-Operative History</h3>
					<div class="space-y-4">
						<div>
							<h4 class="font-semibold">Allergies</h4>
							<p>Has Allergies: <span class="font-mono">{patient.preOperativeHistory.allergies.hasAllergies ? 'Yes' : 'No'}</span></p>
							{#if patient.preOperativeHistory.allergies.hasAllergies}
								<p>Details: {patient.preOperativeHistory.allergies.details ?? 'N/A'}</p>
							{/if}
						</div>
						<div>
							<h4 class="font-semibold">Cardiac / Pulmonary</h4>
							<div class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
								<span>High Blood Pressure: <span class="font-mono">{patient.preOperativeHistory.cardiacPulmonary.highBloodPressure ? 'Yes' : 'No'}</span></span>
								<span>Chest Pain: <span class="font-mono">{patient.preOperativeHistory.cardiacPulmonary.chestPain ? 'Yes' : 'No'}</span></span>
								<span>Irregular Heart Beat: <span class="font-mono">{patient.preOperativeHistory.cardiacPulmonary.irregularHeartBeat ? 'Yes' : 'No'}</span></span>
								<span>Heart Disease: <span class="font-mono">{patient.preOperativeHistory.cardiacPulmonary.heartDisease ? 'Yes' : 'No'}</span></span>
								<span>Heart Attack: <span class="font-mono">{patient.preOperativeHistory.cardiacPulmonary.heartAttack ? 'Yes' : 'No'}</span></span>
								<span>Difficulty Breathing: <span class="font-mono">{patient.preOperativeHistory.cardiacPulmonary.difficultyOfBreathing ? 'Yes' : 'No'}</span></span>
								<span>Asthma: <span class="font-mono">{patient.preOperativeHistory.cardiacPulmonary.asthma.hasAsthma ? 'Yes' : 'No'}</span></span>
							</div>
						</div>
						<!-- ... You can continue this pattern for all other history sections ... -->
					</div>
				</section>

				<!-- Section: Past Surgical History -->
				<section>
					<h3 class="text-lg font-semibold border-b pb-2 mb-3">Past Surgical / Anesthetic History</h3>
					<div>
						<h4 class="font-semibold">Previous Surgeries</h4>
						{#if patient.pastSurgicalHistory.surgeries && patient.pastSurgicalHistory.surgeries.length > 0}
							<ul class="list-disc pl-5">
							{#each patient.pastSurgicalHistory.surgeries as surgery}
								<li>{new Date(surgery.date).toLocaleDateString()}: {surgery.procedure} ({surgery.typeOfAnesthesia}) - Complications: {surgery.complications ?? 'None'}</li>
							{/each}
							</ul>
						{:else}
							<p>None</p>
						{/if}
					</div>
					<div class="mt-2">
						<h4 class="font-semibold">Family Anesthesia Complication</h4>
						<p>Has Complication History: <span class="font-mono">{patient.pastSurgicalHistory.familyAnesthesiaComplication.hasComplication ? 'Yes' : 'No'}</span></p>
						{#if patient.pastSurgicalHistory.familyAnesthesiaComplication.hasComplication}
							<p>Details: {patient.pastSurgicalHistory.familyAnesthesiaComplication.specify ?? 'N/A'}</p>
						{/if}
					</div>
				</section>

				<!-- Section: Physical Examination -->
				<section>
					<h3 class="text-lg font-semibold border-b pb-2 mb-3">Physical Examination</h3>
					<div>
						<h4 class="font-semibold">Vitals</h4>
						<div class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1">
							<span>BP: <span class="font-mono">{patient.physicalExamination.vitals.bp ?? 'N/A'}</span></span>
							<span>HR: <span class="font-mono">{patient.physicalExamination.vitals.hr ?? 'N/A'}</span></span>
							<span>RR: <span class="font-mono">{patient.physicalExamination.vitals.rr ?? 'N/A'}</span></span>
							<span>Temp: <span class="font-mono">{patient.physicalExamination.vitals.temp ?? 'N/A'}</span></span>
							<span>SpO2: <span class="font-mono">{patient.physicalExamination.vitals.spo2 ?? 'N/A'}</span></span>
							<span>Weight: <span class="font-mono">{patient.physicalExamination.vitals.weightKg ?? 'N/A'} kg</span></span>
							<span>Height: <span class="font-mono">{patient.physicalExamination.vitals.heightCm ?? 'N/A'} cm</span></span>
							<span>BMI: <span class="font-mono">{patient.physicalExamination.vitals.bmi ?? 'N/A'}</span></span>
						</div>
					</div>
					<div class="mt-4">
						<h4 class="font-semibold">ECG</h4>
						<p>{patient.physicalExamination.findings.ecg ?? 'Not specified.'}</p>
					</div>
				</section>
				
				<!-- Section: Anesthesia & Clinical Plan -->
				<section>
					<h3 class="text-lg font-semibold border-b pb-2 mb-3">Anesthesia Assessment & Plan</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
						<div><span class="font-medium text-muted-foreground">Mallampati Score:</span> {patient.anesthesiaAssessment.airwayDental.mallampati ?? 'N/A'}</div>
						<div><span class="font-medium text-muted-foreground">Full Neck Extension:</span> {patient.anesthesiaAssessment.airwayDental.fullNeckExtension ? 'Yes' : 'No'}</div>
						<div><span class="font-medium text-muted-foreground">ASA Score:</span> {patient.clinicalRiskAndPlan.asaScore ?? 'N/A'}</div>
						<div><span class="font-medium text-muted-foreground">Surgical Risk:</span> {patient.clinicalRiskAndPlan.surgicalRiskProcedure ?? 'N/A'}</div>
						<div class="col-span-full"><span class="font-medium text-muted-foreground">Cardiac Risk Assessment:</span> {patient.clinicalRiskAndPlan.medicalRiskAssessment.cardiac ?? 'N/A'}</div>
						<div class="col-span-full"><span class="font-medium text-muted-foreground">Recommendations:</span> {patient.clinicalRiskAndPlan.medicalRiskAssessment.othersRecommendations ?? 'None'}</div>
					</div>
				</section>
			</div>
		</Dialog.Content>
	</Dialog.Root>
{/snippet}