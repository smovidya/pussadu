<script lang="ts">
	import { assetStatusOptions, assetTypeOptions } from '$lib/constants';
	import Badge from '$stories/shadcnui/badge/badge.svelte';
	import * as Card from '$stories/shadcnui/card';
	import { cn } from '$stories/utils';
	import { Package, Tag, Info, KeyIcon } from '@lucide/svelte';

	interface Props {
		asset: {
			name: string;
			description: string | null;
			type: 'normal' | 'durable' | 'key';
			status: 'available' | 'borrowed' | 'reserved' | 'maintenance' | 'lost' | 'damaged';
			amount: number;
			unitTerm: string;
			image_url: string | null;
			category: string;
		};
		props?: Record<string, unknown>;
		alwaysDisplay?: boolean;
	}

	let { asset, props, alwaysDisplay }: Props = $props();
	const assetType = assetTypeOptions.find((option) => option.value === asset.type);
	const assetStatus = assetStatusOptions.find((option) => option.value === asset.status);
</script>

<Card.Root
	{...props}
	class={cn(
		'group relative flex h-full w-full cursor-pointer flex-col gap-0 overflow-hidden border py-0 shadow-sm transition-all hover:shadow-lg',
		!alwaysDisplay && asset.amount <= 0 && 'pointer-events-none opacity-50',
		!alwaysDisplay && asset.status === 'maintenance' && 'opacity-75',
		!alwaysDisplay && asset.status === 'lost' && 'pointer-events-none opacity-50',
		!alwaysDisplay && asset.status === 'damaged' && 'pointer-events-none opacity-50'
	)}
>
	<!-- Image Section -->
	<div class="relative h-40 w-full overflow-hidden">
		<img
			src={asset.image_url ?? '/placeholder/grey.png'}
			alt={asset.name}
			class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
		<!-- Status Badge -->
		<Badge class={cn('absolute top-3 right-3 text-xs font-semibold', assetStatus?.color)}>
			{assetStatus?.label}
		</Badge>
	</div>

	<!-- Content Section -->
	<Card.Content class="flex flex-1 flex-col p-4">
		<!-- Title and Category -->
		<div class="mb-2">
			<h3 class="text-lg leading-tight font-bold">{asset.name}</h3>
			<div class="mt-1 flex items-center text-xs text-muted-foreground">
				<Tag class="mr-1 size-3" />
				<span>{asset.category || 'ไม่มีหมวดหมู่'}</span>
			</div>
		</div>

		<!-- Description -->
		<p class="mb-4 flex-1 text-sm text-muted-foreground">
			{asset.description || 'ไม่มีคำอธิบาย'}
		</p>

		<!-- Details -->
		<div class="space-y-2 text-sm">
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
				<span class="font-semibold">{asset.amount} {asset.unitTerm}</span>
			</div>
		</div>
	</Card.Content>
</Card.Root>
