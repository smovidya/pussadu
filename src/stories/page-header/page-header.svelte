<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { cn, type WithElementRef } from '$stories/utils';

	type Props = WithElementRef<HTMLAttributes<HTMLElement>> & {
		title: string;
		description?: string;
		actions?: Snippet;
	};

	let {
		ref = $bindable(null),
		title,
		description,
		actions,
		class: className,
		...restProps
	}: Props = $props();
</script>

<section
	bind:this={ref}
	data-slot="page-header"
	class={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}
	{...restProps}
>
	<div class="flex min-w-0 flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
		{#if description}
			<p class="max-w-3xl text-sm text-pretty text-muted-foreground">{description}</p>
		{/if}
	</div>
	{#if actions}
		<div class="flex shrink-0 flex-wrap items-center gap-2">
			{@render actions()}
		</div>
	{/if}
</section>
