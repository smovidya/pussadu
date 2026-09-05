<script lang="ts" module>
	import {
		cn,
		focusRingClasses,
		invalidControlClasses,
		type WithElementRef
	} from '$stories/utils.js';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';

	export const buttonVariants = tv({
		base: cn(
			'inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,box-shadow,scale] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 md:min-h-10 md:min-w-10 motion-reduce:transition-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
			focusRingClasses,
			invalidControlClasses
		),
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
				destructive:
					'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/30',
				outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
				secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline'
			},
			size: {
				default: 'px-4 py-2 has-[>svg:first-child]:pl-3.5 has-[>svg:last-child]:pr-3.5',
				sm: 'gap-1.5 rounded-md px-3 has-[>svg:first-child]:pl-2.5 has-[>svg:last-child]:pr-2.5',
				lg: 'rounded-md px-6 has-[>svg:first-child]:pl-5.5 has-[>svg:last-child]:pr-5.5',
				icon: 'p-0'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
			static?: boolean;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = 'default',
		size = 'default',
		ref = $bindable(null),
		href = undefined,
		type = 'button',
		disabled,
		static: isStatic = false,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

<!-- A Button may receive either an internal route or an external URL from its caller. -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->
{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(
			buttonVariants({ variant, size }),
			!isStatic && 'active:not-disabled:scale-[0.96] aria-disabled:active:scale-100',
			className
		)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? 'link' : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(
			buttonVariants({ variant, size }),
			!isStatic && 'active:not-disabled:scale-[0.96]',
			className
		)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
<!-- eslint-enable svelte/no-navigation-without-resolve -->
