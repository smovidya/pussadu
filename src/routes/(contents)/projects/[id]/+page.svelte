<script lang="ts">
	import AssetsSelect from '$stories/assets/assets-select.svelte';
	import { page } from '$app/state';
	import Skeleton from '$stories/shadcnui/skeleton/skeleton.svelte';
	import { getMyProjectMembership, getProjectInfo } from '$lib/rpc/project.remote';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';
	const id = page.params.id ?? '';
</script>

<AsyncHttpBoundary
	dataLoader={Promise.all([getProjectInfo({ id }), getMyProjectMembership({ id })])}
>
	{#snippet children([project, membership])}
		{#if project}
			<AssetsSelect {project} membershipRole={membership.role} />
		{:else}
			<p>ไม่พบข้อมูลสำหรับโครงการที่มี ID: {id}</p>
		{/if}
	{/snippet}
	{#snippet pending()}
		<Skeleton class="h-4 w-3/4" />
		<Skeleton class="h-4 w-3/4" />
	{/snippet}
</AsyncHttpBoundary>
