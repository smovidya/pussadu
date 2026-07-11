<script lang="ts">
	import { page } from '$app/state';
	import { adminGetProjectInfo } from '$lib/rpc/project.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';
	import LogTable from '$stories/log/log-table.svelte';
	import Button from '$stories/shadcnui/button/button.svelte';
	import { FolderOpen, ExternalLink } from '@lucide/svelte';

	let projectId = $derived(page.params.projectId ?? '');
</script>

<PageWrapper pageTitle="ประวัติโครงการ" groupTitle="ประวัติการดำเนินการ" groupUrl="/admin/log">
	<div class="container mx-auto flex flex-col gap-4 py-10">
		<AsyncHttpBoundary dataLoader={adminGetProjectInfo({ id: projectId })}>
			{#snippet children(project)}
				<div class="flex flex-col gap-1">
					<div class="flex flex-wrap items-center gap-2">
						<h1 class="flex items-center gap-2 text-2xl font-bold">
							<FolderOpen class="size-6 text-muted-foreground" />
							ประวัติโครงการ: {project?.title ?? projectId}
						</h1>
						<Button variant="outline" size="sm" href={`/admin/projects/${projectId}`}>
							<ExternalLink class="size-3.5" />
							หน้าโครงการ
						</Button>
					</div>
					<p class="text-muted-foreground">
						ประวัติการดำเนินการทั้งหมดที่เกี่ยวข้องกับโครงการนี้
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">{projectId}</code>
					</p>
				</div>
			{/snippet}
		</AsyncHttpBoundary>

		<LogTable fixed={{ target: projectId }} hideColumns={['target']} />
	</div>
</PageWrapper>
