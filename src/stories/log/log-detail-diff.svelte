<script lang="ts">
	import { MoveRight } from '@lucide/svelte';
	import LogDetailKv from './log-detail-kv.svelte';
	import { formatLogValue, HIDDEN_KEYS, labelForKey } from './log-field-labels';

	let {
		from,
		to
	}: {
		from?: Record<string, unknown> | null;
		to: Record<string, unknown>;
	} = $props();

	const changes = $derived.by(() => {
		if (!from) return [];
		return Object.keys(to)
			.filter((key) => key !== 'id' && !HIDDEN_KEYS.includes(key))
			.map((key) => ({
				key,
				oldText: formatLogValue(key, from[key]),
				newText: formatLogValue(key, to[key])
			}))
			.filter((change) => change.oldText !== change.newText);
	});
</script>

{#if !from || changes.length === 0}
	<p class="mb-1 text-xs font-medium text-muted-foreground">ค่าใหม่</p>
	<LogDetailKv data={to} />
{:else}
	<div class="flex flex-col gap-1 text-xs">
		{#each changes as change (change.key)}
			<div class="flex flex-wrap items-center gap-1.5">
				<span class="font-medium text-muted-foreground">{labelForKey(change.key)}:</span>
				<span
					class="rounded bg-red-50 px-1 text-red-700 line-through dark:bg-red-950 dark:text-red-300"
				>
					{change.oldText}
				</span>
				<MoveRight class="size-3 shrink-0 text-muted-foreground" />
				<span class="rounded bg-green-50 px-1 text-green-700 dark:bg-green-950 dark:text-green-300">
					{change.newText}
				</span>
			</div>
		{/each}
	</div>
{/if}
