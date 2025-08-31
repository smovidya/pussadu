<script lang="ts">
	import type { assetTypeOptions } from '$lib/constants';
	import AssetsBookingDialog from './assets-booking-dialog.svelte';
	import AssetsCard from './assets-card.svelte';
	import Fuse from 'fuse.js';
	import AssetsDetailsDialog from './assets-details-dialog.svelte';

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
	}

	const { assets, project, search = $bindable(), selectedTypes = $bindable() }: Props = $props();

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
</script>

<div class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
	{#each filteredAssets as asset (asset.id)}
		{#if project}
			<AssetsBookingDialog {asset} {project}>
				{#snippet trigger({ props })}
					<AssetsCard {asset} {props}></AssetsCard>
				{/snippet}
			</AssetsBookingDialog>
		{:else}
			<AssetsDetailsDialog {asset}>
				{#snippet trigger({ props })}
					<AssetsCard alwaysDisplay={true} {asset} {props}></AssetsCard>
				{/snippet}
			</AssetsDetailsDialog>
		{/if}
	{:else}
		<div class="col-span-full">
			<p class="text-center text-muted-foreground">ไม่พบพัสดุที่ตรงกับเงื่อนไขการค้นหา :(</p>
		</div>
	{/each}
</div>
