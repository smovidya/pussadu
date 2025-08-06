<script lang="ts">
	let { children } = $props();
</script>

<div class="window-body has-space">
	{@render children?.()}
</div>

