<script lang="ts">
	let { children } = $props();
</script>

<div class="win7 min-h-screen">
	{@render children?.()}
</div>