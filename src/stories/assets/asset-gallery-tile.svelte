<script lang="ts">
	import { Button } from '$stories/shadcnui/button';
	import StatusBadge from '$stories/status-badge/status-badge.svelte';
	import * as DropdownMenu from '$stories/shadcnui/dropdown-menu';
	import { cn } from '$stories/utils';
	import { Ellipsis } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import type { AssetView } from './types';

	interface Props {
		asset: AssetView;
		props?: Record<string, unknown>;
		alwaysDisplay?: boolean;
		actionDropdownMenuContent?: Snippet<
			[
				{
					asset: AssetView;
					DropdownMenu: typeof DropdownMenu;
				}
			]
		>;
	}

	let { asset, props, alwaysDisplay, actionDropdownMenuContent }: Props = $props();
	const availability = $derived(
		asset.needsInventoryReview || asset.catalogState !== 'active'
			? { label: asset.needsInventoryReview ? 'รอตรวจยอด' : 'งดให้ยืม', tone: 'warning' as const }
			: asset.availableAmount > 0
				? { label: `พร้อมยืม ${asset.availableAmount}`, tone: 'success' as const }
				: { label: 'ไม่ว่าง', tone: 'warning' as const }
	);
</script>

<div
	{...props}
	class={cn(
		'group relative mb-3 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-xl shadow-sm transition-shadow duration-150 ease-out hover:shadow-lg focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none',
		!alwaysDisplay && asset.availableAmount <= 0 && 'opacity-60'
	)}
>
	<img
		src={asset.image_url ?? '/placeholder/grey.png'}
		alt={asset.name}
		class="block h-auto w-full object-cover outline outline-1 -outline-offset-1 outline-border"
		loading="lazy"
	/>

	<StatusBadge tone={availability.tone} class="absolute top-2 right-2">
		{availability.label}
	</StatusBadge>

	{#if actionDropdownMenuContent}
		<div
			class="absolute top-2 left-2 opacity-100 transition-opacity duration-150 ease-out motion-reduce:transition-none sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
		>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button variant="secondary" size="icon" {...props} aria-label="เปิดเมนู">
							<Ellipsis />
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
		class="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/10 to-transparent p-3 opacity-100 transition-opacity duration-150 ease-out motion-reduce:transition-none sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
	>
		<h3 class="text-sm font-bold text-white">{asset.name || '(ไม่มีชื่อ)'}</h3>
		<p class="text-xs text-white/80">{asset.category || '(ไม่มีหมวดหมู่)'}</p>
		{#if asset.description}
			<p class="mt-1 line-clamp-2 text-xs text-white/70">{asset.description}</p>
		{/if}
	</div>

	<!-- Count badge, always visible, bottom-right -->
	<div
		class="absolute right-2 bottom-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white tabular-nums backdrop-blur-sm"
	>
		{asset.availableAmount}/{asset.totalAmount}
		{asset.unitTerm}
	</div>
</div>
