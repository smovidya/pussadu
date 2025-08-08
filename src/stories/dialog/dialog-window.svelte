<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { getContext, type Snippet } from 'svelte';
	import * as Dialog from './index.js';
	import { cn, createDraggable, type WithoutChildrenOrChild } from '$lib/utils/ui';

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		overlayProps,
		children,
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		portalProps?: DialogPrimitive.PortalProps;
		overlayProps?: DialogPrimitive.OverlayProps;
		children: Snippet;
	} = $props();

	const draggable = getContext('__dialog_draggable') as ReturnType<typeof createDraggable>;
	const { onpointermove, onpointerup } = draggable.root;
</script>

<svelte:window {onpointerup} />
<svelte:body {onpointermove} />

<Dialog.Portal {...portalProps}>
	<Dialog.Overlay {...overlayProps} />
	<DialogPrimitive.Content
		bind:ref
		data-slot="dialog-content"
		interactOutsideBehavior="ignore"
		class="win7 group fixed top-[50%] left-[50%] z-50 w-72 translate-x-[-50%] translate-y-[-50%] data-[state=closed]:animate-out"
		{...restProps}
	>
		<div
			class={cn(
				'window glass active pointer-events-auto w-full group-data-[state=closed]:animate-out group-data-[state=closed]:fade-out-0 group-data-[state=closed]:zoom-out-95 group-data-[state=open]:animate-in group-data-[state=open]:fade-in-0 group-data-[state=open]:zoom-in-95',
				className
			)}
			{...draggable.container}
		>
			{@render children?.()}
		</div>
	</DialogPrimitive.Content>
</Dialog.Portal>
