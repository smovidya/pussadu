<script lang="ts">
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import { adminGetProjectInfo } from '$lib/rpc/project.remote';
	import Skeleton from '$stories/shadcnui/skeleton/skeleton.svelte';
	import EditProjectForm from './edit-project-form.svelte';
	import * as Alert from '$stories/shadcnui/alert';
	import Button from '$stories/shadcnui/button/button.svelte';
	import { ScrollText, TriangleAlert } from '@lucide/svelte';
	import StaffList from './staff-list.svelte';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';
	import PageHeader from '$stories/page-header/page-header.svelte';

	let {
		id
	}: {
		id: string;
	} = $props();
</script>

<PageWrapper groupTitle="การจัดการโครงการ" pageTitle="แก้ไขโครงการ" groupUrl="/admin/projects">
	<AsyncHttpBoundary dataLoader={adminGetProjectInfo({ id })}>
		{#snippet children(projectInfo)}
			{#if projectInfo}
				{#snippet actions()}
					<Button variant="outline" size="sm" href={`/admin/log/project/${id}`}>
						<ScrollText data-icon="inline-start" />
						ประวัติ
					</Button>
				{/snippet}
				<PageHeader title={projectInfo.title} description="แก้ไขรายละเอียดโครงการ" {actions} />
				<EditProjectForm projectData={projectInfo} />
				<StaffList projectId={id} />
			{:else}
				<Alert.Root variant="destructive">
					<TriangleAlert class="h-4 w-4" />
					<Alert.Title>ไม่พบโครงการ</Alert.Title>
					<Alert.Description>
						ไม่สามารถหาโครงการที่มี ID: {id} ได้ โปรดตรวจสอบ URL หรือกลับไปที่หน้ารายการโครงการ
					</Alert.Description>
				</Alert.Root>
			{/if}
		{/snippet}

		{#snippet pending()}
			<div class="flex flex-col gap-4">
				<Skeleton class="h-8 w-1/3" />
				<Skeleton class="h-20 w-full" />
				<Skeleton class="h-12 w-1/4" />
				<Skeleton class="h-12 w-1/4" />
				<Skeleton class="h-12 w-1/4" />
				<Skeleton class="h-12 w-1/4" />
			</div>
		{/snippet}
	</AsyncHttpBoundary>
</PageWrapper>
