<script lang="ts">
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button } from '$stories/shadcnui/button';
	import ThemeToggle from '$stories/theme-toggle/theme-toggle.svelte';
	import { LifeBuoy, Package2Icon, PlusIcon } from '@lucide/svelte';
	import type { ComponentProps } from 'svelte';
	import * as DropdownMenu from '../shadcnui/dropdown-menu';
	import * as Sidebar from '../shadcnui/sidebar';

	type Props = ComponentProps<typeof Sidebar.Root>;
	let { ref = $bindable(null), ...restProps }: Props = $props();

	import { authClient } from '$lib/auth-client';
	const auth = authClient.useSession();

	interface RightAction {
		icon: typeof PlusIcon;
		href: string;
	}
	interface Item {
		title: string;
		url: string;
		rightAction?: RightAction;
	}
	interface Group {
		title: string;
		allowRoles: string[];
		items: Item[];
	}

	const data: Group[] = [
		{
			title: 'ยืมพัสดุ',
			allowRoles: ['user', 'admin'],
			items: [
				{
					title: 'เริ่มยืม',
					url: '/projects'
				},
				{
					title: 'รายการยืมของฉัน',
					url: '/my-borrowing'
				},
				{
					title: 'รายการพัสดุที่ยืมได้',
					url: '/assets'
				}
			]
		},
		{
			title: 'แอดมิน',
			allowRoles: ['admin', 'staff'],
			items: [
				{
					title: 'จัดการผู้ใช้',
					url: '/admin/users'
				},
				{
					title: 'รายการยืม',
					url: '/admin/approval'
				},
				{
					title: 'รายการโครงการ',
					url: '/admin/projects',
					rightAction: {
						icon: PlusIcon,
						href: '/admin/projects/new'
					}
				},
				{
					title: 'ประวัติการดำเนินการ (Logs)',
					url: '/admin/log'
				}
			]
		}
	];
</script>

<!-- Navigation data is runtime-configured, so its links cannot use typed resolve(). -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->
<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<a href={resolve('/')} class="flex items-center gap-2 transition-opacity hover:opacity-80">
			<div
				class="flex size-8 items-center justify-center rounded-lg bg-brand text-brand-foreground shadow-sm"
			>
				<Package2Icon />
			</div>
			<div>
				<h2 class="text-lg font-bold text-sidebar-foreground">ระบบพัสดุ</h2>
				<p class="-mt-1 text-xs text-muted-foreground">สโมสรนิสิตคณะวิทยาศาสตร์ จุฬาฯ</p>
			</div>
		</a>
	</Sidebar.Header>
	<Sidebar.Content>
		<!-- We create a Sidebar.Group for each parent. -->
		{#each data.filter((v) => v.allowRoles.some((role) => $auth.data?.user.role
					?.split(',')
					.includes(role))) as group (group.title)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each group.items as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={page.url.pathname === item.url}>
									{#snippet child({ props })}
										<div class="flex flex-row items-center justify-between gap-1">
											<a href={item.url} {...props}>{item.title}</a>
											{#if item.rightAction}
												<Button
													variant="outline"
													size="icon"
													href={item.rightAction.href}
													aria-label={`สร้าง${item.title}ใหม่`}
												>
													<item.rightAction.icon />
												</Button>
											{/if}
										</div>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/each}
	</Sidebar.Content>
	<Sidebar.Footer>
		<ThemeToggle />
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton>
					{#snippet child({ props })}
						<a
							href="https://it-smovidya-chula.notion.site/26781e17c554805696a0c3a496fbf9d4"
							{...props}
						>
							<LifeBuoy />
							คู่มือการใช้งาน
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
		{#if $auth.data?.user}
			<div class="flex flex-row justify-between">
				<div class="flex flex-row gap-2">
					<img
						src={$auth.data.user.image}
						class="size-10 rounded-2xl outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
						alt={$auth.data.user.name}
					/>
					<div class="flex flex-col text-sm">
						<span class="text-md">
							{$auth.data.user.name}
							{#if $auth.data.user.role?.split(',').includes('admin')}
								<span class="text-xs text-muted-foreground">(Admin)</span>
							{/if}
						</span>
						<span class="tabular-nums">
							{$auth.data.user.ouid}
						</span>
					</div>
				</div>
				<div class="flex items-center">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Button {...props} size="sm" variant="outline">เปิดเมนู</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-56" align="start">
							<DropdownMenu.Group>
								<DropdownMenu.Label>บัญชีผู้ใช้</DropdownMenu.Label>
								<DropdownMenu.Item
									variant="destructive"
									onclick={async () => {
										await authClient.signOut();
										await goto(resolve('/'));
									}}
								>
									ออกจากระบบ
								</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</div>
		{:else}
			<Button
				onclick={async () => {
					await goto(resolve('/'));
				}}>เข้าสู่ระบบ</Button
			>
		{/if}
		<div
			class="w-full content-center items-start justify-center text-center text-xs text-muted-foreground/70"
		>
			{__APP_VERSION__}{dev ? ' (dev)' : ''} - {__APP_LASTMOD__}
		</div>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
