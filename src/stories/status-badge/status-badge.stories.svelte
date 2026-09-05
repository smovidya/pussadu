<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';
	import TimerIcon from '@lucide/svelte/icons/timer';
	import { expect, within } from 'storybook/test';
	import * as Select from '$stories/shadcnui/select';
	import StatusBadge from './status-badge.svelte';

	const { Story } = defineMeta({
		title: 'System/StatusBadge',
		component: StatusBadge,
		parameters: { a11y: { test: 'error' } }
	});

	const verifyInheritedIconColor = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const canvas = within(canvasElement);
		const badge = canvas.getByText('ดำเนินอยู่').closest('[data-slot="badge"]');
		const icon = badge?.querySelector('svg');

		await expect(badge).not.toBeNull();
		await expect(icon).not.toBeNull();
		await expect(getComputedStyle(icon!).color).toBe(getComputedStyle(badge!).color);
	};
</script>

<Story name="All tones" asChild>
	<div class="flex flex-wrap gap-3 p-6">
		<StatusBadge tone="neutral">ยังไม่เริ่ม</StatusBadge>
		<StatusBadge tone="info">อยู่ระหว่างการประเมิน</StatusBadge>
		<StatusBadge tone="warning">กำลังใช้งาน</StatusBadge>
		<StatusBadge tone="success" Icon={CircleCheckIcon}>อนุมัติและส่งคืนเรียบร้อยแล้ว</StatusBadge>
		<StatusBadge tone="destructive">ถูกปฏิเสธ</StatusBadge>
	</div>
</Story>

<Story name="Inside select trigger" asChild play={verifyInheritedIconColor}>
	<Select.Root type="single" value="inprogress">
		<Select.Trigger aria-label="สถานะโครงการ" class="w-44">
			<StatusBadge tone="warning" Icon={TimerIcon}>ดำเนินอยู่</StatusBadge>
		</Select.Trigger>
	</Select.Root>
</Story>

<Story name="Dark surface" asChild>
	<div class="dark flex flex-wrap gap-3 bg-background p-6 text-foreground">
		<StatusBadge tone="neutral">ทั่วไป</StatusBadge>
		<StatusBadge tone="info">รอดำเนินการ</StatusBadge>
		<StatusBadge tone="warning">กำลังซ่อมบำรุง</StatusBadge>
		<StatusBadge tone="success">พร้อมใช้งาน</StatusBadge>
		<StatusBadge tone="destructive">สูญหายหรือชำรุด</StatusBadge>
	</div>
</Story>
