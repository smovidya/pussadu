<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { getCoreRowModel, type ColumnDef } from '@tanstack/table-core';

	import * as Table from '$stories/shadcnui/table';
	import { createSvelteTable, FlexRender } from '$stories/shadcnui/data-table';
	import { listAllBorrowers } from '$lib/rpc/borrower.remote';

	const userQuery = $derived(
		createQuery({
			queryKey: ['users'],
			queryFn: () => listAllBorrowers()
		})
	);

	type Borrower = {
		email: string;
		name: string;
		createdAt: Date | null;
		updatedAt: Date | null;
		deletedAt: Date | null;
		ouid: string;
		line_id: string;
		phone: string;
		departmentId: string;
		oldIsAdmin: boolean;
	};

	const columns: ColumnDef<Borrower>[] = [
		{
			header: 'Name',
			accessorKey: 'name'
		},
		{
			header: 'เลขนิสิต',
			accessorKey: 'ouid'
		},
		{
			header: '',
			accessorKey: 'actions'
		}
	];

	const table = createSvelteTable({
		get data() {
			return $userQuery.data ?? [];
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		state: {}
	});
</script>

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
</div>
