<script lang="ts" generics="TData">
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import type { Table } from '@tanstack/table-core';
	import { Button } from '$stories/shadcnui/button';
	import * as DropdownMenu from '$stories/shadcnui/dropdown-menu';

	let { table }: { table: Table<TData> } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="sm" class="ml-auto hidden lg:flex">
				<Settings2Icon data-icon="inline-start" />
				มุมมอง
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Group>
			<DropdownMenu.Label>ซ่อนหรือแสดงคอลัมน์</DropdownMenu.Label>
			<DropdownMenu.Separator />
			{#each table
				.getAllColumns()
				.filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide()) as column (column.id)}
				<DropdownMenu.CheckboxItem
					bind:checked={() => column.getIsVisible(), (value) => column.toggleVisibility(!!value)}
				>
					{column.id}
				</DropdownMenu.CheckboxItem>
			{/each}
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
