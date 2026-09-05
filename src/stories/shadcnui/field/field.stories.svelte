<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, within } from 'storybook/test';
	import { Input } from '$stories/shadcnui/input';
	import * as Field from './index';

	const { Story } = defineMeta({
		title: 'UI/Field',
		parameters: { a11y: { test: 'error' } }
	});

	const verifyInvalid = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByLabelText('อีเมล')).toHaveAttribute('aria-invalid', 'true');
		await expect(canvas.getByText('กรุณากรอกอีเมลให้ถูกต้อง')).toBeInTheDocument();
	};
</script>

<Story name="States" asChild play={verifyInvalid}>
	<div class="w-full max-w-lg p-6">
		<Field.Set>
			<Field.Legend>ข้อมูลผู้ยืม</Field.Legend>
			<Field.Description>กรอกข้อมูลสำหรับติดต่อและตรวจสอบสิทธิ์การยืม</Field.Description>
			<Field.Group>
				<Field.Field>
					<Field.Label for="field-name">ชื่อ-นามสกุล</Field.Label>
					<Input id="field-name" value="สมชาย ใจดี" />
					<Field.Description>ใช้ชื่อเดียวกับบัญชีจุฬาฯ</Field.Description>
				</Field.Field>
				<Field.Field data-invalid>
					<Field.Label for="field-email">อีเมล</Field.Label>
					<Input id="field-email" type="email" aria-invalid />
					<Field.Error>กรุณากรอกอีเมลให้ถูกต้อง</Field.Error>
				</Field.Field>
				<Field.Field data-disabled>
					<Field.Label for="field-id">เลขนิสิต</Field.Label>
					<Input id="field-id" value="6612345623" disabled />
				</Field.Field>
			</Field.Group>
		</Field.Set>
	</div>
</Story>
