<script lang="ts">
	import { type AuthClient } from '$lib/auth-client';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import UsersDataTable from './users-data-table.svelte';
	import * as Alert from '$stories/shadcnui/alert';
	import { DoorClosedLockedIcon } from '@lucide/svelte';

	interface Props {
		authClient: AuthClient;
	}

	let { authClient }: Props = $props();
</script>

<article class="container mx-auto">
	<h1 class="mb-3 text-2xl font-bold">การจัดการผู้ใช้</h1>

	{#await authClient.admin.hasPermission({ permission: { user: ['list'] } })}
		<Skeleton class="h-6 w-32" />
	{:then perm}
		{#if perm.data?.success}
			<UsersDataTable />
		{:else}
			<Alert.Root variant="destructive" class="mb-4">
				<DoorClosedLockedIcon class="size-16" />
				<Alert.Title>การเข้าถึงถูกปฏิเสธ</Alert.Title>
				<Alert.Description>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</Alert.Description>
			</Alert.Root>
		{/if}
	{/await}
</article>
