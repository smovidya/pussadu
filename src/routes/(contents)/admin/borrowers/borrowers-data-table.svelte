<script lang="ts">
	import { getCoreRowModel, type ColumnDef, type Row } from '@tanstack/table-core';

	import * as Table from '$stories/shadcnui/table';
	import * as DropdownMenu from '$stories/shadcnui/dropdown-menu';
	import * as AlertDialog from '$stories/shadcnui/alert-dialog';
	import { createSvelteTable, FlexRender, renderSnippet } from '$stories/shadcnui/data-table';
	import { Button } from '$stories/shadcnui/button';
	import { Spinner } from '$stories/shadcnui/spinner';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { CirclePlus } from '@lucide/svelte';
	import { listAllBorrowers, removeBorrower } from '$lib/rpc/borrower.remote';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';
	import BorrowerFormSheet from './borrower-form-sheet.svelte';
	import { toast } from 'svelte-sonner';

	type Borrower = NonNullable<ReturnType<typeof listAllBorrowers>['current']>[number];

	const columns: ColumnDef<Borrower>[] = [
		{
			header: 'ชื่อ-นามสกุล',
			accessorKey: 'name'
		},
		{
			header: 'เลขนิสิต',
			accessorKey: 'ouid',
			cell: ({ row }) => renderSnippet(OuidCell, { value: row.original.ouid })
		},
		{
			header: 'อีเมล',
			accessorKey: 'email'
		},
		{
			header: 'ภาควิชา',
			id: 'department',
			cell: ({ row }) => renderSnippet(DepartmentCell, { name: row.original.department?.name })
		},
		{
			header: 'เบอร์โทร',
			accessorKey: 'phone'
		},
		{
			id: 'actions',
			cell: ({ row }) => renderSnippet(RowActions, { row })
		}
	];

	const createTable = (data: Borrower[]) =>
		createSvelteTable({
			data,
			columns,
			getCoreRowModel: getCoreRowModel(),
			state: {}
		});
</script>

{#snippet OuidCell({ value }: { value: string })}
	<code class="text-sm">{value}</code>
{/snippet}

{#snippet DepartmentCell({ name }: { name: string | undefined })}
	<span class="text-sm text-muted-foreground">{name ?? '-'}</span>
{/snippet}

{#snippet RowActions({ row }: { row: Row<Borrower> })}
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
			<DropdownMenu.Content class="w-40" align="end">
				<DropdownMenu.Label>ดำเนินการ</DropdownMenu.Label>
				<BorrowerFormSheet borrower={row.original}>
					{#snippet trigger({ props })}
						<DropdownMenu.Item {...props} onSelect={(e) => e.preventDefault()}>
							แก้ไข
						</DropdownMenu.Item>
					{/snippet}
				</BorrowerFormSheet>
				<AlertDialog.Trigger>
					{#snippet child({ props })}
						<DropdownMenu.Item variant="destructive" {...props}>ลบ</DropdownMenu.Item>
					{/snippet}
				</AlertDialog.Trigger>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<AlertDialog.Portal>
			<AlertDialog.Overlay />
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>คุณต้องการลบ {row.original.name} หรือไม่?</AlertDialog.Title>
					<AlertDialog.Description>
						ผู้ใช้จะไม่สามารถยืมพัสดุได้จนกว่าจะเพิ่มกลับเข้าระบบอีกครั้ง
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel disabled={!!removeBorrower.pending}>ยกเลิก</AlertDialog.Cancel>
					<AlertDialog.Action
						disabled={!!removeBorrower.pending}
						onclick={async () => {
							await removeBorrower({ ouid: row.original.ouid });
							toast.success(`ลบ "${row.original.name}" เรียบร้อยแล้ว`);
						}}
					>
						{#if removeBorrower.pending}
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
{/snippet}

<div class="flex flex-col gap-4">
	<div class="flex justify-end">
		<BorrowerFormSheet>
			{#snippet trigger({ props })}
				<Button {...props} variant="default">
					<CirclePlus />
					<span>เพิ่มผู้มีสิทธิ์ยืม</span>
				</Button>
			{/snippet}
		</BorrowerFormSheet>
	</div>
	<AsyncHttpBoundary dataLoader={listAllBorrowers()}>
		{#snippet children(data)}
			{@const table = createTable(data)}
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
								<Table.Cell colspan={columns.length} class="h-24 text-center">
									ไม่พบข้อมูล
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{/snippet}
	</AsyncHttpBoundary>
</div>
