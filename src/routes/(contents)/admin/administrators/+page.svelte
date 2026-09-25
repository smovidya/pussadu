<script lang="ts">
	import { resolve } from '$app/paths';
	import { listAdministrators } from '$lib/rpc/administrator.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import PageHeader from '$stories/page-header/page-header.svelte';
	import { Button } from '$stories/shadcnui/button';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import * as Card from '$stories/shadcnui/card';
	import * as Empty from '$stories/shadcnui/empty';
	import * as Alert from '$stories/shadcnui/alert';
	import StatusBadge from '$stories/status-badge/status-badge.svelte';
	import AddAdministratorSheet from './add-administrator-sheet.svelte';

	const administrators = listAdministrators();
</script>

<PageWrapper groupTitle="แอดมิน" pageTitle="ผู้ดูแลระบบ" groupUrl="/admin/administrators">
	<PageHeader title="ผู้ดูแลระบบ" description="รายชื่อบัญชีที่มีสิทธิ์จัดการระบบพัสดุ">
		{#snippet actions()}<AddAdministratorSheet />{/snippet}
	</PageHeader>
	{#await administrators.ready ? administrators.current : administrators}
		<Skeleton class="h-48 w-full [animation-duration:700ms] motion-reduce:animate-none" />
	{:then accounts}
		<p class="text-sm text-muted-foreground" aria-live="polite">
			ผู้ดูแลระบบทั้งหมด {accounts?.length ?? 0} คน
		</p>
		<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each accounts ?? [] as account (account.id)}
				<Card.Root class="min-w-0">
					<Card.Header>
						<Card.Title class="break-words">{account.name}</Card.Title>
						<Card.Description class="break-all">{account.email}</Card.Description>
					</Card.Header>
					<Card.Content class="flex flex-wrap items-center gap-2">
						<StatusBadge tone="neutral">ผู้ดูแลระบบ</StatusBadge>
						{#if account.banned}<StatusBadge tone="destructive">บัญชีถูกระงับ</StatusBadge>{/if}
						{#if account.ouid}<span class="text-sm text-muted-foreground">{account.ouid}</span>{/if}
					</Card.Content>
					<Card.Footer>
						<Button
							variant="outline"
							size="sm"
							href={resolve('/admin/people') + '?query=' + encodeURIComponent(account.email)}
							>ดูข้อมูลบุคคล</Button
						>
					</Card.Footer>
				</Card.Root>
			{:else}
				<Empty.Root class="col-span-full"
					><Empty.Header
						><Empty.Title>ยังไม่มีผู้ดูแลระบบ</Empty.Title><Empty.Description
							>เพิ่มผู้ดูแลระบบจากปุ่มด้านบน</Empty.Description
						></Empty.Header
					></Empty.Root
				>
			{/each}
		</div>
	{:catch}
		<Alert.Root variant="destructive"
			><Alert.Title>โหลดรายชื่อไม่สำเร็จ</Alert.Title><Alert.Description
				><Button variant="outline" onclick={() => administrators.refresh()}>ลองอีกครั้ง</Button
				></Alert.Description
			></Alert.Root
		>
	{/await}
</PageWrapper>
