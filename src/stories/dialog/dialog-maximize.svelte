<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let { ...restProps }: HTMLButtonAttributes = $props();
</script>

<button data-slot="dialog-close" aria-label="Maximize" {...restProps}></button>
