<script lang="ts">
	import { page } from '$app/state';
	import AdminEditProject from './admin-edit-project.svelte';

	const id = page.params.id ?? '';
</script>

<AdminEditProject {id} />
