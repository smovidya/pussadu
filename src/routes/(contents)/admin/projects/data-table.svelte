<script lang="ts">
	import {
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type Row,
		type RowSelectionState,
		type SortingState,
		type VisibilityState,
		type Table as TableType,
		getCoreRowModel,
		getFacetedRowModel,
		getFacetedUniqueValues,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type Column
	} from '@tanstack/table-core';
	import DataTableToolbar from './data-table-toolbar.svelte';
	import { createSvelteTable } from '$stories/shadcnui/data-table/data-table.svelte.js';
	import FlexRender from '$stories/shadcnui/data-table/flex-render.svelte';
	import * as Table from '$stories/shadcnui/table';
	import * as DropdownMenu from '$stories/shadcnui/dropdown-menu';
	import * as AlertDialog from '$stories/shadcnui/alert-dialog';
	import { renderComponent, renderSnippet } from '$stories/shadcnui/data-table/render-helpers.js';
	import Checkbox from '$stories/shadcnui/checkbox/checkbox.svelte';
	import { Button } from '$stories/shadcnui/button';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronsLeftIcon from '@lucide/svelte/icons/chevrons-left';
	import ChevronsRightIcon from '@lucide/svelte/icons/chevrons-right';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import * as Select from '$stories/shadcnui/select';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$stories/utils.js';
	import { projectOwnerOptions, projectStatusOptions } from '$lib/constants';
	import { formatDate } from '$lib/utils/datetime';
	import { removeProject, setProjectInfo } from '$lib/rpc/project.remote';
	import { toast } from 'svelte-sonner';
	import { ChevronRight } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	type Project = {
		id: string;
		status: 'notstarted' | 'inprogress' | 'completed' | 'evaluated' | 'cancelled';
		owner: string;
		createdAt: Date | null;
		updatedAt: Date | null;
		deletedAt: Date | null;
		title: string;
		isPublished: boolean | null;
		staffs: {
			borrowerId: string;
			projectId: string;
		}[];
	};

	let { data }: { data: Project[] } = $props();
	let dialogRemoveOpen = $state(false);

	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({});
	let columnFilters = $state<ColumnFiltersState>([]);
	let sorting = $state<SortingState>([
		{
			id: 'createdAt',
			desc: true
		}
	]);
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });

	const columns: ColumnDef<Project>[] = [
		{
			id: 'select',
			header: ({ table }) =>
				renderComponent(Checkbox, {
					checked: table.getIsAllPageRowsSelected(),
					onCheckedChange: (value) => table.toggleAllPageRowsSelected(value),
					indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
					'aria-label': 'เลือกทั้งหมด'
				}),
			cell: ({ row }) =>
				renderComponent(Checkbox, {
					checked: row.getIsSelected(),
					onCheckedChange: (value) => row.toggleSelected(value),
					'aria-label': 'เลือกแถว'
				}),
			enableSorting: false,
			enableHiding: false
		},
		{
			accessorKey: 'title',
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: 'โครงการ' }),
			cell: ({ row }) => {
				return renderSnippet(TitleCell, {
					labelValue: row.original.title,
					value: row.original.title
				});
			}
		},
		{
			accessorKey: 'status',
			header: ({ column }) =>
				renderSnippet(ColumnHeader, {
					column,
					title: 'สถานะ'
				}),
			cell: ({ row }) => {
				return renderSnippet(StatusCell, {
					value: row.original.status,
					id: row.original.id,
					title: row.original.title
				});
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			}
		},
		{
			accessorKey: 'owner',
			header: ({ column }) =>
				renderSnippet(ColumnHeader, {
					column,
					title: 'เจ้าของ'
				}),
			cell: ({ row }) => {
				return renderSnippet(OwnerCell, {
					value: row.original.owner,
					id: row.original.id,
					title: row.original.title
				});
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			}
		},
		{
			accessorKey: 'staffs',
			header: ({ column }) =>
				renderSnippet(ColumnHeader, {
					column,
					title: 'ผู้ยืม'
				}),
			cell: ({ row }) => {
				return renderSnippet(StaffCell, {
					count: row.original.staffs.length,
					id: row.original.id
				});
			},
			enableColumnFilter: false
		},
		{
			accessorKey: 'createdAt',
			header: ({ column }) =>
				renderSnippet(ColumnHeader, {
					column,
					title: 'วันที่สร้าง'
				}),
			cell: ({ row }) => {
				return renderSnippet(CreatedAtCell, {
					value: row.original.createdAt
				});
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			}
		},
		{
			id: 'actions',
			cell: ({ row }) => renderSnippet(RowActions, { row })
		}
	];

	const table = createSvelteTable({
		get data() {
			return data;
		},
		state: {
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
			get pagination() {
				return pagination;
			}
		},
		columns,
		enableRowSelection: true,
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues()
	});
</script>

{#snippet StatusCell({ value, id, title }: { value: string; id: string; title: string })}
	{@const status = projectStatusOptions.find((status) => status.value === value)}
	{#if status}
		<Select.Root
			type="single"
			onValueChange={async (val) => {
				await setProjectInfo({
					id,
					status: val as
						| 'notstarted'
						| 'inprogress'
						| 'completed'
						| 'evaluated'
						| 'cancelled'
						| undefined
				});
				const newStatus = projectStatusOptions.find((status) => status.value === val);
				toast.success(`อัปเดต "${title}" เป็น ${newStatus?.label}`);
			}}
			{value}
		>
			<Select.Trigger
				size="sm"
				class={cn('w-[140px] justify-start border-none shadow-none', status.color)}
			>
				<status.icon class={cn('mr-2 size-4 shrink-0 text-inherit')} />
				<span>
					{status.label}
				</span>
			</Select.Trigger>
			<Select.Content>
				{#each projectStatusOptions as status (status.value)}
					<Select.Item value={status.value} class={cn(status.color, 'bg-background')}>
						<status.icon class="mr-2 size-4 shrink-0 text-inherit" />
						<span>{status.label}</span>
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	{/if}
{/snippet}

{#snippet OwnerCell({ value, id, title }: { value: string; id: string; title?: string })}
	{@const owner = projectOwnerOptions.find((owner) => owner.value === value)}
	{#if owner}
		<Select.Root
			type="single"
			onValueChange={async (val) => {
				await setProjectInfo({
					id,
					owner: val as string
				});
				const newOwner = projectOwnerOptions.find((owner) => owner.value === val);
				toast.success(`อัปเดตฝ่ายเจ้าของโครง "${title}" เป็น ${newOwner?.label}`);
			}}
			{value}
		>
			<Select.Trigger class="h-8 w-[140px] justify-start border-none shadow-none">
				<span class="truncate">
					{owner.label}
				</span>
			</Select.Trigger>
			<Select.Content>
				{#each projectOwnerOptions as owner (owner.value)}
					<Select.Item value={owner.value} class="bg-background">
						<span>{owner.label}</span>
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	{/if}
{/snippet}

{#snippet StaffCell({ count, id }: { count: number; id: string })}
	<Button variant="ghost" class="text-muted-foreground" href="/admin/projects/{id}">
		<span>{count} คน</span>
		<ChevronRight />
	</Button>
{/snippet}

{#snippet CreatedAtCell({ value }: { value: Date | null })}
	<div class="flex w-[100px] items-center">
		<span>{value ? formatDate(value) : '?'}</span>
	</div>
{/snippet}

{#snippet TitleCell({ value }: { value: string })}
	<div class="flex space-x-2">
		<span class="max-w-[500px] truncate font-medium">
			{value}
		</span>
	</div>
{/snippet}

{#snippet RowActions({ row }: { row: Row<Project> })}
	<AlertDialog.Root bind:open={dialogRemoveOpen}>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="ghost" class="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
						<EllipsisIcon />
						<span class="sr-only">เปิดเมนู</span>
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-[160px]" align="end">
				<DropdownMenu.Item
					onclick={() => {
						goto(`/admin/projects/${row.original.id}`);
					}}>แก้ไข</DropdownMenu.Item
				>
				<DropdownMenu.Separator />
				<AlertDialog.Trigger>
					{#snippet child({ props })}
						<DropdownMenu.Item variant="destructive" {...props}>ลบโครงการ</DropdownMenu.Item>
					{/snippet}
				</AlertDialog.Trigger>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<AlertDialog.Portal>
			<AlertDialog.Overlay />
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>
						คุณต้องการลบ {row.original.title} หรือไม่?
					</AlertDialog.Title>
					<AlertDialog.Description>
						การลบโครงการโดยยังไม่ได้เคลียร์ของอาจเกิดปัญหาของหายได้ หากคุณลบโดยไม่ตั้งใจโปรดติดต่อ
						IT
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel>ยกเลิก</AlertDialog.Cancel>
					<AlertDialog.Action
						onclick={async () => {
							await removeProject({ id: row.original.id });
							toast.success(`ลบโครงการ "${row.original.title}" เรียบร้อยแล้ว`);
							dialogRemoveOpen = false;
						}}>ลบเลย</AlertDialog.Action
					>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Portal>
	</AlertDialog.Root>
{/snippet}

{#snippet Pagination({ table }: { table: TableType<Project> })}
	<div class="flex items-center justify-between px-2">
		<div class="flex-1 text-sm text-muted-foreground">
			เลือก {table.getFilteredSelectedRowModel().rows.length} แถวจาก
			{table.getFilteredRowModel().rows.length} แถว
		</div>
		<div class="flex items-center space-x-6 lg:space-x-8">
			<div class="flex items-center space-x-2">
				<p class="text-sm font-medium">แถวต่อหน้า</p>
				<Select.Root
					allowDeselect={false}
					type="single"
					value={`${table.getState().pagination.pageSize}`}
					onValueChange={(value) => {
						table.setPageSize(Number(value));
					}}
				>
					<Select.Trigger class="h-8 w-[70px]">
						{String(table.getState().pagination.pageSize)}
					</Select.Trigger>
					<Select.Content side="top">
						{#each [10, 20, 30, 40, 50] as pageSize (pageSize)}
							<Select.Item value={`${pageSize}`}>
								{pageSize}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="flex w-[100px] items-center justify-center text-sm font-medium">
				หน้า {table.getState().pagination.pageIndex + 1} จาก
				{table.getPageCount()}
			</div>
			<div class="flex items-center space-x-2">
				<Button
					variant="outline"
					class="hidden size-8 p-0 lg:flex"
					onclick={() => table.setPageIndex(0)}
					disabled={!table.getCanPreviousPage()}
				>
					<span class="sr-only">ไปที่หน้าแรก</span>
					<ChevronsLeftIcon />
				</Button>
				<Button
					variant="outline"
					class="size-8 p-0"
					onclick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<span class="sr-only">ไปหน้าก่อนหน้า</span>
					<ChevronLeftIcon />
				</Button>
				<Button
					variant="outline"
					class="size-8 p-0"
					onclick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					<span class="sr-only">ไปหน้าถัดไป</span>
					<ChevronRightIcon />
				</Button>
				<Button
					variant="outline"
					class="hidden size-8 p-0 lg:flex"
					onclick={() => table.setPageIndex(table.getPageCount() - 1)}
					disabled={!table.getCanNextPage()}
				>
					<span class="sr-only">ไปหน้าสุดท้าย</span>
					<ChevronsRightIcon />
				</Button>
			</div>
		</div>
	</div>
{/snippet}

{#snippet ColumnHeader({
	column,
	title,
	class: className,
	...restProps
}: { column: Column<Project>; title: string } & HTMLAttributes<HTMLDivElement>)}
	{#if !column?.getCanSort()}
		<div class={className} {...restProps}>
			{title}
		</div>
	{:else}
		<div class={cn('flex items-center', className)} {...restProps}>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="ghost"
							size="sm"
							class="-ml-3 h-8 data-[state=open]:bg-accent"
						>
							<span>
								{title}
							</span>
							{#if column.getIsSorted() === 'desc'}
								<ArrowDownIcon />
							{:else if column.getIsSorted() === 'asc'}
								<ArrowUpIcon />
							{:else}
								<ChevronsUpDownIcon />
							{/if}
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="start">
					<DropdownMenu.Item onclick={() => column.toggleSorting(false)}>
						<ArrowUpIcon class="mr-2 size-3.5 text-muted-foreground/70" />
						จากน้อยไปมาก
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => column.toggleSorting(true)}>
						<ArrowDownIcon class="mr-2 size-3.5 text-muted-foreground/70" />
						จากมากไปน้อย
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onclick={() => column.toggleVisibility(false)}>
						<EyeOffIcon class="mr-2 size-3.5 text-muted-foreground/70" />
						ซ่อน
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	{/if}
{/snippet}

<div class="space-y-4">
	<DataTableToolbar {table} />
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head colspan={header.colSpan}>
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
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">ไม่พบข้อมูล</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	{@render Pagination({ table })}
</div>
