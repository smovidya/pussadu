<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const statusBadgeVariants = tv({
		base: 'border-transparent',
		variants: {
			tone: {
				neutral: 'bg-neutral text-neutral-foreground',
				info: 'bg-info text-info-foreground',
				warning: 'bg-warning text-warning-foreground',
				success: 'bg-success text-success-foreground',
				destructive: 'bg-destructive text-destructive-foreground'
			}
		},
		defaultVariants: { tone: 'neutral' }
	});

	export type StatusTone = NonNullable<VariantProps<typeof statusBadgeVariants>['tone']>;
</script>

<script lang="ts">
	import type { Component, ComponentProps } from 'svelte';
	import { Badge } from '$stories/shadcnui/badge';
	import { cn } from '$stories/utils';

	type Props = Omit<ComponentProps<typeof Badge>, 'variant'> & {
		tone?: StatusTone;
		Icon?: Component;
	};

	let { tone = 'neutral', Icon, class: className, children, ...restProps }: Props = $props();
</script>

<Badge class={cn(statusBadgeVariants({ tone }), className)} {...restProps}>
	{#if Icon}
		<Icon data-icon="inline-start" />
	{/if}
	{@render children?.()}
</Badge>
