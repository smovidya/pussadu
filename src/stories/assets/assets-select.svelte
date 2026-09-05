<script lang="ts">
	import { assetTypeOptions, projectStatusOptions } from '$lib/constants';
	import { listAssets } from '$lib/rpc/assets.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import StatusBadge from '$stories/status-badge/status-badge.svelte';
	import PageHeader from '$stories/page-header/page-header.svelte';
	import Skeleton from '$stories/shadcnui/skeleton/skeleton.svelte';
	import AssetsList from './assets-booking-list.svelte';
	import ConsentContent from './asset-consent-content.svelte';
	import AssetsFilters from './assets-filters.svelte';
	import ProjectMembers from '$stories/projects/project-members.svelte';
	import ProjectBorrowingSummary from '$stories/projects/project-borrowing-summary.svelte';

	interface Props {
		project: {
			id: string;
			title: string;
			status: 'notstarted' | 'inprogress' | 'completed' | 'evaluated' | 'cancelled';
			owner: string;
		};
		membershipRole?: 'member' | 'coordinator';
	}

	let { project = $bindable(), membershipRole = 'member' }: Props = $props();

	const listAssetsQuery = listAssets({ projectId: project.id });
	let assetFilters = $state({
		search: '',
		selectedTypes: [] as (typeof assetTypeOptions)[number]['value'][]
	});
	const status = projectStatusOptions.find((option) => option.value === project.status);
</script>

<PageWrapper groupTitle="ยืมพัสดุ" groupUrl="/projects" pageTitle="ยืมพัสดุใหม่">
	<PageHeader title={project.title} description="คุณกำลังยืมพัสดุสำหรับโครงการนี้">
		{#snippet actions()}
			{#if status}<StatusBadge tone={status.tone} Icon={status.icon}>{status.label}</StatusBadge
				>{/if}
		{/snippet}
	</PageHeader>
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
		{#await listAssetsQuery}
			<div class="flex flex-wrap gap-2">
				<Skeleton class="h-20 w-3/4" />
				<Skeleton class="h-20 w-3/4" />
				<Skeleton class="h-20 w-3/4" />
				<Skeleton class="h-20 w-3/4" />
				<Skeleton class="h-20 w-3/4" />
			</div>
		{:then assets}
			<AssetsList
				{listAssetsQuery}
				{assets}
				{project}
				search={assetFilters.search}
				selectedTypes={assetFilters.selectedTypes}
			/>
		{/await}
	</article>
	{#if membershipRole === 'coordinator'}<ProjectBorrowingSummary projectId={project.id} />{/if}
	<ProjectMembers projectId={project.id} canManage={membershipRole === 'coordinator'} />
</PageWrapper>
