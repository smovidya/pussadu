<script lang="ts" generics="TData">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import ChevronsLeftIcon from '@lucide/svelte/icons/chevrons-left';
	import ChevronsRightIcon from '@lucide/svelte/icons/chevrons-right';
	import type { Table } from '@tanstack/table-core';
	import { Button } from '$stories/shadcnui/button';
	import * as Select from '$stories/shadcnui/select';

	let { table, pageSizes = [10, 20, 30, 40, 50] }: { table: Table<TData>; pageSizes?: number[] } =
		$props();
</script>

<div class="flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
	<p class="flex-1 text-sm text-muted-foreground tabular-nums">
		เลือก {table.getFilteredSelectedRowModel().rows.length} แถวจาก
		{table.getFilteredRowModel().rows.length} แถว
	</p>
	<div class="flex flex-wrap items-center gap-4 lg:gap-6">
		<div class="flex items-center gap-2">
			<p class="text-sm font-medium">แถวต่อหน้า</p>
			<Select.Root
				allowDeselect={false}
				type="single"
				value={`${table.getState().pagination.pageSize}`}
				onValueChange={(value) => table.setPageSize(Number(value))}
			>
				<Select.Trigger class="w-18 tabular-nums">
					{String(table.getState().pagination.pageSize)}
				</Select.Trigger>
				<Select.Content side="top">
					<Select.Group>
						{#each pageSizes as pageSize (pageSize)}
							<Select.Item value={`${pageSize}`}>{pageSize}</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>
		<p class="min-w-24 text-center text-sm font-medium tabular-nums">
			หน้า {table.getState().pagination.pageIndex + 1} จาก {Math.max(1, table.getPageCount())}
		</p>
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="icon"
				class="hidden lg:inline-flex"
				onclick={() => table.setPageIndex(0)}
				disabled={!table.getCanPreviousPage()}
				aria-label="ไปที่หน้าแรก"><ChevronsLeftIcon /></Button
			>
			<Button
				variant="outline"
				size="icon"
				onclick={() => table.previousPage()}
				disabled={!table.getCanPreviousPage()}
				aria-label="ไปหน้าก่อนหน้า"><ChevronLeftIcon /></Button
			>
			<Button
				variant="outline"
				size="icon"
				onclick={() => table.nextPage()}
				disabled={!table.getCanNextPage()}
				aria-label="ไปหน้าถัดไป"><ChevronRightIcon /></Button
			>
			<Button
				variant="outline"
				size="icon"
				class="hidden lg:inline-flex"
				onclick={() => table.setPageIndex(table.getPageCount() - 1)}
				disabled={!table.getCanNextPage()}
				aria-label="ไปหน้าสุดท้าย"><ChevronsRightIcon /></Button
			>
		</div>
	</div>
</div>
