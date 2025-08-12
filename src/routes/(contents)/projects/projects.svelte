<script lang="ts">
	import { getMyBorrowerData } from '$lib/rpc/borrower.remote';
	import { getAllMyProjects } from '$lib/rpc/project.remote';
	import { Skeleton } from '$stories/shadcnui/skeleton';

	const myBorrowerData = getMyBorrowerData();
</script>

<section>
	{#await myBorrowerData}
		<Skeleton class="h-3 w-72" />
	{:then data}
		<p>ยินดีต้อนรับ {JSON.stringify(data)}</p>
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
