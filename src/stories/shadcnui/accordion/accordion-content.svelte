<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { cn, type WithoutChild } from '$stories/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithoutChild<AccordionPrimitive.ContentProps> = $props();
</script>

<AccordionPrimitive.Content
	bind:ref
	data-slot="accordion-content"
	class="h-(--bits-accordion-content-height) overflow-hidden text-sm transition-[height] duration-200 ease-out data-[state=closed]:h-0 motion-reduce:transition-none"
	{...restProps}
>
	<div class={cn('pt-0 pb-4', className)}>
		{@render children?.()}
	</div>
</AccordionPrimitive.Content>
