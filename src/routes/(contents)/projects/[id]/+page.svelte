<script lang="ts">
	import AssetsSelect from '$stories/assets/assets-select.svelte';
	import { page } from '$app/state';
	import Skeleton from '$stories/shadcnui/skeleton/skeleton.svelte';
	import { getProjectInfo } from '$lib/rpc/project.remote';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';
	const id = page.params.id ?? '';
</script>

<AsyncHttpBoundary dataLoader={getProjectInfo({ id })}>
	{#snippet children(project)}
		{#if project}
			<AssetsSelect {project} />
		{:else}
			<p>ไม่พบข้อมูลสำหรับโครงการที่มี ID: {id}</p>
		{/if}
	{/snippet}
	{#snippet pending()}
		<Skeleton class="h-4 w-3/4" />
		<Skeleton class="h-4 w-3/4" />
	{/snippet}
</AsyncHttpBoundary>
