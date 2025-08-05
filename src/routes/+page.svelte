<script>
	import { hello } from '$lib/rpc/hello.remote';
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<h1>
	Rpc:
	{#await hello()}
		<span>loading...</span>
	{:then text}
		{text}
	{/await}
</h1>
