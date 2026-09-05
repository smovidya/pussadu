<script lang="ts">
	import {
		getCoreRowModel,
		getFacetedRowModel,
		getFacetedUniqueValues,
		getFilteredRowModel,
		getPaginationRowModel,
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type VisibilityState
	} from '@tanstack/table-core';
	import { createSvelteTable } from '$stories/shadcnui/data-table';
	import * as Table from '$stories/shadcnui/table';
	import * as Empty from '$stories/shadcnui/empty';
	import StatusBadge from '$stories/status-badge/status-badge.svelte';
	import DataTableToolbar from './data-table-toolbar.svelte';
	import DataTablePagination from './data-table-pagination.svelte';

	type Project = { title: string; owner: string; status: 'inprogress' | 'completed' };

	let { empty = false }: { empty?: boolean } = $props();

	const projects = $derived.by<Project[]>(() =>
		empty
			? []
			: Array.from({ length: 12 }, (_, index) => ({
					title: `โครงการวิทยาศาสตร์ ${index + 1}`,
					owner: index % 2 === 0 ? 'ฝ่ายวิชาการ' : 'ฝ่ายพัสดุ',
					status: index % 3 === 0 ? 'completed' : 'inprogress'
				}))
	);
	const columns: ColumnDef<Project>[] = [
		{ accessorKey: 'title', header: 'โครงการ' },
		{ accessorKey: 'owner', header: 'ฝ่ายเจ้าของ' },
		{
			accessorKey: 'status',
			header: 'สถานะ',
			filterFn: (row, id, value: string[]) => value.includes(row.getValue(id))
		}
	];
	let columnFilters = $state<ColumnFiltersState>([]);
	let columnVisibility = $state<VisibilityState>({});
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 5 });
	const table = createSvelteTable({
		get data() {
			return projects;
		},
		columns,
		state: {
			get columnFilters() {
				return columnFilters;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get pagination() {
				return pagination;
			}
		},
		onColumnFiltersChange: (updater) => {
			columnFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
		},
		onColumnVisibilityChange: (updater) => {
			columnVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
		},
		onPaginationChange: (updater) => {
			pagination = typeof updater === 'function' ? updater(pagination) : updater;
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues()
	});
</script>

<div class="flex flex-col gap-4 p-6">
	<DataTableToolbar
		{table}
		searchColumn="title"
		searchPlaceholder="ค้นหาโครงการ"
		filters={[
			{
				column: 'status',
				title: 'สถานะ',
				options: [
					{ label: 'ดำเนินอยู่', value: 'inprogress' },
					{ label: 'เสร็จสิ้น', value: 'completed' }
				]
			}
		]}
	/>
	<div class="overflow-x-auto rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					{#each table.getVisibleLeafColumns() as column (column.id)}
						<Table.Head>{String(column.columnDef.header)}</Table.Head>
					{/each}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell>
								{#if cell.column.id === 'status'}
									{@const completed = cell.getValue() === 'completed'}
									<StatusBadge tone={completed ? 'success' : 'warning'}>
										{completed ? 'เสร็จสิ้น' : 'ดำเนินอยู่'}
									</StatusBadge>
								{:else}
									{String(cell.getValue())}
								{/if}
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={table.getVisibleLeafColumns().length}>
							<Empty.Root class="py-8">
								<Empty.Header>
									<Empty.Title>ไม่พบโครงการ</Empty.Title>
									<Empty.Description>ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง</Empty.Description>
								</Empty.Header>
							</Empty.Root>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<DataTablePagination {table} pageSizes={[5, 10]} />
</div>
