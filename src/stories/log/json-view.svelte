<script lang="ts">
	import RawJsonToggle from './raw-json-toggle.svelte';
	import { isComplexValue } from './log-field-labels';

	let {
		value,
		showFooter = true
	}: {
		value: unknown;
		showFooter?: boolean;
	} = $props();

	// Collections larger than this render collapsed by default
	const OPEN_THRESHOLD = 20;

	const entriesOf = (v: Record<string, unknown> | unknown[]): [string, unknown][] =>
		Array.isArray(v) ? v.map((item, i) => [String(i), item]) : Object.entries(v);
</script>

{#snippet leaf(v: unknown)}
	{#if v === null || v === undefined}
		<span class="text-muted-foreground italic">null</span>
	{:else if typeof v === 'string'}
		<span class="break-all text-emerald-700 dark:text-emerald-400">{v}</span>
	{:else if typeof v === 'number'}
		<span class="text-sky-700 dark:text-sky-400">{v}</span>
	{:else if typeof v === 'boolean'}
		<span class="text-purple-700 dark:text-purple-400">{v}</span>
	{:else}
		<span>{String(v)}</span>
	{/if}
{/snippet}

{#snippet tree(v: Record<string, unknown> | unknown[])}
	{@const entries = entriesOf(v)}
	<div class="flex min-w-0 flex-col gap-0.5">
		{#each entries as [k, child] (k)}
			<div class="flex min-w-0 gap-1.5">
				<span class="shrink-0 font-medium text-muted-foreground">{k}:</span>
				{#if isComplexValue(child)}
					{@const count = Array.isArray(child) ? child.length : Object.keys(child).length}
					{#if count === 0}
						<span class="text-muted-foreground">{Array.isArray(child) ? '[]' : '{}'}</span>
					{:else}
						<details class="min-w-0" open={count <= OPEN_THRESHOLD}>
							<summary class="cursor-pointer text-muted-foreground select-none hover:underline">
								แสดงทั้งหมด ({count})
							</summary>
							<div class="mt-0.5 border-l pl-3">
								{@render tree(child)}
							</div>
						</details>
					{/if}
				{:else}
					{@render leaf(child)}
				{/if}
			</div>
		{/each}
	</div>
{/snippet}

<div class="text-xs">
	{#if isComplexValue(value)}
		{@render tree(value)}
	{:else}
		{@render leaf(value)}
	{/if}
	{#if showFooter}
		<RawJsonToggle {value} />
	{/if}
</div>
