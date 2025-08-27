<script lang="ts">
	import AssetsSelect from './assets-select.svelte';
	import { page } from '$app/state';
	import Skeleton from '$stories/shadcnui/skeleton/skeleton.svelte';
	import { getProjectInfo } from '$lib/rpc/project.remote';
	const id = page.params.id ?? '';
</script>

{#await getProjectInfo({ id })}
	<Skeleton class="h-4 w-3/4" />
	<Skeleton class="h-4 w-3/4" />
{:then project}
	{#if project}
		<AssetsSelect {project} />
	{:else}
		<p>ไม่พบข้อมูลสำหรับโครงการที่มี ID: {id}</p>
	{/if}
{:catch error}
	<p>ไม่สามารถโหลดข้อมูลโครงการได้: {error.body.message}</p>
{/await}
