<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';
	import { cn } from '$stories/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DrawerPrimitive.OverlayProps = $props();
</script>

<DrawerPrimitive.Overlay
	bind:ref
	data-slot="drawer-overlay"
	class={cn(
		'fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 ease-out data-[state=closed]:opacity-0 data-[state=closed]:duration-150 data-[state=open]:opacity-100 motion-reduce:transition-none',
		className
	)}
	{...restProps}
/>
