<script lang="ts">
	import AppSidebar from '$stories/sidebar/app-sidebar.svelte';
	import * as Sidebar from '$stories/shadcnui/sidebar';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		{@render children?.()}
	</Sidebar.Inset>
</Sidebar.Provider>
