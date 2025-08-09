<script lang="ts">
	import '7.css/dist/7.scoped.css';

	let { children } = $props();
</script>

<div class="h-screen">
	{@render children?.()}
</div>
