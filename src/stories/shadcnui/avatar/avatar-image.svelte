<script lang="ts">
	import { Avatar as AvatarPrimitive } from 'bits-ui';
	import { cn } from '$stories/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: AvatarPrimitive.ImageProps = $props();
</script>

<AvatarPrimitive.Image
	bind:ref
	data-slot="avatar-image"
	class={cn(
		'aspect-square size-full outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10',
		className
	)}
	{...restProps}
/>
