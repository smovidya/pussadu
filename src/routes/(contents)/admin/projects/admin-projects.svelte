<script lang="ts">
	import { getAllProjects } from '$lib/rpc/project.remote';
	import Button from '$stories/shadcnui/button/button.svelte';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import DataTable from './data-table.svelte';
	import { CirclePlus } from '@lucide/svelte';
</script>

<PageWrapper groupTitle="การจัดการโครงการ" pageTitle="รายการโครงการ" groupUrl="/admin/projects">
	<div class="flex flex-col gap-2">
		<h1 class="text-2xl font-bold">การจัดการโครงการ</h1>
		<p class="text-muted-foreground">จัดการโครงการต่าง ๆ ของสโมสรนิสิต</p>
		<Button variant="default" href="/admin/projects/new" class="w-fit">
			<CirclePlus />
			<span> เพิ่มโครงการใหม่ </span>
		</Button>
	</div>
	{#await getAllProjects()}
		<Skeleton class="h-40 w-full" />
	{:then _}
		<DataTable data={getAllProjects().current ?? []} />
	{/await}
</PageWrapper>
