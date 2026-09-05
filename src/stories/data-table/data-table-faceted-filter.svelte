<script lang="ts" generics="TData, TValue">
	import CheckIcon from '@lucide/svelte/icons/check';
	import CirclePlusIcon from '@lucide/svelte/icons/circle-plus';
	import type { Column } from '@tanstack/table-core';
	import { SvelteSet } from 'svelte/reactivity';
	import { Badge } from '$stories/shadcnui/badge';
	import { Button } from '$stories/shadcnui/button';
	import * as Command from '$stories/shadcnui/command';
	import * as Popover from '$stories/shadcnui/popover';
	import { Separator } from '$stories/shadcnui/separator';
	import { cn } from '$stories/utils';
	import type { FacetedFilterOption } from './types';

	let {
		column,
		title,
		options
	}: {
		column: Column<TData, TValue>;
		title: string;
		options: FacetedFilterOption[];
	} = $props();

	const facets = $derived(column.getFacetedUniqueValues());
	const selectedValues = $derived(new SvelteSet((column.getFilterValue() as string[]) ?? []));
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="sm" class="border-dashed">
				<CirclePlusIcon data-icon="inline-start" />
				{title}
				{#if selectedValues.size > 0}
					<Separator orientation="vertical" class="mx-1 h-4" />
					<Badge variant="secondary" class="rounded-sm px-1 font-normal lg:hidden">
						{selectedValues.size}
					</Badge>
					<div class="hidden gap-1 lg:flex">
						{#if selectedValues.size > 2}
							<Badge variant="secondary" class="rounded-sm px-1 font-normal">
								เลือกไว้ {selectedValues.size} รายการ
							</Badge>
						{:else}
							{#each options.filter( (option) => selectedValues.has(option.value) ) as option (option.value)}
								<Badge variant="secondary" class="rounded-sm px-1 font-normal">
									{option.label}
								</Badge>
							{/each}
						{/if}
					</div>
				{/if}
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-52 p-0" align="start">
		<Command.Root>
			<Command.Input placeholder={`ค้นหา${title}`} />
			<Command.List>
				<Command.Empty>ไม่พบผลลัพธ์</Command.Empty>
				<Command.Group>
					{#each options as option (option.value)}
						{@const isSelected = selectedValues.has(option.value)}
						<Command.Item
							onSelect={() => {
								if (isSelected) selectedValues.delete(option.value);
								else selectedValues.add(option.value);
								const values = Array.from(selectedValues);
								column.setFilterValue(values.length ? values : undefined);
							}}
						>
							<span
								class={cn(
									'flex size-4 items-center justify-center rounded-sm border border-primary',
									isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible'
								)}
							>
								<CheckIcon />
							</span>
							{#if option.icon}
								{@render SpecificIcon({ Icon: option.icon })}
							{/if}
							<span>{option.label}</span>
							{#if facets.get(option.value)}
								<span class="ml-auto font-mono text-xs tabular-nums">
									{facets.get(option.value)}
								</span>
							{/if}
						</Command.Item>
					{/each}
				</Command.Group>
				{#if selectedValues.size > 0}
					<Command.Separator />
					<Command.Group>
						<Command.Item onSelect={() => column.setFilterValue(undefined)} class="justify-center">
							ลบตัวกรอง
						</Command.Item>
					</Command.Group>
				{/if}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

{#snippet SpecificIcon({ Icon }: { Icon: FacetedFilterOption['icon'] })}
	{@const ResolvedIcon = Icon}
	{#if ResolvedIcon}
		<ResolvedIcon data-icon="inline-start" />
	{/if}
{/snippet}
