<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Nav from './nav.svelte';

	const { Story } = defineMeta({
		title: 'Components/Nav',
		component: Nav
	});
</script>

<!-- Documentation for the Normal story -->
<Story name="Normal" />
