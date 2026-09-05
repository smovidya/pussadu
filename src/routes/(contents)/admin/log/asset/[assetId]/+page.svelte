<script lang="ts">
	import { page } from '$app/state';
	import { getAssetInfo } from '$lib/rpc/assets.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';
	import LogTable from '$stories/log/log-table.svelte';
	import PageHeader from '$stories/page-header/page-header.svelte';

	let assetId = $derived(page.params.assetId ?? '');
</script>

<PageWrapper pageTitle="ประวัติพัสดุ" groupTitle="ประวัติการดำเนินการ" groupUrl="/admin/log">
	<div class="flex flex-col gap-6">
		<AsyncHttpBoundary dataLoader={getAssetInfo({ assetId })}>
			{#snippet children(asset)}
				<PageHeader
					title={`ประวัติพัสดุ: ${asset?.name ?? assetId}`}
					description="ประวัติการดำเนินการทั้งหมดที่เกี่ยวข้องกับพัสดุนี้"
				/>
			{/snippet}
		</AsyncHttpBoundary>

		<LogTable fixed={{ target: assetId }} hideColumns={['target']} />
	</div>
</PageWrapper>
