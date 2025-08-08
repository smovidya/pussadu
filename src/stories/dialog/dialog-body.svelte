<script lang="ts">
	import { cn } from '$lib/utils/ui';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<div class={cn('window-body has-space', className)}>
	{@render children?.()}
</div>
