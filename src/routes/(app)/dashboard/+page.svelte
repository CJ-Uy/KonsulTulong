<script lang="ts">
	import data from "./data.js";
	import DataTable from "$lib/components/data-table.svelte";
</script>

<div class="flex flex-1 flex-col">
	<div class="@container/main flex flex-1 flex-col gap-2">
		<div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
			<DataTable {data} />
		</div>
	</div>
</div>