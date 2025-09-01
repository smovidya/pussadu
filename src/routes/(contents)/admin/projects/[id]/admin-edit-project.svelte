<script lang="ts">
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import { adminGetProjectInfo } from '$lib/rpc/project.remote';
	import Skeleton from '$stories/shadcnui/skeleton/skeleton.svelte';
	import EditProjectForm from './edit-project-form.svelte';
	import * as Alert from '$stories/shadcnui/alert';
	import { TriangleAlert } from '@lucide/svelte';
	import StaffList from './staff-list.svelte';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';

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
				<div class="p-2">
					<h1 class="text-2xl font-bold">{projectInfo.title}</h1>
					<p class="text-muted-foreground">แก้ไขรายละเอียดโครงการ</p>
				</div>
				<EditProjectForm projectData={projectInfo} />
				<StaffList projectId={id} />
			{:else}
				<Alert.Root class="border-destructive/50 text-destructive dark:border-destructive">
					<TriangleAlert class="h-4 w-4" />
					<Alert.Title>ไม่พบโครงการ</Alert.Title>
					<Alert.Description>
						ไม่สามารถหาโครงการที่มี ID: {id} ได้ โปรดตรวจสอบ URL หรือกลับไปที่หน้ารายการโครงการ
					</Alert.Description>
				</Alert.Root>
			{/if}
		{/snippet}

		{#snippet pending()}
			<div class="space-y-4">
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
