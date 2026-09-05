<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import DataTableDemo from './data-table-demo.svelte';

	const { Story } = defineMeta({
		title: 'System/DataTable controls',
		component: DataTableDemo,
		parameters: { a11y: { test: 'error' } }
	});

	const exerciseTable = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const canvas = within(canvasElement);
		const search = canvas.getByPlaceholderText('ค้นหาโครงการ');
		await userEvent.type(search, '12');
		await expect(canvas.getByText('โครงการวิทยาศาสตร์ 12')).toBeInTheDocument();
		await expect(canvas.queryByText('โครงการวิทยาศาสตร์ 1')).not.toBeInTheDocument();
		await userEvent.click(canvas.getByRole('button', { name: /รีเซ็ต/ }));
		await expect(search).toHaveValue('');
		await userEvent.click(canvas.getByRole('button', { name: 'ไปหน้าถัดไป' }));
		await expect(canvas.getByText(/หน้า 2 จาก/)).toBeInTheDocument();
	};
</script>

<Story name="Search filters reset visibility and pagination" play={exerciseTable} />
<Story name="Empty state" args={{ empty: true }} />
