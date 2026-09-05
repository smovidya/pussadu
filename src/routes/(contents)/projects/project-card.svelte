<script lang="ts">
	import { resolve } from '$app/paths';
	import { projectStatusOptions } from '$lib/constants';
	import type { getAllMyProjects } from '$lib/rpc/project.remote';
	import { formatDate } from '$lib/utils/datetime';
	import { cn } from '$stories/utils';
	import StatusBadge from '$stories/status-badge/status-badge.svelte';

	interface Props {
		project: Awaited<ReturnType<typeof getAllMyProjects>>[number];
		class?: string;
	}

	let { project, class: _className }: Props = $props();

	const status = projectStatusOptions.find((option) => option.value === project.project?.status);
</script>

<a
	class={cn(
		'flex h-full flex-col gap-2 rounded-md border bg-card p-3 text-card-foreground underline-offset-2 transition-[background-color,box-shadow] duration-150 hover:bg-muted hover:shadow-sm motion-reduce:transition-none',
		_className
	)}
	href={resolve(`/projects/${project.project?.id}`)}
>
	{#if status}
		<StatusBadge tone={status.tone} Icon={status.icon}>{status.label}</StatusBadge>
	{/if}
	<h2 class="flex h-full flex-row items-start gap-2 text-xl leading-tight font-bold">
		<span>
			{project.project?.title}
		</span>
	</h2>
	<p class="text-sm text-muted-foreground">
		แก้ไขล่าสุด {formatDate(project.project?.updatedAt ?? undefined)}
	</p>
</a>
