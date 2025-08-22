<script lang="ts">
	// import type { AuthClient } from '$lib/auth-client';
	import { getMyBorrowerData } from '$lib/rpc/borrower.remote';
	import { getAllMyProjects } from '$lib/rpc/project.remote';
	import { Skeleton } from '$stories/shadcnui/skeleton';

	const myBorrowerData = getMyBorrowerData();

	// interface Props {
	// 	authClient: AuthClient;
	// }
	// let { authClient }: Props = $props();
</script>

<section class="container mx-auto my-4">
	<h2 class="text-xl font-bold">เลือกโครงการ</h2>
	{#await myBorrowerData}
		<Skeleton class="h-3 w-72" />
	{:then data}
		<p class="">ยินดีต้อนรับ <span class="text-yellow-500">{data.name}</span> ({data.email})</p>
	{:catch error}
		<p>Error loading borrower data: {error.message}</p>
	{/await}

	{#await getAllMyProjects()}
		<p>Loading projects...</p>
	{:then projects}
		<ul>
			{#each projects as project (project.id)}
				<li>{project.project.title}</li>
			{/each}
		</ul>
	{:catch error}
		<p>Error loading projects: {error}</p>
	{/await}
</section>
