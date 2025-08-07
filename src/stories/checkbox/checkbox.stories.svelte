<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Checkbox from './checkbox.svelte';
	import { fn } from 'storybook/test';

	// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Components/Checkbox',
		component: Checkbox,
		tags: ['autodocs'],
		argTypes: {
			disabled: {
				control: { type: 'boolean' },
				description: 'Disabled state of the checkbox',
				table: {
					type: { summary: 'boolean' },
					defaultValue: { summary: 'false' }
				}
			},
			onCheckChange: {
				action: 'onCheckChange',
				description: 'Callback when the checkbox state changes',
				table: {
					type: { summary: '(isChecked: boolean) => void' },
					defaultValue: { summary: 'undefined' }
				},
				control: { type: 'function' }
			},
			labelText: {
				control: { type: 'text' },
				description: 'Label text for the checkbox',
				table: {
					type: { summary: 'string' },
					defaultValue: { summary: '' }
				}
			},
			checked: {
				control: { type: 'boolean' },
				description: 'Checked state of the checkbox',
				table: {
					type: { summary: 'boolean' },
					defaultValue: { summary: 'false' }
				}
			}
		},
		args: {
			disabled: false,
			checked: false,
			onCheckChange: fn()
		}
	});
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
	name="Primary"
	args={{
		labelText: 'Checkbox',
		checked: false,
		disabled: false
	}}
/>
