<script lang="ts">
	import { assetStatusOptions } from '$lib/constants';
	import Badge from '$stories/shadcnui/badge/badge.svelte';
	import Button from '$stories/shadcnui/button/button.svelte';
	import * as DropdownMenu from '$stories/shadcnui/dropdown-menu';
	import { cn } from '$stories/utils';
	import { Ellipsis } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	interface AssetProps {
		id: string;
		name: string;
		description: string | null;
		type: 'normal' | 'durable' | 'key';
		status: 'available' | 'borrowed' | 'reserved' | 'maintenance' | 'lost' | 'damaged';
		amount: number;
		unitTerm: string;
		image_url: string | null;
		category: string;
	}

	interface Props {
		asset: AssetProps;
		props?: Record<string, unknown>;
		alwaysDisplay?: boolean;
		actionDropdownMenuContent?: Snippet<
			[
				{
					asset: AssetProps;
					DropdownMenu: typeof DropdownMenu;
				}
			]
		>;
	}

	let { asset, props, alwaysDisplay, actionDropdownMenuContent }: Props = $props();
	const assetStatus = assetStatusOptions.find((option) => option.value === asset.status);
</script>

<div
	{...props}
	class={cn(
		'group relative mb-3 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-lg',
		!alwaysDisplay && asset.amount <= 0 && 'pointer-events-none opacity-50',
		!alwaysDisplay && asset.status === 'maintenance' && 'opacity-75',
		!alwaysDisplay && asset.status === 'lost' && 'pointer-events-none opacity-50',
		!alwaysDisplay && asset.status === 'damaged' && 'pointer-events-none opacity-50'
	)}
>
	<img
		src={asset.image_url ?? '/placeholder/grey.png'}
		alt={asset.name}
		class="block h-auto w-full object-cover"
		loading="lazy"
	/>

	<Badge class={cn('absolute top-2 right-2 text-xs font-semibold', assetStatus?.color)}>
		{assetStatus?.label}
	</Badge>

	{#if actionDropdownMenuContent}
		<div class="absolute top-2 left-2 opacity-0 transition-opacity group-hover:opacity-100">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button variant="secondary" size="icon" class="size-7 shadow" {...props}>
							<Ellipsis class="size-4" />
							<span class="sr-only">เปิดเมนู</span>
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					{@render actionDropdownMenuContent({ asset, DropdownMenu })}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	{/if}

	<!-- Hover overlay: name/category/description -->
	<div
		class="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/10 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
	>
		<h3 class="text-sm font-bold text-white">{asset.name || '(ไม่มีชื่อ)'}</h3>
		<p class="text-xs text-white/80">{asset.category || '(ไม่มีหมวดหมู่)'}</p>
		{#if asset.description}
			<p class="mt-1 line-clamp-2 text-xs text-white/70">{asset.description}</p>
		{/if}
	</div>

	<!-- Count badge, always visible, bottom-right -->
	<div
		class="absolute right-2 bottom-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm"
	>
		{asset.amount}
		{asset.unitTerm}
	</div>
</div>
