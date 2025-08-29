<script lang="ts">
	import { projectStatusOptions } from '$lib/constants';
	import type { getAllMyProjects } from '$lib/rpc/project.remote';
	import { formatDate } from '$lib/utils/datetime';
	import { cn } from '$stories/utils';

	interface Props {
		project: Awaited<ReturnType<typeof getAllMyProjects>>[number];
		class?: string;
	}

	let { project, class: _className }: Props = $props();

	const status = projectStatusOptions.find((option) => option.value === project.project?.status);
</script>

<a
	class={cn(
		'flex h-full flex-col gap-2 rounded-md border p-3 underline-offset-2 transition duration-100 hover:bg-muted hover:shadow',
		status?.color
	)}
	href="/projects/{project.project?.id}"
>
	{#if status}
		<div class="flex flex-row items-center gap-2">
			<status.icon class="size-5" />
			<span class="text-sm">{status?.label}</span>
		</div>
	{/if}
	<h2 class="flex h-full flex-row items-start gap-2 text-xl leading-tight font-bold">
		<span>
			{project.project?.title}
		</span>
	</h2>
	<p class="text-sm text-muted-foreground">แก้ไขล่าสุด {formatDate(project.project?.updatedAt)}</p>
</a>
