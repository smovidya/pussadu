<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from 'storybook/test';
	import { ModeWatcher } from 'mode-watcher';
	import ThemeToggle from './theme-toggle.svelte';

	const { Story } = defineMeta({
		title: 'System/ThemeToggle',
		component: ThemeToggle,
		parameters: { a11y: { test: 'error' } }
	});

	const verifyChoices = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'เลือกธีมสี' }));
		const page = within(document.body);
		await expect(page.getByText('สว่าง')).toBeInTheDocument();
		await expect(page.getByText('มืด')).toBeInTheDocument();
		await userEvent.click(page.getByText('ตามระบบ'));
		await expect(localStorage.getItem('mode-watcher-mode')).toBe('system');
	};
</script>

<Story name="Light dark and system" asChild play={verifyChoices}>
	<ModeWatcher defaultMode="system" />
	<div class="w-56 rounded-lg border bg-sidebar p-2 text-sidebar-foreground">
		<ThemeToggle />
	</div>
</Story>
