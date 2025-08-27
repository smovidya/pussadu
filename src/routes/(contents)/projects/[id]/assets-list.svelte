<script lang="ts">
	import AssetsCard from './assets-card.svelte';
	import Fuse from 'fuse.js';

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
		project: {
			id: string;
			title: string;
			status: 'notstarted' | 'inprogress' | 'completed' | 'evaluated' | 'cancelled';
			owner: string;
		};
		search: string;
	}

	let { assets, project, search = $bindable() }: Props = $props();

	const fuse = new Fuse(assets, {
		keys: ['name', 'description', 'category'],
		threshold: 0.3
	});

	const filteredAssets = $derived(
		search ? fuse.search(search).map((result) => result.item) : assets
	);
</script>

{search}
<div class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
	{#each filteredAssets as asset}
		<AssetsCard {asset} {project} />
	{/each}
</div>
