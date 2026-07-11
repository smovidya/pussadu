<script lang="ts">
	import Badge from '$stories/shadcnui/badge/badge.svelte';
	import * as HoverCard from '$stories/shadcnui/hover-card';
	import type { LogTargetKind, ResolvedLogTarget } from '$lib/schema/log-details';

	let {
		target,
		targets = {}
	}: {
		target: string;
		targets?: Record<string, ResolvedLogTarget>;
	} = $props();

	const KIND_LABELS: Record<LogTargetKind, string> = {
		asset: 'พัสดุ',
		project: 'โครงการ',
		user: 'ผู้ใช้',
		borrower: 'ผู้ยืม',
		'borrow-request': 'คำขอยืม',
		cron: 'ระบบ'
	};

	const hrefFor = (id: string, resolved: ResolvedLogTarget): string | undefined => {
		switch (resolved.kind) {
			case 'asset':
				return `/admin/log/asset/${id}`;
			case 'project':
				return `/admin/log/project/${id}`;
			case 'user':
				return `/admin/log/user/${id}`;
			case 'borrow-request':
				return resolved.refId ? `/admin/log/asset/${resolved.refId}` : undefined;
			default:
				return undefined;
		}
	};

	const ids = $derived(
		target
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
	);
</script>

{#snippet single(id: string)}
	{@const resolved = targets[id]}
	{#if resolved}
		{@const href = hrefFor(id, resolved)}
		<span class="flex max-w-44 items-center gap-1.5">
			<Badge variant="outline" class="shrink-0 px-1.5 py-0 text-[10px] font-normal">
				{KIND_LABELS[resolved.kind]}
			</Badge>
			{#if href}
				<!-- runtime entity id, not a compile-time-known route, so it can't go through resolve() -->
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a {href} class="truncate text-sm hover:underline" title={resolved.name}>
					{resolved.name}
				</a>
			{:else}
				<span class="truncate text-sm" title={resolved.name}>{resolved.name}</span>
			{/if}
		</span>
	{:else}
		<code class="rounded bg-muted px-1.5 py-0.5 text-xs">{id}</code>
	{/if}
{/snippet}

{#if ids.length === 0}
	<span class="text-sm text-muted-foreground">-</span>
{:else if ids.length === 1}
	{@render single(ids[0])}
{:else}
	<HoverCard.Root>
		<HoverCard.Trigger>
			{#snippet child({ props })}
				<button {...props} class="text-sm hover:underline">
					ผู้ใช้ {ids.length} คน
				</button>
			{/snippet}
		</HoverCard.Trigger>
		<HoverCard.Content class="max-h-64 w-72 overflow-y-auto">
			<div class="flex flex-col gap-1">
				{#each ids as id (id)}
					{@render single(id)}
				{/each}
			</div>
		</HoverCard.Content>
	</HoverCard.Root>
{/if}
