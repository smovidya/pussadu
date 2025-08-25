<script lang="ts" generics="TData">
	import XIcon from '@lucide/svelte/icons/x';
	import type { Table } from '@tanstack/table-core';
	import DataTableFacetedFilter from './data-table-faceted-filter.svelte';
	import DataTableViewsOptions from './data-table-views-options.svelte';
	import Button from '$stories/shadcnui/button/button.svelte';
	import { Input } from '$stories/shadcnui/input/index.js';
	import { projectStatusOptions } from '$lib/constants';

	let { table }: { table: Table<TData> } = $props();

	const isFiltered = $derived(table.getState().columnFilters.length > 0);
	const statusCol = $derived(table.getColumn('status'));
</script>

<div class="flex items-center justify-between">
	<div class="flex flex-1 items-center space-x-2">
		<Input
			placeholder="ค้นหาโครงการ"
			value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
			oninput={(e) => {
				table.getColumn('title')?.setFilterValue(e.currentTarget.value);
			}}
			onchange={(e) => {
				table.getColumn('title')?.setFilterValue(e.currentTarget.value);
			}}
			class="h-8 w-[150px] lg:w-[250px]"
		/>

		{#if statusCol}
			<DataTableFacetedFilter column={statusCol} title="สถานะ" options={projectStatusOptions} />
		{/if}

		{#if isFiltered}
			<Button variant="ghost" onclick={() => table.resetColumnFilters()} class="h-8 px-2 lg:px-3">
				รีเซ็ต
				<XIcon />
			</Button>
		{/if}
	</div>
	<DataTableViewsOptions {table} />
</div>
