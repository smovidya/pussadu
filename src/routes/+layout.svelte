<script lang="ts">
	import { browser } from '$app/environment';
	import '../app.css';
	import '@fontsource-variable/anuphan';
	import favicon from '$lib/assets/favicon.png';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { Toaster } from '$stories/shadcnui/sonner';
	import SmoLogo from '$lib/assets/smo.svg';

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
		<div class="relative flex h-screen w-full items-center justify-center">
			<span
				class="size-14 animate-spin rounded-full border-4 border-x-yellow-300/20 border-y-yellow-400"
			>
				<span class="sr-only"> กำลังโหลด </span>
			</span>
			<img src={SmoLogo} alt="SMO Logo" class="absolute size-7 text-yellow-400" />
		</div>
	{/snippet}
</svelte:boundary>
<Toaster />
