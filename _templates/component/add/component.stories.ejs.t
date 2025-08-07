---
to: src/stories/<%= h.changeCase.param(componentName) %>/<%= h.changeCase.param(subComponentName) %>.stories.svelte
---
<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import <%= h.changeCase.pascal(subComponentName) %> from './<%= h.changeCase.param(subComponentName) %>.svelte';

	const { Story } = defineMeta({
		title: 'Components/<%= h.changeCase.pascal(componentName) %>/<%= h.changeCase.pascal(subComponentName) %>',
		component: <%= h.changeCase.pascal(subComponentName) %>
	});
</script>

<!-- Documentation for the Normal story -->
<Story
	name="Normal"
/>
