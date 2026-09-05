<script lang="ts">
	import { assetTypeOptions } from '$lib/constants';
	import { Badge } from '$stories/shadcnui/badge';
	import { Button } from '$stories/shadcnui/button';
	import StatusBadge from '$stories/status-badge/status-badge.svelte';
	import * as Card from '$stories/shadcnui/card';
	import * as DropdownMenu from '$stories/shadcnui/dropdown-menu';
	import { cn } from '$stories/utils';
	import { Package, Tag, Info, KeyIcon, Ellipsis } from '@lucide/svelte';
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
	const assetType = assetTypeOptions.find((option) => option.value === asset.type);
	const availability = $derived(
		asset.needsInventoryReview
			? { label: 'รอตรวจยอด', tone: 'warning' as const }
			: asset.catalogState === 'paused'
				? { label: 'งดให้ยืม', tone: 'warning' as const }
				: asset.catalogState === 'retired'
					? { label: 'เลิกใช้งาน', tone: 'neutral' as const }
					: asset.availableAmount > 0
						? {
								label: `พร้อมยืม ${asset.availableAmount} ${asset.unitTerm}`,
								tone: 'success' as const
							}
						: { label: 'ไม่ว่างขณะนี้', tone: 'warning' as const }
	);
</script>

<Card.Root
	{...props}
	class={cn(
		'group relative flex h-full w-full cursor-pointer flex-col gap-0 overflow-hidden border py-0 shadow-sm transition-shadow duration-150 ease-out hover:shadow-lg focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none',
		!alwaysDisplay && asset.availableAmount <= 0 && 'opacity-60'
	)}
>
	<!-- Image Section -->
	<div class="relative h-40 w-full overflow-hidden">
		<img
			src={asset.image_url ?? '/placeholder/grey.png'}
			alt={asset.name}
			class="h-full w-full object-cover outline outline-1 -outline-offset-1 outline-border"
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
		<!-- Status Badge -->
		<StatusBadge tone={availability.tone} class="absolute top-3 right-3">
			{availability.label}
		</StatusBadge>
	</div>

	<!-- Content Section -->
	<Card.Content class="flex flex-1 flex-col p-4">
		<!-- Title and Category -->
		<div class="flex flex-row items-start justify-between">
			<div class="mb-2">
				<h3 class="text-lg leading-tight font-bold">{asset.name || '(ไม่มีชื่อ)'}</h3>
				<div class="mt-1 flex items-center text-xs text-muted-foreground">
					<Tag class="mr-1 size-3" />
					<span>{asset.category || '(ไม่มีหมวดหมู่)'}</span>
				</div>
			</div>
			{#if actionDropdownMenuContent}
				<div>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Button variant="ghost" size="icon" {...props}>
									<Ellipsis />
									<span class="sr-only"> เปิดเมนู </span>
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							{@render actionDropdownMenuContent({ asset, DropdownMenu })}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			{/if}
		</div>

		<!-- Description -->
		<p class="mb-4 flex-1 text-sm text-muted-foreground">
			{asset.description || '(ไม่มีคำอธิบาย)'}
		</p>

		<!-- Details -->
		<div class="flex flex-col gap-2 text-sm">
			<div class="flex items-center justify-between">
				<span class="flex items-center text-muted-foreground">
					<Package class="mr-2 size-4" />
					ประเภท
				</span>
				<Badge variant="outline">
					{#if assetType?.value === 'key'}
						<KeyIcon />
					{/if}
					{assetType?.label}</Badge
				>
			</div>
			<div class="flex items-center justify-between">
				<span class="flex items-center text-muted-foreground">
					<Info class="mr-2 size-4" />
					จำนวนที่มี
				</span>
				<span class="font-semibold tabular-nums"
					>{asset.availableAmount} / {asset.totalAmount} {asset.unitTerm}</span
				>
			</div>
		</div>
	</Card.Content>
</Card.Root>
