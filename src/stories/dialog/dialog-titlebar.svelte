<script lang="ts">
	import type { createDraggable } from '$lib/utils/ui';
	import * as Dialog from './index.js';
	import { getContext, type Snippet } from 'svelte';

	interface Props {
		controls?: Snippet;
		children?: Snippet;
	}

	let { children, controls }: Props = $props();
	const draggable = getContext('__dialog_draggable') as ReturnType<typeof createDraggable>;
</script>

<div class="title-bar select-none" {...draggable.handle}>
	<div class="title-bar-text">
		{@render children?.()}
	</div>
	<div class="title-bar-controls">
		{#if controls}
			{@render controls()}
		{:else}
			<Dialog.Minimize disabled />
			<Dialog.Close />
		{/if}
	</div>
</div>
