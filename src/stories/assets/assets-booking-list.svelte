<script lang="ts">
	import type { assetTypeOptions } from '$lib/constants';
	import AssetsBookingDialog from './asset-booking-dialog.svelte';
	import AssetsCard from './asset-card.svelte';
	import Fuse from 'fuse.js';
	import AssetsDetailsDialog from './asset-details-dialog.svelte';
	import { hasPerm } from '$lib/auth-client';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import { listAssets, removeAsset } from '$lib/rpc/assets.remote';
	import { toast } from 'svelte-sonner';
	interface Props {
		assets: {
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
			owner:
				| 'president'
				| 'vice1'
				| 'vice2'
				| 'secretary'
				| 'treasurer'
				| 'student_relation'
				| 'arts'
				| 'academic'
				| 'sport'
				| 'social_development'
				| 'korkor_club'
				| 'sciren_club'
				| 'vata_club'
				| 'education_club'
				| 'anurak_club'
				| 'asa_club'
				| 'etc';
			categoryId: string | null;
			id: string;
		}[];
		project?: {
			id: string;
			title: string;
			status: 'notstarted' | 'inprogress' | 'completed' | 'evaluated' | 'cancelled';
			owner: string;
		};
		search?: string;
		selectedTypes?: (typeof assetTypeOptions)[number]['value'][];
		listAssetsQuery?: ReturnType<typeof listAssets>;
	}

	const {
		assets = $bindable(),
		project,
		search = $bindable(),
		selectedTypes = $bindable(),
		listAssetsQuery
	}: Props = $props();

	const fuse = new Fuse(assets, {
		keys: ['name', 'description', 'category'],
		threshold: 0.3
	});

	const filteredAssets = $derived(
		// Search term
		(search ? fuse.search(search).map((result) => result.item) : assets)
			// Filter by asset type
			.filter(
				(v) => selectedTypes && (selectedTypes.length === 0 || selectedTypes.includes(v.type))
			)
			// Move zero-amount assets to the end
			.toSorted((a, b) => (a.amount === 0 ? 1 : b.amount === 0 ? -1 : 0))
	);

	async function onRemoveAsset(assetId: string) {
		try {
			await removeAsset({
				assetId
			});
			toast.success('ลบพัสดุเรียบร้อยแล้ว');
			await listAssetsQuery?.refresh();
		} catch (error) {
			console.error('Error removing asset:', error);
			toast.error('เกิดข้อผิดพลาดในการลบพัสดุ');
		}
	}
</script>

{#await Promise.all([hasPerm({ permission: { asset: ['update'] } })])}
	<Skeleton class="h-56 w-full" />
{:then [canEdit]}
	<div class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each filteredAssets as asset (asset.id)}
			{#if project}
				<AssetsBookingDialog {asset} {project}>
					{#snippet trigger({ props })}
						<AssetsCard {asset} {props}></AssetsCard>
					{/snippet}
				</AssetsBookingDialog>
			{:else}
				<AssetsDetailsDialog
					{listAssetsQuery}
					mode={canEdit.data?.success ? 'edit' : 'view'}
					{asset}
				>
					{#snippet trigger({ props })}
						<AssetsCard alwaysDisplay={true} {asset} {props}>
							{#snippet actionDropdownMenuContent({ DropdownMenu })}
								<DropdownMenu.Group>
									<DropdownMenu.Label>เมนูผู้ดูแล</DropdownMenu.Label>
									<DropdownMenu.Separator />
									<DropdownMenu.Item variant="destructive" onclick={() => onRemoveAsset(asset.id)}
										>ลบพัสดุนี้</DropdownMenu.Item
									>
								</DropdownMenu.Group>
							{/snippet}
						</AssetsCard>
					{/snippet}
				</AssetsDetailsDialog>
			{/if}
		{:else}
			<div class="col-span-full">
				<p class="text-center text-muted-foreground">ไม่พบพัสดุที่ตรงกับเงื่อนไขการค้นหา :(</p>
			</div>
		{/each}
	</div>
{/await}
