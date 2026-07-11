<script lang="ts">
	import Button from '$stories/shadcnui/button/button.svelte';
	import { Check, Copy } from '@lucide/svelte';

	let { value }: { value: unknown } = $props();

	let showRaw = $state(false);
	let copied = $state(false);
	const rawText = $derived(JSON.stringify(value, null, 2));

	async function copyRaw() {
		await navigator.clipboard.writeText(rawText);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<div class="mt-1.5 flex items-center gap-1">
	<Button
		variant="ghost"
		size="sm"
		class="h-6 px-1.5 text-xs text-muted-foreground"
		onclick={() => (showRaw = !showRaw)}
	>
		{showRaw ? 'ซ่อน JSON ดิบ' : 'JSON ดิบ'}
	</Button>
	<Button
		variant="ghost"
		size="sm"
		class="h-6 px-1.5 text-xs text-muted-foreground"
		onclick={copyRaw}
	>
		{#if copied}
			<Check class="size-3" />
			คัดลอกแล้ว
		{:else}
			<Copy class="size-3" />
			คัดลอก
		{/if}
	</Button>
</div>
{#if showRaw}
	<pre class="mt-1 max-h-64 max-w-full overflow-auto rounded bg-muted p-2 text-xs">{rawText}</pre>
{/if}
