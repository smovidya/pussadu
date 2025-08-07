<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from './button.svelte';
	import { fn } from 'storybook/test';

	const { Story } = defineMeta({
		title: 'Components/Button',
		component: Button,
		argTypes: {
			disabled: { control: 'boolean' },
			label: { control: 'text' },
			onclick: { action: 'clicked', description: 'Function to call when the button is clicked' }
		},
		args: {
			onclick: fn()
		}
	});
</script>

<!-- An example of a normal button -->
<Story
	name="Normal"
	args={{
		label: 'Click Me'
	}}
/>
