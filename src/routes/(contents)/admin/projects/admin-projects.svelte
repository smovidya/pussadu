<script lang="ts">
	import { getAllProjects } from '$lib/rpc/project.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import DataTable from './data-table.svelte';
</script>

<PageWrapper groupTitle="การจัดการโครงการ" pageTitle="รายการโครงการ" groupUrl="/admin/projects">
	<h1 class="text-2xl font-bold">การจัดการโครงการ</h1>
	<p class="text-muted-foreground">จัดการโครงการต่าง ๆ ของสโมสรนิสิต</p>
	{#await getAllProjects()}
		<Skeleton class="h-40 w-full" />
	{:then _}
		<DataTable data={getAllProjects().current ?? []} />
	{/await}
</PageWrapper>
