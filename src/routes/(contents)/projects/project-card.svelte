<script lang="ts">
	import type { getAllMyProjects } from '$lib/rpc/project.remote';

	interface Props {
		project: Awaited<ReturnType<typeof getAllMyProjects>>[number];
	}

	let { project }: Props = $props();
</script>

<a
	class="block rounded-md border p-3 underline-offset-2 transition-shadow hover:underline hover:shadow"
	href="#"
>
	<h2>{project.project.title}</h2>
	<p class="text-sm text-muted-foreground">{project.project.id}</p>
</a>
