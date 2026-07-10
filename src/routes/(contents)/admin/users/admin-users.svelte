<script lang="ts">
	import { getAllStudentUsers } from '$lib/rpc/user.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import AlertErrorHttpUnauthorized from '$stories/alert/alert-error-http-unauthorized.svelte';
	import UsersDataTable from './users-data-table.svelte';
	import { authClient } from '$lib/auth-client';

	const getAllStudentUsersQuery = getAllStudentUsers();
</script>

<PageWrapper groupTitle="การจัดการผู้ใช้" pageTitle="รายการผู้ใช้" groupUrl="/admin/users">
	<div class="flex flex-col gap-2">
		<h1 class="text-2xl font-bold">การจัดการผู้ใช้</h1>
		<p class="text-muted-foreground">
			จัดการบัญชีผู้ใช้ในระบบ เพิ่ม ลบ แบน และเปลี่ยนบทบาทได้ทั้งแบบทีละคนและหลายคนพร้อมกัน
		</p>
	</div>
	{#await authClient.admin.hasPermission({ permission: { user: ['list'] } })}
		<Skeleton class="h-40 w-full" />
	{:then perm}
		{#if perm.data?.success}
			{#await getAllStudentUsersQuery}
				<Skeleton class="h-40 w-full" />
			{:then _}
				<UsersDataTable {getAllStudentUsersQuery} />
			{/await}
		{:else}
			<AlertErrorHttpUnauthorized />
		{/if}
	{/await}
</PageWrapper>
