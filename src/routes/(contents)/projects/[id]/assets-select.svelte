<script lang="ts">
	import { projectStatusOptions } from '$lib/constants';
	import { listAssets } from '$lib/rpc/assets.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import Badge from '$stories/shadcnui/badge/badge.svelte';
	import Skeleton from '$stories/shadcnui/skeleton/skeleton.svelte';
	import AssetsList from './assets-list.svelte';
	import ConsentContent from './consent-content.svelte';
	import * as Card from '$stories/shadcnui/card';
	import { Input } from '$stories/shadcnui/input';

	interface Props {
		project: {
			id: string;
			title: string;
			status: 'notstarted' | 'inprogress' | 'completed' | 'evaluated' | 'cancelled';
			owner: string;
		};
	}

	let { project }: Props = $props();
	let assetFilters = {
		search: ''
	};
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
		<Card.Root>
			<Card.Header>
				<Card.Title>ค้นหา</Card.Title>
			</Card.Header>
			<Card.Content>
				<Input placeholder="ค้นหาพัสดุ" bind:value={assetFilters.search} />
			</Card.Content>
		</Card.Root>
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
			<AssetsList {assets} {project} search={assetFilters.search} />
		{/await}
	</article>
</PageWrapper>
