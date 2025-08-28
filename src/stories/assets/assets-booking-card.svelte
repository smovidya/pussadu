<script lang="ts">
	import AssetsBookingDialog from './assets-booking-dialog.svelte';
	import AssetsCard from './assets-card.svelte';

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
		project: {
			id: string;
			title: string;
			status: 'notstarted' | 'inprogress' | 'completed' | 'evaluated' | 'cancelled';
			owner: string;
		};
	}

	let { asset, project }: Props = $props();
</script>
