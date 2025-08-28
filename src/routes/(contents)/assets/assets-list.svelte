<script lang="ts">
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import AssetsBookingList from '$stories/assets/assets-booking-list.svelte';
	import { listAssets } from '$lib/rpc/assets.remote';
</script>

<PageWrapper groupTitle="ยืมพัสดุ" pageTitle="รายการพัสดุ" groupUrl="/projects">
	<div>
		<h1 class="text-2xl font-bold">รายการพัสดุ</h1>
		<p>รายการพัสดุที่สามารถยืมได้</p>
	</div>

	{#await listAssets({}) then assets}
		<AssetsBookingList {assets} />
	{/await}
</PageWrapper>
