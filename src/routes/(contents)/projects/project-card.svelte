<script lang="ts">
	import { projectStatusOptions } from '$lib/constants';
	import type { getAllMyProjects } from '$lib/rpc/project.remote';
	import Badge from '$stories/shadcnui/badge/badge.svelte';
	import { cn } from '$stories/utils';

	interface Props {
		project: Awaited<ReturnType<typeof getAllMyProjects>>[number];
	}

	let { project }: Props = $props();
</script>

{#snippet ProjectStatus(statusValue: (typeof projectStatusOptions)[number]['value'])}
	{@const status = projectStatusOptions.find((option) => option.value === statusValue)}
	{#if status}
		<Badge class={cn(status.color)}>{status.label}</Badge>
	{:else}
		<Badge class={cn('mt-2 inline-block rounded-full bg-muted/50 px-2 py-1 text-xs font-medium')}>
			ไม่ทราบสถานะ
		</Badge>
	{/if}
{/snippet}

<a
	class="flex flex-col gap-2 rounded-md border p-3 underline-offset-2 transition duration-100 hover:bg-muted hover:shadow"
	href="/projects/{project.project.id}"
>
	<!-- {@render ProjectStatus(project.project.status)} -->
	<h2 class="text-xl font-bold">{project.project.title}</h2>
	<p class="text-sm text-muted-foreground">{project.project.id}</p>
</a>
