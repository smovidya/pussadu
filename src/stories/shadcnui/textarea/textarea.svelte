<script lang="ts">
	import {
		cn,
		focusRingClasses,
		invalidControlClasses,
		type WithElementRef,
		type WithoutChildren
	} from '$stories/utils.js';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		...restProps
	}: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> = $props();
</script>

<textarea
	bind:this={ref}
	data-slot="textarea"
	class={cn(
		'flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-xs transition-[color,box-shadow] placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
		focusRingClasses,
		invalidControlClasses,
		className
	)}
	bind:value
	{...restProps}
></textarea>
