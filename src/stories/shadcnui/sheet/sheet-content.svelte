<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';
	export const sheetVariants = tv({
		base: 'fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition-transform duration-200 ease-out data-[ending-style]:duration-150 motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:transition-none',
		variants: {
			side: {
				top: 'inset-x-0 top-0 h-auto border-b data-[starting-style]:-translate-y-full data-[ending-style]:-translate-y-full',
				bottom:
					'inset-x-0 bottom-0 h-auto border-t data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full',
				left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full sm:max-w-sm',
				right:
					'inset-y-0 right-0 h-full w-3/4 border-l data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full sm:max-w-sm'
			}
		},
		defaultVariants: {
			side: 'right'
		}
	});

	export type Side = VariantProps<typeof sheetVariants>['side'];
</script>

<script lang="ts">
	import { Dialog as SheetPrimitive } from 'bits-ui';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import SheetOverlay from './sheet-overlay.svelte';
	import { cn, type WithoutChildrenOrChild } from '$stories/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		side = 'right',
		portalProps,
		children,
		...restProps
	}: WithoutChildrenOrChild<SheetPrimitive.ContentProps> & {
		portalProps?: SheetPrimitive.PortalProps;
		side?: Side;
		children: Snippet;
	} = $props();
</script>

<SheetPrimitive.Portal {...portalProps}>
	<SheetOverlay />
	<SheetPrimitive.Content
		bind:ref
		data-slot="sheet-content"
		class={cn(sheetVariants({ side }), className)}
		{...restProps}
	>
		{@render children?.()}
		<SheetPrimitive.Close
			class="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none motion-reduce:transition-none md:after:size-10"
		>
			<XIcon />
			<span class="sr-only">Close</span>
		</SheetPrimitive.Close>
	</SheetPrimitive.Content>
</SheetPrimitive.Portal>
