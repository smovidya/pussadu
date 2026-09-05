<script lang="ts">
	import { getAllProjects } from '$lib/rpc/project.remote';
	import { Button } from '$stories/shadcnui/button';
	import PageHeader from '$stories/page-header/page-header.svelte';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import DataTable from './data-table.svelte';
	import { CirclePlus } from '@lucide/svelte';

	const getAllProjectsQuery = getAllProjects();
</script>

<PageWrapper groupTitle="การจัดการโครงการ" pageTitle="รายการโครงการ" groupUrl="/admin/projects">
	<PageHeader title="การจัดการโครงการ" description="จัดการโครงการต่าง ๆ ของสโมสรนิสิต">
		{#snippet actions()}
			<Button href="/admin/projects/new">
				<CirclePlus data-icon="inline-start" />
				เพิ่มโครงการใหม่
			</Button>
		{/snippet}
	</PageHeader>
	{#await getAllProjectsQuery}
		<Skeleton class="h-40 w-full" />
	{:then _}
		<DataTable {getAllProjectsQuery} />
	{/await}
</PageWrapper>
