<script lang="ts">
	import { listBorrowed } from '$lib/rpc/borrowing.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
</script>

<PageWrapper pageTitle="รายการยืมของฉัน" groupTitle="ยืมพัสดุ" groupUrl="/projects">
	{#await listBorrowed()}
		<p>Loading...</p>
	{:then borrowedItems}
		<ul>
			{#each borrowedItems as item}
				<li>{item.asset.name}</li>
			{/each}
		</ul>
	{/await}
</PageWrapper>
