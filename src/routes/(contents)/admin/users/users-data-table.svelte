<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { createQuery } from '@tanstack/svelte-query';
	import {
		getCoreRowModel,
		type ColumnDef,
		type PaginationState,
		type RowSelectionState
	} from '@tanstack/table-core';
	import type { User } from 'better-auth';

	import * as Table from '$stories/shadcnui/table';
	import { createSvelteTable, FlexRender, renderSnippet } from '$stories/shadcnui/data-table';
	import { cn } from '$stories/utils';
	import Button from '$stories/shadcnui/button/button.svelte';
	import Checkbox from '$stories/shadcnui/checkbox/checkbox.svelte';

	let queryOptions = $state({
		limit: 100,
		offset: 0
	});
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let rowSelection = $state<RowSelectionState>({});

	const userQuery = $derived(
		createQuery({
			queryKey: ['users', queryOptions],
			queryFn: ({ signal }) =>
				authClient.admin.listUsers({
					query: {
						offset: queryOptions.offset,
						limit: queryOptions.limit
					},
					fetchOptions: {
						signal
					}
				})
		})
	);

	type UserWithRole =
		| (User & {
				role: string;
		  })
		| never[]
		| undefined;

	const columns: ColumnDef<UserWithRole>[] = [
		{
			id: 'select',
			header: ({ table }) =>
				renderSnippet(rowCheckbox, {
					checked: table.getIsAllRowsSelected(),
					onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
					indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
					'aria-label': 'Select all'
				}),
			cell: ({ row }) =>
				renderSnippet(rowCheckbox, {
					checked: row.getIsSelected(),
					onCheckedChange: (value) => row.toggleSelected(!!value),
					'aria-label': 'Select row'
				})
		},
		{
			header: 'Name',
			accessorKey: 'name',
			cell: ({ row }) => row.getValue('name')
		},
		{
			header: 'Email',
			accessorKey: 'email',
			cell: ({ row }) => row.getValue('email')
		},
		{
			header: 'Role',
			accessorKey: 'role',
			cell: ({ row }) => renderSnippet(rolesBadge, row.getValue('role'))
		},
		{
			header: '',
			accessorKey: 'actions'
		}
	];

	const table = createSvelteTable({
		get data() {
			return $userQuery.data?.data?.users ?? [];
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		},
		state: {
			get pagination() {
				return pagination;
			},
			// get sorting() {
			// 	return sorting;
			// },
			// get columnFilters() {
			// 	return columnFilters;
			// },
			// get columnVisibility() {
			// 	return columnVisibility;
			// },
			get rowSelection() {
				return rowSelection;
			}
		}
	});
</script>

{#snippet rolesBadge(roles: string)}
	<div class="flex flex-wrap gap-1">
		{#each roles.split(',') as role (role)}
			<span
				class={cn(
					'inline-block rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground',
					role === 'admin' ? 'bg-yellow-100 text-yellow-800' : ''
				)}
			>
				{role}
			</span>
		{/each}
	</div>
{/snippet}

{#snippet rowCheckbox({
	checked,
	onCheckedChange,
	...restProps
}: {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
})}
	<Checkbox bind:checked={() => checked, onCheckedChange} {...restProps} />
{/snippet}

<div>
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
						<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div>
		<div class="flex items-center justify-end space-x-2 pt-4">
			<div class="flex-1 text-sm text-muted-foreground">
				เลือกไว้ {table.getFilteredSelectedRowModel().rows.length} จากทั้งหมด
				{table.getFilteredRowModel().rows.length} แถว
			</div>
			<div class="space-x-2">
				<Button
					variant="outline"
					size="sm"
					onclick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					Next
				</Button>
			</div>
		</div>
	</div>
</div>
