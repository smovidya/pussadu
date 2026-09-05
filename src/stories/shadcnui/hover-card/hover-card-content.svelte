<script lang="ts">
	import { LinkPreview as HoverCardPrimitive } from 'bits-ui';
	import { cn } from '$stories/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		align = 'center',
		sideOffset = 4,
		portalProps,
		...restProps
	}: HoverCardPrimitive.ContentProps & {
		portalProps?: HoverCardPrimitive.PortalProps;
	} = $props();
</script>

<HoverCardPrimitive.Portal {...portalProps}>
	<HoverCardPrimitive.Content
		bind:ref
		data-slot="hover-card-content"
		{align}
		{sideOffset}
		class={cn(
			'z-50 mt-3 w-64 origin-(--bits-link-preview-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md transition-[opacity,scale] duration-150 ease-out outline-none data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100 motion-reduce:scale-100 motion-reduce:transition-none',
			className
		)}
		{...restProps}
	/>
</HoverCardPrimitive.Portal>
