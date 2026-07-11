<script lang="ts">
	import JsonView from './json-view.svelte';
	import { formatLogValue, HIDDEN_KEYS, isComplexValue, labelForKey } from './log-field-labels';

	let {
		data,
		keys
	}: {
		data: Record<string, unknown>;
		/** Preferred key order — listed keys come first, unlisted keys keep insertion order after them. */
		keys?: string[];
	} = $props();

	const entries = $derived.by(() => {
		const visible = Object.entries(data).filter(([k]) => !HIDDEN_KEYS.includes(k));
		if (!keys) return visible;
		const order = new Map(keys.map((k, i) => [k, i]));
		return visible.toSorted(
			(a, b) =>
				(order.get(a[0]) ?? Number.MAX_SAFE_INTEGER) - (order.get(b[0]) ?? Number.MAX_SAFE_INTEGER)
		);
	});
</script>

<dl class="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-xs">
	{#each entries as [key, value] (key)}
		<dt class="font-medium text-muted-foreground">{labelForKey(key)}</dt>
		<dd class="min-w-0 break-words">
			{#if isComplexValue(value)}
				<JsonView {value} showFooter={false} />
			{:else}
				{formatLogValue(key, value)}
			{/if}
		</dd>
	{/each}
</dl>
