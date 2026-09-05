<script lang="ts">
	import { cn } from '$stories/utils.js';
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	let {
		ref = $bindable(null),
		sideOffset = 4,
		portalProps,
		class: className,
		...restProps
	}: DropdownMenuPrimitive.ContentProps & {
		portalProps?: DropdownMenuPrimitive.PortalProps;
	} = $props();
</script>

<DropdownMenuPrimitive.Portal {...portalProps}>
	<DropdownMenuPrimitive.Content
		bind:ref
		data-slot="dropdown-menu-content"
		{sideOffset}
		class={cn(
			'z-50 max-h-(--bits-dropdown-menu-content-available-height) min-w-[8rem] origin-(--bits-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md transition-[opacity,scale] duration-150 ease-out outline-none data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100 motion-reduce:scale-100 motion-reduce:transition-none',
			className
		)}
		{...restProps}
	/>
</DropdownMenuPrimitive.Portal>
