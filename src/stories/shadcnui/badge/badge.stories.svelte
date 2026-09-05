<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CheckIcon from '@lucide/svelte/icons/check';
	import { Badge } from './index';

	const { Story } = defineMeta({
		title: 'UI/Badge',
		component: Badge,
		parameters: { a11y: { test: 'error' } }
	});
</script>

<Story name="Variants" asChild>
	<div class="flex flex-wrap gap-3 p-6">
		<Badge><CheckIcon data-icon="inline-start" />ค่าเริ่มต้น</Badge>
		<Badge variant="secondary">บทบาทนิสิต</Badge>
		<Badge variant="outline">ข้อมูลทั่วไป</Badge>
		<Badge variant="destructive">ข้อผิดพลาด</Badge>
		<Badge href="#badge-link">ลิงก์แบดจ์</Badge>
	</div>
</Story>
