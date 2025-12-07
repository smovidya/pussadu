<script lang="ts">
	import { type AuthClient } from '$lib/auth-client';
	import AlertErrorHttpUnauthorized from '$stories/alert/alert-error-http-unauthorized.svelte';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import UsersDataTable from './borrowers-data-table.svelte';

	interface Props {
		authClient: AuthClient;
	}

	let { authClient }: Props = $props();
</script>

<PageWrapper pageTitle="การจัดการผู้ยืม" groupTitle="ผู้ยืม" groupUrl="/admin/borrowers">
	<article class="container mx-auto my-5 flex flex-col gap-4">
		<h1 class="text-2xl font-bold">การจัดการผู้ยืม</h1>
		{#await authClient.admin.hasPermission({ permission: { user: ['list'] } })}
			<Skeleton class="h-6 w-32" />
		{:then perm}
			{#if perm.data?.success}
				<UsersDataTable />
			{:else}
				<AlertErrorHttpUnauthorized />
			{/if}
		{/await}
	</article>
</PageWrapper>
