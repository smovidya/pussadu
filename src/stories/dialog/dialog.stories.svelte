<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Dialog from '.';
	import '../../app.css';

	const { Story } = defineMeta({
		title: 'Components/Dialog',
		component: Dialog
	});
</script>

<Story name="Normal" args={{ children, title: 'Windows title', open: true }} />

<Story
	name="Custom windows control"
	args={{ children: children2, title: 'Custom windows control', windowsControls }}
/>

{#snippet windowsControls()}
	<button> Custom section </button>
{/snippet}

{#snippet children()}
	<div>Windows content</div>
{/snippet}

{#snippet children2()}
	<div>Windows content</div>
	<p>
		We're no strangers to love You know the rules and so do I (do I) A full commitment's what I'm
		thinking of You wouldn't get this from any other guy I just wanna tell you how I'm feeling Gotta
		make you understand Never gonna give you up Never gonna let you down Never gonna run around and
		desert you Never gonna make you cry Never gonna say goodbye Never gonna tell a lie and hurt
	</p>
{/snippet}
