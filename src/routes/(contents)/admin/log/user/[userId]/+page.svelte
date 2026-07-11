<script lang="ts">
	import { page } from '$app/state';
	import { getUserProfile } from '$lib/rpc/user.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';
	import LogTable from '$stories/log/log-table.svelte';
	import * as Card from '$stories/shadcnui/card';
	import * as Tabs from '$stories/shadcnui/tabs';
	import * as Avatar from '$stories/shadcnui/avatar';
	import Badge from '$stories/shadcnui/badge/badge.svelte';
	import { userRoleOptions, userStatusOptions } from '$lib/constants';
	import { formatDate } from '$lib/utils/datetime';
	import { cn } from '$stories/utils';

	let userId = $derived(page.params.userId ?? '');
</script>

<PageWrapper pageTitle="ประวัติผู้ใช้" groupTitle="ประวัติการดำเนินการ" groupUrl="/admin/log">
	<div class="container mx-auto flex flex-col gap-4 py-10">
		<AsyncHttpBoundary dataLoader={getUserProfile({ userId })}>
			{#snippet children(user)}
				{#if user}
					{@const role = userRoleOptions.find((r) => r.value === user.role)}
					{@const status = userStatusOptions.find(
						(s) => s.value === (user.banned ? 'banned' : 'active')
					)}
					<Card.Root>
						<Card.Content class="flex flex-wrap items-center gap-4">
							<Avatar.Root class="size-14">
								<Avatar.Fallback class="text-lg">
									{user.name?.trim()?.[0]?.toUpperCase() ?? '?'}
								</Avatar.Fallback>
							</Avatar.Root>
							<div class="flex min-w-0 flex-col gap-0.5">
								<div class="flex flex-wrap items-center gap-2">
									<h1 class="text-xl font-bold">{user.name}</h1>
									{#if role}
										<Badge class={cn('border-0 font-normal', role.color)}>{role.label}</Badge>
									{/if}
									{#if status}
										<Badge class={cn('border-0 font-normal', status.color)}>{status.label}</Badge>
									{/if}
								</div>
								<p class="text-sm text-muted-foreground">{user.email}</p>
								<p class="text-xs text-muted-foreground">
									{#if user.ouid}
										<code class="rounded bg-muted px-1.5 py-0.5">{user.ouid}</code>
										·
									{/if}
									สมาชิกตั้งแต่ {formatDate(user.createdAt)}
								</p>
							</div>
						</Card.Content>
					</Card.Root>

					<Tabs.Root value="by-user">
						<Tabs.List>
							<Tabs.Trigger value="by-user">การกระทำของผู้ใช้</Tabs.Trigger>
							<Tabs.Trigger value="about-user">ประวัติที่เกี่ยวกับผู้ใช้</Tabs.Trigger>
						</Tabs.List>
						<Tabs.Content value="by-user" class="pt-2">
							{#if user.ouid}
								<LogTable fixed={{ actor: user.ouid }} hideColumns={['actor']} />
							{:else}
								<p class="py-8 text-center text-muted-foreground">
									ผู้ใช้นี้ยังไม่มีรหัสนิสิต (ouid) จึงไม่มีประวัติการกระทำในระบบ
								</p>
							{/if}
						</Tabs.Content>
						<Tabs.Content value="about-user" class="pt-2">
							<LogTable fixed={{ targetContains: userId }} />
						</Tabs.Content>
					</Tabs.Root>
				{:else}
					<p class="py-8 text-center text-muted-foreground">
						ไม่พบผู้ใช้ <code class="rounded bg-muted px-1.5 py-0.5 text-xs">{userId}</code>
					</p>
				{/if}
			{/snippet}
		</AsyncHttpBoundary>
	</div>
</PageWrapper>
