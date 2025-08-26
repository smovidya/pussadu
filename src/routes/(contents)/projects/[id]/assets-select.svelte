<script lang="ts">
	import { projectStatusOptions } from '$lib/constants';
	import { listAssets } from '$lib/rpc/assets.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import Badge from '$stories/shadcnui/badge/badge.svelte';
	import Skeleton from '$stories/shadcnui/skeleton/skeleton.svelte';
	import AssetsCard from './assets-card.svelte';

	interface Props {
		project: {
			id: string;
			title: string;
			status: 'notstarted' | 'inprogress' | 'completed' | 'evaluated' | 'cancelled';
			owner: string;
		};
	}

	let { project }: Props = $props();
	const status = projectStatusOptions.find((option) => option.value === project.status);
</script>

<PageWrapper groupTitle="ยืมพัสดุ" groupUrl="/projects" pageTitle="ยืมพัสดุใหม่">
	<div class="sticky top-0 z-10 bg-background py-5">
		<span class="text-muted-foreground"> คุณกำลังยืมพัสดุสำหรับโครงการ </span>
		<h1 class="flex items-center gap-2 text-2xl font-bold">
			<span>
				{project.title}
			</span>

			<Badge class={status?.color}>{status?.label}</Badge>
		</h1>
	</div>
	{#await listAssets()}
		<div class="flex flex-wrap gap-2">
			<Skeleton class="h-20 w-3/4" />
			<Skeleton class="h-20 w-3/4" />
			<Skeleton class="h-20 w-3/4" />
			<Skeleton class="h-20 w-3/4" />
			<Skeleton class="h-20 w-3/4" />
		</div>
	{:then assets}
		<div class="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each assets as asset}
				<AssetsCard {asset} />
			{/each}
		</div>
	{/await}
</PageWrapper>
