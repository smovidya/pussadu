<script lang="ts">
	import { page } from '$app/state';
	import { adminGetProjectInfo } from '$lib/rpc/project.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';
	import LogTable from '$stories/log/log-table.svelte';
	import { Button } from '$stories/shadcnui/button';
	import PageHeader from '$stories/page-header/page-header.svelte';
	import { ExternalLink } from '@lucide/svelte';

	let projectId = $derived(page.params.projectId ?? '');
</script>

<PageWrapper pageTitle="ประวัติโครงการ" groupTitle="ประวัติการดำเนินการ" groupUrl="/admin/log">
	<div class="flex flex-col gap-6">
		<AsyncHttpBoundary dataLoader={adminGetProjectInfo({ id: projectId })}>
			{#snippet children(project)}
				{#snippet actions()}
					<Button variant="outline" size="sm" href={`/admin/projects/${projectId}`}>
						<ExternalLink data-icon="inline-start" />
						หน้าโครงการ
					</Button>
				{/snippet}
				<PageHeader
					title={`ประวัติโครงการ: ${project?.title ?? projectId}`}
					description="ประวัติการดำเนินการทั้งหมดที่เกี่ยวข้องกับโครงการนี้"
					{actions}
				/>
			{/snippet}
		</AsyncHttpBoundary>

		<LogTable fixed={{ target: projectId }} hideColumns={['target']} />
	</div>
</PageWrapper>
