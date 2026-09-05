<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
	import AlertDialogOverlay from './alert-dialog-overlay.svelte';
	import { cn, type WithoutChild, type WithoutChildrenOrChild } from '$stories/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		...restProps
	}: WithoutChild<AlertDialogPrimitive.ContentProps> & {
		portalProps?: WithoutChildrenOrChild<AlertDialogPrimitive.PortalProps>;
	} = $props();
</script>

<AlertDialogPrimitive.Portal {...portalProps}>
	<AlertDialogOverlay />
	<AlertDialogPrimitive.Content
		bind:ref
		data-slot="alert-dialog-content"
		class={cn(
			'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg transition-[opacity,scale] duration-200 ease-out data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=closed]:duration-150 data-[state=open]:scale-100 data-[state=open]:opacity-100 motion-reduce:scale-100 motion-reduce:transition-none sm:max-w-lg',
			className
		)}
		{...restProps}
	/>
</AlertDialogPrimitive.Portal>
