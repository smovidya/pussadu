<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Dialog from './index.js';
	import { Dialog as DialogPrimitive } from 'bits-ui';

	interface Props {
		title: string;
		windowsControls?: Snippet;
	}

	let {
		title,
		open = $bindable(false),
		children,
		windowsControls,
		...restProps
	}: DialogPrimitive.RootProps & Props = $props();
</script>

<Dialog.Root bind:open {...restProps}>
	<Dialog.Window>
		<Dialog.Titlebar controls={windowsControls}>{title}</Dialog.Titlebar>
		<Dialog.Body>
			{@render children?.()}
		</Dialog.Body>
	</Dialog.Window>
</Dialog.Root>
