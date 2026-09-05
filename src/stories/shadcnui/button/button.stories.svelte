<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { Spinner } from '$stories/shadcnui/spinner';
	import { Button } from './index';

	const { Story } = defineMeta({
		title: 'UI/Button',
		component: Button,
		parameters: { a11y: { test: 'error' } }
	});
</script>

<Story name="Variants" asChild>
	<div class="flex flex-wrap items-center gap-3 p-6">
		<Button>บันทึก</Button>
		<Button variant="secondary">ยกเลิก</Button>
		<Button variant="outline">ดูรายละเอียด</Button>
		<Button variant="ghost">รีเซ็ต</Button>
		<Button variant="link">คู่มือใช้งาน</Button>
		<Button variant="destructive"><Trash2Icon data-icon="inline-start" />ลบรายการ</Button>
	</div>
</Story>

<Story name="States and sizes" asChild>
	<div class="flex flex-wrap items-center gap-3 p-6">
		<Button size="sm"><PlusIcon data-icon="inline-start" />เพิ่ม</Button>
		<Button size="lg">ดำเนินการต่อ</Button>
		<Button size="icon" aria-label="เพิ่มรายการ"><PlusIcon /></Button>
		<Button disabled>ปิดใช้งาน</Button>
		<Button disabled><Spinner data-icon="inline-start" />กำลังบันทึก...</Button>
	</div>
</Story>
