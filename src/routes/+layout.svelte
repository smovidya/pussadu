<script lang="ts">
	import { browser } from '$app/environment';
	import '../app.css';
	import '@fontsource-variable/anuphan';
	import favicon from '$lib/assets/favicon.png';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { Toaster } from '$stories/shadcnui/sonner';
	import SmoLogo from '$lib/assets/smo.svg';
	import { ModeWatcher } from 'mode-watcher';

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser
			}
		}
	});

	let { children } = $props();

	$effect(() => {
		const url = new URL(window.location.href);
		if (window.navigator.userAgent.includes('Line')) {
			url.searchParams.set('openExternalBrowser', '1');
			window.location.href = url.toString();
		}
		if (
			url.searchParams.get('openExternalBrowser') === '1' &&
			!window.navigator.userAgent.includes('Line')
		) {
			url.searchParams.delete('openExternalBrowser');
			window.location.href = url.toString();
		}
	});
</script>

<ModeWatcher defaultMode="system" />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<svelte:boundary>
	<QueryClientProvider client={queryClient}>
		{@render children?.()}
	</QueryClientProvider>
	{#snippet pending()}
		<div class="relative flex h-screen w-full items-center justify-center">
			<span class="size-14 animate-spin rounded-full border-4 border-x-brand/20 border-y-brand">
				<span class="sr-only"> กำลังโหลด </span>
			</span>
			<img src={SmoLogo} alt="SMO Logo" class="absolute size-7 text-brand" />
		</div>
	{/snippet}
</svelte:boundary>
<Toaster />
