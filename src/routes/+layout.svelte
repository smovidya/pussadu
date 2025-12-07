<script lang="ts">
	import { browser } from '$app/environment';
	import '../app.css';
	import '@fontsource-variable/anuphan';
	import favicon from '$lib/assets/favicon.png';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { Toaster } from '$stories/shadcnui/sonner';

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
		<div class="flex h-screen w-full items-center justify-center">
			<span
				class="size-10 animate-spin rounded-full border-4 border-x-yellow-300/20 border-y-yellow-400"
			>
				<span class="sr-only"> กำลังโหลด </span>
			</span>
		</div>
	{/snippet}
</svelte:boundary>
<Toaster />
