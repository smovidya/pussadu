<script lang="ts">
	import { getAllProjects } from '$lib/rpc/project.remote';
	import Button from '$stories/shadcnui/button/button.svelte';
</script>

<section>
	<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
		<h1>จัดการโครงการ</h1>
		<Button href="/admin/projects/new">เพิ่มโครงการ</Button>
	</div>
	{#await getAllProjects()}
		<p>Loading projects...</p>
	{:then projects}
		<ul>
			{#each projects as project (project.id)}
				<li>{project.title}</li>
			{/each}
		</ul>
	{:catch error}
		<p>Error loading projects: {error}</p>
	{/await}
</section>
