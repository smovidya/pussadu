<script lang="ts">
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import NewProjectForm from './new-project-form.svelte';
</script>

<PageWrapper groupTitle="จัดการโครงการ" pageTitle="สร้างโครงการใหม่" groupUrl="/admin/projects">
	<h1 class="mb-2 text-2xl font-bold">สร้างโครงการใหม่</h1>
	<NewProjectForm />
</PageWrapper>
