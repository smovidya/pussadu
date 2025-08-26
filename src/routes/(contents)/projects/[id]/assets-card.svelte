<script lang="ts">
	import { assetStatusOptions, assetTypeOptions } from '$lib/constants';
	import Badge from '$stories/shadcnui/badge/badge.svelte';
	import Button from '$stories/shadcnui/button/button.svelte';
	import * as Card from '$stories/shadcnui/card';
	import { Input } from '$stories/shadcnui/input';
	import Label from '$stories/shadcnui/label/label.svelte';
	import { cn } from '$stories/utils';
	import { ShoppingCart, Package, Tag, Info } from '@lucide/svelte';

	interface Props {
		asset: {
			createdAt: Date | null;
			updatedAt: Date | null;
			deletedAt: Date | null;
			name: string;
			description: string | null;
			type: 'normal' | 'durable' | 'key';
			status: 'available' | 'borrowed' | 'reserved' | 'maintenance' | 'lost' | 'damaged';
			amount: number;
			unitTerm: string;
			image_url: string | null;
			category: string;
			owner: string;
			categoryId: string | null;
			id: string;
		};
	}

	let { asset }: Props = $props();
	const assetType = assetTypeOptions.find((option) => option.value === asset.type);
	const assetStatus = assetStatusOptions.find((option) => option.value === asset.status);
</script>

<Card.Root
	class="group relative flex h-full w-full flex-col overflow-hidden border py-0 shadow-sm transition-all hover:shadow-lg"
>
	<!-- Image Section -->
	<div class="relative h-48 w-full overflow-hidden">
		<img
			src={asset.image_url ?? '/placeholder-image.png'}
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
				<Tag class="mr-1 h-3 w-3" />
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
					<Package class="mr-2 h-4 w-4" />
					ประเภท
				</span>
				<Badge variant="outline">{assetType?.label}</Badge>
			</div>
			<div class="flex items-center justify-between">
				<span class="flex items-center text-muted-foreground">
					<Info class="mr-2 h-4 w-4" />
					จำนวนที่มี
				</span>
				<span class="font-semibold">{asset.amount} {asset.unitTerm}</span>
			</div>
		</div>
	</Card.Content>

	<!-- Footer Section -->
	<Card.Footer class="border-t p-4">
		<Button class="w-full">
			<ShoppingCart class="mr-2" />
			ยืม
		</Button>
	</Card.Footer>
</Card.Root>
