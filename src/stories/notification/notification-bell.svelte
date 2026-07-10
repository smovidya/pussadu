<script lang="ts">
	import { Bell } from '@lucide/svelte';
	import * as Popover from '$stories/shadcnui/popover';
	import { Button } from '$stories/shadcnui/button';
	import Badge from '$stories/shadcnui/badge/badge.svelte';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import {
		getMyNotifications,
		getMyUnreadNotificationCount,
		markNotificationRead,
		markAllNotificationsRead
	} from '$lib/rpc/notification.remote';
	import { goto } from '$app/navigation';
	import { formatRelativeTime } from '$lib/utils/datetime';
	import { cn } from '$stories/utils';

	const unreadCountQuery = getMyUnreadNotificationCount();
	const notificationsQuery = getMyNotifications();

	type Notification = NonNullable<ReturnType<typeof getMyNotifications>['current']>[number];

	let open = $state(false);

	async function handleClick(notification: Notification) {
		if (!notification.read) {
			await markNotificationRead({ id: notification.id });
		}
		open = false;
		if (notification.link) {
			// notification.link is a free-form string persisted per-notification, not a
			// compile-time-known route, so it can't be passed through resolve().
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			await goto(notification.link);
		}
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative">
				<Bell class="size-5" />
				{#await unreadCountQuery then count}
					{#if count > 0}
						<Badge
							class="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full border-0 bg-red-500 px-1 text-[10px] text-white"
						>
							{count > 9 ? '9+' : count}
						</Badge>
					{/if}
				{/await}
				<span class="sr-only">การแจ้งเตือน</span>
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-80 p-0" align="end">
		<div class="flex items-center justify-between border-b p-3">
			<span class="text-sm font-semibold">การแจ้งเตือน</span>
			<Button
				variant="ghost"
				size="sm"
				class="h-7 px-2 text-xs"
				onclick={() => markAllNotificationsRead()}
			>
				อ่านทั้งหมด
			</Button>
		</div>
		<div class="max-h-96 overflow-y-auto">
			{#await notificationsQuery}
				<div class="p-3"><Skeleton class="h-10 w-full" /></div>
			{:then notifications}
				{#each notifications as n (n.id)}
					<button
						class={cn(
							'flex w-full flex-col gap-0.5 border-b px-3 py-2 text-left last:border-0 hover:bg-muted',
							!n.read && 'bg-muted/50'
						)}
						onclick={() => handleClick(n)}
					>
						<div class="flex items-center gap-2">
							{#if !n.read}
								<span class="size-1.5 shrink-0 rounded-full bg-blue-500"></span>
							{/if}
							<span class="text-sm font-medium">{n.title}</span>
						</div>
						<span class="text-xs text-muted-foreground">{n.message}</span>
						<span class="text-[10px] text-muted-foreground">
							{n.createdAt ? formatRelativeTime(n.createdAt) : ''}
						</span>
					</button>
				{:else}
					<p class="p-4 text-center text-sm text-muted-foreground">ไม่มีการแจ้งเตือน</p>
				{/each}
			{/await}
		</div>
	</Popover.Content>
</Popover.Root>
