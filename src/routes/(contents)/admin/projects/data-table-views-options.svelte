<script lang="ts" generics="TData">
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import type { Table } from '@tanstack/table-core';
	import { buttonVariants } from '$stories/shadcnui/button';
	import * as DropdownMenu from '$stories/shadcnui/dropdown-menu';

	let { table }: { table: Table<TData> } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={buttonVariants({
			variant: 'outline',
			size: 'sm',
			class: 'ml-auto hidden h-8 lg:flex'
		})}
	>
		<Settings2Icon />
		มุมมอง
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>ซ่อนแสดงบางคอลัมน์</DropdownMenu.Label>
			<DropdownMenu.Separator />
			{#each table
				.getAllColumns()
				.filter((col) => typeof col.accessorFn !== 'undefined' && col.getCanHide()) as column (column)}
				<DropdownMenu.CheckboxItem
					bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
					class="capitalize"
				>
					{column.id}
				</DropdownMenu.CheckboxItem>
			{/each}
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
