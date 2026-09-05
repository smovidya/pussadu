<script lang="ts" generics="TData">
	import XIcon from '@lucide/svelte/icons/x';
	import type { Table } from '@tanstack/table-core';
	import type { Snippet } from 'svelte';
	import { Button } from '$stories/shadcnui/button';
	import { Input } from '$stories/shadcnui/input';
	import DataTableFacetedFilter from './data-table-faceted-filter.svelte';
	import DataTableViewOptions from './data-table-view-options.svelte';
	import type { FacetedFilterOption } from './types';

	type FilterDefinition = {
		column: string;
		title: string;
		options: FacetedFilterOption[];
	};

	let {
		table,
		searchColumn,
		searchPlaceholder = 'ค้นหา',
		filters = [],
		actions
	}: {
		table: Table<TData>;
		searchColumn: string;
		searchPlaceholder?: string;
		filters?: FilterDefinition[];
		actions?: Snippet;
	} = $props();

	const isFiltered = $derived(table.getState().columnFilters.length > 0);
	const search = $derived(table.getColumn(searchColumn));
</script>

<div class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
	<div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
		<Input
			placeholder={searchPlaceholder}
			value={(search?.getFilterValue() as string) ?? ''}
			oninput={(event) => search?.setFilterValue(event.currentTarget.value)}
			class="w-full sm:w-64"
		/>
		{#each filters as filter (filter.column)}
			{@const column = table.getColumn(filter.column)}
			{#if column}
				<DataTableFacetedFilter {column} title={filter.title} options={filter.options} />
			{/if}
		{/each}
		{#if isFiltered}
			<Button variant="ghost" size="sm" onclick={() => table.resetColumnFilters()}>
				รีเซ็ต
				<XIcon data-icon="inline-end" />
			</Button>
		{/if}
	</div>
	<div class="flex items-center gap-2">
		{#if actions}{@render actions()}{/if}
		<DataTableViewOptions {table} />
	</div>
</div>
