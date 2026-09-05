<script lang="ts">
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import NewProjectForm from './new-project-form.svelte';
	import PageHeader from '$stories/page-header/page-header.svelte';
</script>

<PageWrapper groupTitle="จัดการโครงการ" pageTitle="สร้างโครงการใหม่" groupUrl="/admin/projects">
	<PageHeader title="สร้างโครงการใหม่" description="กรอกรายละเอียดและกำหนดสิทธิ์การยืมของโครงการ" />
	<NewProjectForm />
</PageWrapper>
