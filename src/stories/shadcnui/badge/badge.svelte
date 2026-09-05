<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';
	import {
		cn,
		focusRingClasses,
		invalidControlClasses,
		type WithElementRef
	} from '$stories/utils.js';

	export const badgeVariants = tv({
		base: cn(
			'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium transition-[color,box-shadow] [&>svg]:pointer-events-none [&>svg]:size-3',
			focusRingClasses,
			invalidControlClasses
		),
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/90 border-transparent',
				secondary:
					'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent',
				destructive:
					'border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/30',
				outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
</script>

<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = 'default',
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		variant?: BadgeVariant;
	} = $props();
</script>

<!-- A Badge may receive either an internal route or an external URL from its caller. -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->
<svelte:element
	this={href ? 'a' : 'span'}
	bind:this={ref}
	data-slot="badge"
	{href}
	class={cn(badgeVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
