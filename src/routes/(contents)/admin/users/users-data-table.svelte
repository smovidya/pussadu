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
	import AddStudentSheet from './add-student-sheet.svelte';
	import { createSvelteTable } from '$stories/shadcnui/data-table/data-table.svelte.js';
	import FlexRender from '$stories/shadcnui/data-table/flex-render.svelte';
	import * as Table from '$stories/shadcnui/table';
	import * as DropdownMenu from '$stories/shadcnui/dropdown-menu';
	import * as AlertDialog from '$stories/shadcnui/alert-dialog';
	import { renderComponent, renderSnippet } from '$stories/shadcnui/data-table/render-helpers.js';
	import Checkbox from '$stories/shadcnui/checkbox/checkbox.svelte';
	import { Button } from '$stories/shadcnui/button';
	import { Input } from '$stories/shadcnui/input';
	import Badge from '$stories/shadcnui/badge/badge.svelte';
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
	import { userRoleOptions, userStatusOptions } from '$lib/constants';
	import { formatDate } from '$lib/utils/datetime';
	import {
		getAllStudentUsers,
		setStudentUserRole,
		bulkBanStudentUsers,
		bulkUnbanStudentUsers,
		bulkRemoveStudentUsers
	} from '$lib/rpc/user.remote';
	import { toast } from 'svelte-sonner';
	import { Spinner } from '$stories/shadcnui/spinner';

	type User = {
		id: string;
		name: string;
		email: string;
		role: string | null;
		banned: boolean | null;
		banReason: string | null;
		ouid: string | null;
		createdAt: Date | null;
	};

	interface Props {
		getAllStudentUsersQuery: ReturnType<typeof getAllStudentUsers>;
	}

	const { getAllStudentUsersQuery = $bindable() }: Props = $props();

	const data = getAllStudentUsersQuery.current ?? [];

	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({});
	let columnFilters = $state<ColumnFiltersState>([]);
	let sorting = $state<SortingState>([{ id: 'createdAt', desc: true }]);
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });

	let bulkBanReason = $state('');
	let dialogBulkBanOpen = $state(false);
	let dialogBulkUnbanOpen = $state(false);
	let dialogBulkRemoveOpen = $state(false);

	const columns: ColumnDef<User>[] = [
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
			accessorKey: 'name',
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: 'ชื่อ' }),
			cell: ({ row }) => renderSnippet(NameCell, { value: row.original.name }),
			filterFn: (row, id, value) => {
				const search = String(value).toLowerCase();
				return (
					row.original.name.toLowerCase().includes(search) ||
					row.original.email.toLowerCase().includes(search)
				);
			}
		},
		{
			accessorKey: 'email',
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: 'อีเมล' }),
			cell: ({ row }) => renderSnippet(EmailCell, { value: row.original.email })
		},
		{
			accessorKey: 'ouid',
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: 'เลขนิสิต' }),
			cell: ({ row }) => renderSnippet(OuidCell, { value: row.original.ouid })
		},
		{
			id: 'role',
			// role can be a comma-joined multi-role string (eg. "admin,user") since every
			// account keeps 'user' as its base role — this derives the highest tier for display/filtering.
			accessorFn: (row) => {
				const roles = (row.role ?? 'user').split(',').map((r) => r.trim());
				if (roles.includes('admin')) return 'admin';
				if (roles.includes('staff')) return 'staff';
				return 'user';
			},
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: 'บทบาท' }),
			cell: ({ row }) =>
				renderSnippet(RoleCell, {
					value: row.getValue('role') as string,
					id: row.original.id,
					email: row.original.email
				}),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			}
		},
		{
			id: 'status',
			accessorFn: (row) => (row.banned ? 'banned' : 'active'),
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: 'สถานะ' }),
			cell: ({ row }) =>
				renderSnippet(StatusCell, { banned: row.original.banned, reason: row.original.banReason }),
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			}
		},
		{
			accessorKey: 'createdAt',
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: 'วันที่สร้าง' }),
			cell: ({ row }) => renderSnippet(CreatedAtCell, { value: row.original.createdAt })
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

	const selectedIds = $derived(
		table.getFilteredSelectedRowModel().rows.map((row) => row.original.id)
	);

	function reportBulkResult(
		result: { succeeded: string[]; failed: { id: string; error: string }[] },
		successMsg: string
	) {
		if (result.failed.length === 0) {
			toast.success(successMsg);
		} else {
			toast.warning(
				`${successMsg} (ล้มเหลว ${result.failed.length} คน: ${result.failed.map((f) => f.error).join(', ')})`
			);
		}
		rowSelection = {};
	}
</script>

{#snippet NameCell({ value }: { value: string })}
	<span class="max-w-50 truncate font-medium">{value}</span>
{/snippet}

{#snippet EmailCell({ value }: { value: string })}
	<span class="text-sm text-muted-foreground">{value}</span>
{/snippet}

{#snippet OuidCell({ value }: { value: string | null })}
	<code class="text-sm">{value || '-'}</code>
{/snippet}

{#snippet RoleCell({ value, id, email }: { value: string; id: string; email: string })}
	{@const role = userRoleOptions.find((r) => r.value === value)}
	<Select.Root
		type="single"
		{value}
		onValueChange={async (val) => {
			if (!val) return;
			try {
				await setStudentUserRole({ id, role: val });
				const newRole = userRoleOptions.find((r) => r.value === val);
				toast.success(`เปลี่ยนบทบาทของ "${email}" เป็น ${newRole?.label}`);
			} catch (e) {
				toast.error(`เกิดข้อผิดพลาด: ${(e as Error).message}`);
			}
		}}
	>
		<Select.Trigger
			size="sm"
			disabled={!!setStudentUserRole.pending}
			class={cn('w-32 justify-start border-none shadow-none', role?.color)}
		>
			{role?.label ?? value}
		</Select.Trigger>
		<Select.Content>
			{#each userRoleOptions as role (role.value)}
				<Select.Item value={role.value} class={cn(role.color, 'bg-background')}>
					{role.label}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
{/snippet}

{#snippet StatusCell({ banned, reason }: { banned: boolean | null; reason: string | null })}
	{@const status = userStatusOptions.find((s) => s.value === (banned ? 'banned' : 'active'))}
	<Badge class={cn('border-0', status?.color)} title={banned ? reason || undefined : undefined}>
		{status?.label}
	</Badge>
{/snippet}

{#snippet CreatedAtCell({ value }: { value: Date | null })}
	<div class="flex w-25 items-center">
		<span>{value ? formatDate(value) : '?'}</span>
	</div>
{/snippet}

{#snippet RowActions({ row }: { row: Row<User> })}
	<AlertDialog.Root>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="ghost" class="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
						<EllipsisIcon />
						<span class="sr-only">เปิดเมนู</span>
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-48" align="end">
				<DropdownMenu.Label>ดำเนินการ</DropdownMenu.Label>
				{#if row.original.banned}
					<DropdownMenu.Item
						onclick={async () => {
							const result = await bulkUnbanStudentUsers({ ids: [row.original.id] });
							reportBulkResult(result, `ปลดแบน "${row.original.email}" เรียบร้อยแล้ว`);
						}}
					>
						ปลดแบน
					</DropdownMenu.Item>
				{:else}
					<DropdownMenu.Item
						onclick={async () => {
							const result = await bulkBanStudentUsers({
								ids: [row.original.id],
								reason: 'แบนโดยผู้ดูแลระบบ'
							});
							reportBulkResult(result, `แบน "${row.original.email}" เรียบร้อยแล้ว`);
						}}
					>
						แบน
					</DropdownMenu.Item>
				{/if}
				<AlertDialog.Trigger>
					{#snippet child({ props })}
						<DropdownMenu.Item variant="destructive" {...props}>ลบผู้ใช้</DropdownMenu.Item>
					{/snippet}
				</AlertDialog.Trigger>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<AlertDialog.Portal>
			<AlertDialog.Overlay />
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>คุณต้องการลบผู้ใช้ "{row.original.email}" หรือไม่?</AlertDialog.Title>
					<AlertDialog.Description>
						การลบผู้ใช้จะลบบัญชีและเซสชันทั้งหมดของผู้ใช้นี้ ไม่สามารถกู้คืนได้
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel disabled={!!bulkRemoveStudentUsers.pending}>ยกเลิก</AlertDialog.Cancel
					>
					<AlertDialog.Action
						disabled={!!bulkRemoveStudentUsers.pending}
						onclick={async () => {
							const result = await bulkRemoveStudentUsers({ ids: [row.original.id] });
							reportBulkResult(result, `ลบ "${row.original.email}" เรียบร้อยแล้ว`);
						}}
					>
						{#if bulkRemoveStudentUsers.pending}
							<Spinner />
							<span>กำลังลบ...</span>
						{:else}
							ลบผู้ใช้
						{/if}
					</AlertDialog.Action>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Portal>
	</AlertDialog.Root>
{/snippet}

{#snippet Pagination({ table }: { table: TableType<User> })}
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
					<Select.Trigger class="h-8 w-17.5">
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
			<div class="flex w-25 items-center justify-center text-sm font-medium">
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
}: { column: Column<User>; title: string } & HTMLAttributes<HTMLDivElement>)}
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
							<span>{title}</span>
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
	<div class="flex items-center justify-between gap-2">
		<DataTableToolbar {table} />
		<AddStudentSheet />
	</div>

	{#if selectedIds.length > 0}
		<div class="flex items-center gap-2 rounded-md border bg-muted/40 p-2">
			<span class="text-sm text-muted-foreground">เลือกไว้ {selectedIds.length} คน</span>

			<AlertDialog.Root bind:open={dialogBulkBanOpen}>
				<AlertDialog.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="sm">แบนที่เลือก</Button>
					{/snippet}
				</AlertDialog.Trigger>
				<AlertDialog.Portal>
					<AlertDialog.Overlay />
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>แบนผู้ใช้ {selectedIds.length} คนที่เลือก?</AlertDialog.Title>
							<AlertDialog.Description
								>ผู้ใช้ที่ถูกแบนจะไม่สามารถเข้าสู่ระบบได้จนกว่าจะปลดแบน</AlertDialog.Description
							>
						</AlertDialog.Header>
						<div class="flex flex-col gap-1 px-1">
							<Input placeholder="เหตุผลในการแบน" bind:value={bulkBanReason} />
						</div>
						<AlertDialog.Footer>
							<AlertDialog.Cancel disabled={!!bulkBanStudentUsers.pending}
								>ยกเลิก</AlertDialog.Cancel
							>
							<AlertDialog.Action
								disabled={!!bulkBanStudentUsers.pending}
								onclick={async () => {
									const result = await bulkBanStudentUsers({
										ids: selectedIds,
										reason: bulkBanReason || 'แบนโดยผู้ดูแลระบบ'
									});
									reportBulkResult(result, `แบนผู้ใช้ ${result.succeeded.length} คนเรียบร้อยแล้ว`);
									bulkBanReason = '';
									dialogBulkBanOpen = false;
								}}
							>
								{#if bulkBanStudentUsers.pending}
									<Spinner />
									<span>กำลังแบน...</span>
								{:else}
									แบน
								{/if}
							</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Portal>
			</AlertDialog.Root>

			<AlertDialog.Root bind:open={dialogBulkUnbanOpen}>
				<AlertDialog.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="sm">ปลดแบนที่เลือก</Button>
					{/snippet}
				</AlertDialog.Trigger>
				<AlertDialog.Portal>
					<AlertDialog.Overlay />
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>ปลดแบนผู้ใช้ {selectedIds.length} คนที่เลือก?</AlertDialog.Title>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel disabled={!!bulkUnbanStudentUsers.pending}
								>ยกเลิก</AlertDialog.Cancel
							>
							<AlertDialog.Action
								disabled={!!bulkUnbanStudentUsers.pending}
								onclick={async () => {
									const result = await bulkUnbanStudentUsers({ ids: selectedIds });
									reportBulkResult(
										result,
										`ปลดแบนผู้ใช้ ${result.succeeded.length} คนเรียบร้อยแล้ว`
									);
									dialogBulkUnbanOpen = false;
								}}
							>
								{#if bulkUnbanStudentUsers.pending}
									<Spinner />
									<span>กำลังปลดแบน...</span>
								{:else}
									ปลดแบน
								{/if}
							</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Portal>
			</AlertDialog.Root>

			<AlertDialog.Root bind:open={dialogBulkRemoveOpen}>
				<AlertDialog.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="destructive" size="sm">ลบที่เลือก</Button>
					{/snippet}
				</AlertDialog.Trigger>
				<AlertDialog.Portal>
					<AlertDialog.Overlay />
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>ลบผู้ใช้ {selectedIds.length} คนที่เลือก?</AlertDialog.Title>
							<AlertDialog.Description>
								การลบผู้ใช้จะลบบัญชีและเซสชันทั้งหมด ไม่สามารถกู้คืนได้
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel disabled={!!bulkRemoveStudentUsers.pending}
								>ยกเลิก</AlertDialog.Cancel
							>
							<AlertDialog.Action
								disabled={!!bulkRemoveStudentUsers.pending}
								onclick={async () => {
									const result = await bulkRemoveStudentUsers({ ids: selectedIds });
									reportBulkResult(result, `ลบผู้ใช้ ${result.succeeded.length} คนเรียบร้อยแล้ว`);
									dialogBulkRemoveOpen = false;
								}}
							>
								{#if bulkRemoveStudentUsers.pending}
									<Spinner />
									<span>กำลังลบ...</span>
								{:else}
									ลบ
								{/if}
							</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Portal>
			</AlertDialog.Root>
		</div>
	{/if}

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
