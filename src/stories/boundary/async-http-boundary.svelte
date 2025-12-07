<script lang="ts" generics="T extends Promise<unknown>">
	import AlertErrorHttpUnauthorized from '$stories/alert/alert-error-http-unauthorized.svelte';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import { isHttpError } from '@sveltejs/kit';
	import type { Snippet } from 'svelte';
	import * as Alert from '$stories/shadcnui/alert';
	import AlertErrorHttpNotfound from '$stories/alert/alert-error-http-notfound.svelte';

	interface Props {
		dataLoader: T;
		pending?: Snippet;
		children: Snippet<[Awaited<T>]>;
		error?: Snippet<[unknown | Error]>;
	}

	let { dataLoader, children, pending, error }: Props = $props();
</script>

{#await dataLoader}
	{#if pending}
		{@render pending()}
	{:else}
		<Skeleton class="h-20 w-full" />
	{/if}
{:then result}
	{@render children(result)}
{:catch _error}
	{#if error}
		{@render error(_error)}
	{:else if isHttpError(_error)}
		{#if _error.status === 401}
			<AlertErrorHttpUnauthorized error={_error} />
		{:else if _error.status === 404}
			<AlertErrorHttpNotfound error={_error} />
		{/if}
	{:else}
		<Alert.Root variant="destructive">
			<Alert.Title>เกิดข้อผิดพลาด: {_error.status} {_error.statusText}</Alert.Title>
			<Alert.Description>{_error.message}</Alert.Description>
		</Alert.Root>
	{/if}
{/await}
