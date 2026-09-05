<script lang="ts">
	import { type AuthClient } from '$lib/auth-client';
	import AlertErrorHttpUnauthorized from '$stories/alert/alert-error-http-unauthorized.svelte';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import UsersDataTable from './borrowers-data-table.svelte';
	import PageHeader from '$stories/page-header/page-header.svelte';

	interface Props {
		authClient: AuthClient;
	}

	let { authClient }: Props = $props();
</script>

<PageWrapper pageTitle="การจัดการผู้ยืม" groupTitle="ผู้ยืม" groupUrl="/admin/borrowers">
	<article class="flex flex-col gap-6">
		<PageHeader title="การจัดการผู้ยืม" description="จัดการข้อมูลนิสิตที่มีสิทธิ์ยืมพัสดุ" />
		{#await authClient.admin.hasPermission({ permission: { borrower: ['list'] } })}
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
