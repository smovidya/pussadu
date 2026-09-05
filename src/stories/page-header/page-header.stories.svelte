<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { Button } from '$stories/shadcnui/button';
	import PageHeader from './page-header.svelte';

	const { Story } = defineMeta({
		title: 'System/PageHeader',
		component: PageHeader,
		parameters: { a11y: { test: 'error' } }
	});
</script>

<Story name="Title only" args={{ title: 'รายการพัสดุ' }} />
<Story
	name="With description"
	args={{ title: 'การจัดการผู้ใช้', description: 'จัดการบัญชี บทบาท และสิทธิ์ของผู้ใช้ในระบบ' }}
/>
<Story name="With actions" asChild>
	<PageHeader title="รายการโครงการ" description="จัดการโครงการของสโมสรนิสิต">
		{#snippet actions()}
			<Button><PlusIcon data-icon="inline-start" />เพิ่มโครงการ</Button>
		{/snippet}
	</PageHeader>
</Story>
<Story
	name="Narrow viewport"
	args={{
		title: 'รายละเอียดการยืม',
		description: 'ข้อความอธิบายที่ยาวเพื่อทดสอบการตัดบรรทัดบนหน้าจอขนาดเล็ก'
	}}
	parameters={{ viewport: { defaultViewport: 'mobile1' } }}
/>
