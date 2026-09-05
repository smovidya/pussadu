<script lang="ts">
	import { Dialog as SheetPrimitive } from 'bits-ui';
	import { cn } from '$stories/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: SheetPrimitive.OverlayProps = $props();
</script>

<SheetPrimitive.Overlay
	bind:ref
	data-slot="sheet-overlay"
	class={cn(
		'fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 ease-out data-[ending-style]:opacity-0 data-[ending-style]:duration-150 data-[starting-style]:opacity-0 motion-reduce:transition-none',
		className
	)}
	{...restProps}
/>
