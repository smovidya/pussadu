<script lang="ts">
	import { browser } from '$app/environment';
	import '../app.css';
	import '@fontsource-variable/anuphan';
	import favicon from '$lib/assets/favicon.png';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser
			}
		}
	});
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<svelte:boundary>
	<QueryClientProvider client={queryClient}>
		{@render children?.()}
	</QueryClientProvider>
	{#snippet pending()}
		loading
	{/snippet}
</svelte:boundary>
