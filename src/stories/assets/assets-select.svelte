<script lang="ts">
	import { assetTypeOptions, projectStatusOptions } from '$lib/constants';
	import { listAssets } from '$lib/rpc/assets.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import Badge from '$stories/shadcnui/badge/badge.svelte';
	import Skeleton from '$stories/shadcnui/skeleton/skeleton.svelte';
	import AssetsList from './assets-booking-list.svelte';
	import ConsentContent from './asset-consent-content.svelte';
	import AssetsFilters from './assets-filters.svelte';

	interface Props {
		project: {
			id: string;
			title: string;
			status: 'notstarted' | 'inprogress' | 'completed' | 'evaluated' | 'cancelled';
			owner: string;
		};
	}

	let { project }: Props = $props();
	let assetFilters = $state({
		search: '',
		selectedTypes: [] as (typeof assetTypeOptions)[number]['value'][]
	});
	const status = projectStatusOptions.find((option) => option.value === project.status);
</script>

<PageWrapper groupTitle="ยืมพัสดุ" groupUrl="/projects" pageTitle="ยืมพัสดุใหม่">
	<header class="sticky top-0 z-10 bg-background py-5">
		<span class="text-muted-foreground"> คุณกำลังยืมพัสดุสำหรับโครงการ </span>
		<h1 class="flex items-center gap-2 text-2xl font-bold">
			<span>
				{project.title}
			</span>

			<Badge class={status?.color}>{status?.label}</Badge>
		</h1>
	</header>
	<section>
		<ConsentContent />
	</section>
	<section>
		<AssetsFilters
			bind:searchTerm={assetFilters.search}
			bind:selectedTypes={assetFilters.selectedTypes}
		/>
	</section>

	<article>
		{#await listAssets({ projectId: project.id })}
			<div class="flex flex-wrap gap-2">
				<Skeleton class="h-20 w-3/4" />
				<Skeleton class="h-20 w-3/4" />
				<Skeleton class="h-20 w-3/4" />
				<Skeleton class="h-20 w-3/4" />
				<Skeleton class="h-20 w-3/4" />
			</div>
		{:then assets}
			<AssetsList
				{assets}
				{project}
				search={assetFilters.search}
				selectedTypes={assetFilters.selectedTypes}
			/>
		{/await}
	</article>
</PageWrapper>
