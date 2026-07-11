<script lang="ts">
	import { page } from '$app/state';
	import { getAssetInfo } from '$lib/rpc/assets.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';
	import LogTable from '$stories/log/log-table.svelte';
	import { Package } from '@lucide/svelte';

	let assetId = $derived(page.params.assetId ?? '');
</script>

<PageWrapper pageTitle="ประวัติพัสดุ" groupTitle="ประวัติการดำเนินการ" groupUrl="/admin/log">
	<div class="container mx-auto flex flex-col gap-4 py-10">
		<AsyncHttpBoundary dataLoader={getAssetInfo({ assetId })}>
			{#snippet children(asset)}
				<div class="flex flex-col gap-1">
					<h1 class="flex items-center gap-2 text-2xl font-bold">
						<Package class="size-6 text-muted-foreground" />
						ประวัติพัสดุ: {asset?.name ?? assetId}
					</h1>
					<p class="text-muted-foreground">
						ประวัติการดำเนินการทั้งหมดที่เกี่ยวข้องกับพัสดุนี้
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">{assetId}</code>
					</p>
				</div>
			{/snippet}
		</AsyncHttpBoundary>

		<LogTable fixed={{ target: assetId }} hideColumns={['target']} />
	</div>
</PageWrapper>
