---
to: src/stories/<%= h.changeCase.param(name) %>/<%= h.changeCase.param(name) %>.stories.svelte
---
<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import <%= h.changeCase.pascal(name) %> from './<%= h.changeCase.param(name) %>.svelte';

	const { Story } = defineMeta({
		title: 'Components/<%= h.changeCase.pascal(name) %>',
		component: <%= h.changeCase.pascal(name) %>
	});
</script>

<!-- Documentation for the Normal story -->
<Story
	name="Normal"
/>
