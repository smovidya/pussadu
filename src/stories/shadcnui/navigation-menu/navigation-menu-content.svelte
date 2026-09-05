<script lang="ts">
	import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';
	import { cn } from '$stories/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: NavigationMenuPrimitive.ContentProps = $props();
</script>

<NavigationMenuPrimitive.Content
	bind:ref
	data-slot="navigation-menu-content"
	class={cn(
		'top-0 left-0 w-full transition-[opacity,translate,scale] duration-200 ease-out data-[motion=from-end]:translate-x-52 data-[motion=from-start]:-translate-x-52 data-[motion=to-end]:translate-x-52 data-[motion=to-start]:-translate-x-52 data-[motion^=from-]:opacity-100 data-[motion^=to-]:opacity-0 motion-reduce:translate-x-0 motion-reduce:transition-none md:absolute md:w-auto',
		'group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none group-data-[viewport=false]/navigation-menu:data-[state=closed]:scale-95 group-data-[viewport=false]/navigation-menu:data-[state=closed]:opacity-0 group-data-[viewport=false]/navigation-menu:data-[state=open]:scale-100 group-data-[viewport=false]/navigation-menu:data-[state=open]:opacity-100',
		className
	)}
	{...restProps}
/>
