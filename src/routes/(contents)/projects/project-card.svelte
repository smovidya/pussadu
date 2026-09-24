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
	const statusColors = {
		neutral: 'bg-stone-50 text-stone-600 dark:bg-neutral/5 dark:hover:bg-neutral/10',
		warning: 'bg-yellow-50 text-yellow-600 dark:bg-warning/10 dark:hover:bg-warning/15',
		success: 'bg-green-50 text-green-600 dark:bg-success/10 dark:hover:bg-success/15',
		info: 'bg-blue-50 text-blue-600 dark:bg-info/10 dark:hover:bg-info/15',
		destructive: 'bg-red-50 text-red-600 dark:bg-destructive/10 dark:hover:bg-destructive/15'
	};
</script>

<a
	class={cn(
		'flex h-full flex-col gap-2 rounded-md border bg-card p-3 text-card-foreground underline-offset-2 transition-[background-color,box-shadow] duration-150 hover:bg-muted hover:shadow-sm motion-reduce:transition-none',
		status && statusColors[status.tone],
		'dark:text-card-foreground',
		_className
	)}
	href={resolve(`/projects/${project.project?.id}`)}
>
	<div class="flex flex-wrap gap-2">
		{#if status}
			<div class="flex flex-row items-center gap-2 dark:hidden">
				<status.icon class="size-5" aria-hidden="true" />
				<span class="text-sm">{status.label}</span>
			</div>
			<StatusBadge class="hidden dark:inline-flex" tone={status.tone} Icon={status.icon}
				>{status.label}</StatusBadge
			>
		{/if}
		{#if project.role === 'coordinator'}<StatusBadge tone="info">ผู้ประสานงาน</StatusBadge>{/if}
	</div>
	<h2 class="flex h-full flex-row items-start gap-2 text-xl leading-tight font-bold">
		<span>
			{project.project?.title}
		</span>
	</h2>
	<p class="text-sm text-muted-foreground">
		แก้ไขล่าสุด {formatDate(project.project?.updatedAt ?? undefined)}
	</p>
</a>
