<script lang="ts">
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import AssetsBookingList from '$stories/assets/assets-booking-list.svelte';
	import { listAssets } from '$lib/rpc/assets.remote';
	import AssetsFilters from '$stories/assets/assets-filters.svelte';
	import type { assetTypeOptions } from '$lib/constants';
	import AssetsNewButton from '$stories/assets/asset-new-button.svelte';
	import { authClient } from '$lib/auth-client';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';

	const auth = authClient.useSession();

	let assetFilters = $state({
		search: '',
		selectedType: [] as (typeof assetTypeOptions)[number]['value'][]
	});

	const listAssetsLoader = listAssets({});
</script>

<PageWrapper groupTitle="ยืมพัสดุ" pageTitle="รายการพัสดุ" groupUrl="/projects">
	<header class="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold">รายการพัสดุ</h1>
			<p>รายการพัสดุที่สามารถยืมได้</p>
		</div>
		{#if $auth.data?.user.role?.split(',').includes('admin')}
			<AssetsNewButton />
		{/if}
	</header>

	<AsyncHttpBoundary dataLoader={listAssetsLoader}>
		{#snippet children(assets)}
			<section>
				<AssetsFilters
					bind:searchTerm={assetFilters.search}
					bind:selectedTypes={assetFilters.selectedType}
				/>
			</section>

			<AssetsBookingList
				{assets}
				bind:search={assetFilters.search}
				bind:selectedTypes={assetFilters.selectedType}
			/>
		{/snippet}
	</AsyncHttpBoundary>
</PageWrapper>
