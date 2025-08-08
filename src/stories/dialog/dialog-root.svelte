<script lang="ts">
	import { createDraggable } from '$lib/utils/ui';
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { setContext } from 'svelte';

	let { open = $bindable(false), children, ...restProps }: DialogPrimitive.RootProps = $props();

	const draggable = createDraggable();
	setContext('__dialog_draggable', draggable);

	$effect.pre(() => {
		if (open) {
			draggable.resetPosition();
		}
	});
</script>

<DialogPrimitive.Root bind:open {...restProps}>
	{@render children?.()}
</DialogPrimitive.Root>
