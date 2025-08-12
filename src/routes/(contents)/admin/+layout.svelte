<script lang="ts">
	import NavBar from '$stories/nav/nav.svelte';
	import { authClient } from '$lib/auth-client';
	const { children } = $props();
</script>

<NavBar {authClient} />

{@render children?.()}
