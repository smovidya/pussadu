<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '$stories/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DialogPrimitive.OverlayProps = $props();
</script>

<DialogPrimitive.Overlay
	bind:ref
	data-slot="dialog-overlay"
	class={cn(
		'fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 ease-out data-[state=closed]:opacity-0 data-[state=closed]:duration-150 data-[state=open]:opacity-100 motion-reduce:transition-none',
		className
	)}
	{...restProps}
/>
