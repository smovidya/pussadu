<script lang="ts">
	import { type AuthClient } from '$lib/auth-client';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import UsersDataTable from './borrowers-data-table.svelte';

	interface Props {
		authClient: AuthClient;
	}

	let { authClient }: Props = $props();
</script>

<article class="container mx-auto my-5">
	<h1 class="text-2xl font-bold">การจัดการผู้ใช้</h1>

	{#await authClient.admin.hasPermission({ permission: { user: ['list'] } })}
		<Skeleton class="h-6 w-32" />
	{:then perm}
		{#if perm.data?.success}
			<UsersDataTable />
		{:else}
			<p>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
			<pre>{JSON.stringify(perm.data, null, 2)}</pre>
		{/if}
	{/await}
</article>
