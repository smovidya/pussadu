<script lang="ts" module></script>

<script lang="ts">
	import { Package2Icon, PlusIcon } from '@lucide/svelte';
	import * as Sidebar from '../shadcnui/sidebar';
	import * as DropdownMenu from '../shadcnui/dropdown-menu';
	import type { ComponentProps } from 'svelte';
	import Button from '$stories/shadcnui/button/button.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

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
		allowRole: string;
		items: Item[];
	}

	const data: Group[] = [
		{
			title: 'ยืมพัสดุ',
			allowRole: 'user',
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
			title: 'จัดการพัสดุ',
			allowRole: 'admin',
			items: [
				{
					title: 'รายการพัสดุ',
					url: '/admin/assets'
				},
				{
					title: 'หมวดหมู่พัสดุ',
					url: '/admin/categories'
				}
			]
		},
		{
			title: 'จัดการโครงการ',
			allowRole: 'admin',
			items: [
				{
					title: 'รายการโครงการ',
					url: '/admin/projects',
					rightAction: {
						icon: PlusIcon,
						href: '/admin/projects/new'
					}
				}
			]
		}
	];
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<a href="/" class="flex items-center space-x-2 transition-opacity hover:opacity-80">
			<div
				class="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-md"
			>
				<Package2Icon class="size-4 text-white" />
			</div>
			<div class="hidden sm:block">
				<h2
					class="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-lg font-bold text-transparent"
				>
					ระบบพัสดุ
				</h2>
				<p class="-mt-1 text-xs text-muted-foreground">สโมสรนิสิตคณะวิทยาศาสตร์ จุฬาฯ</p>
			</div>
		</a>
	</Sidebar.Header>
	<Sidebar.Content>
		<!-- We create a Sidebar.Group for each parent. -->
		{#each data.filter((v) => $auth.data?.user.role
				?.split(',')
				.includes(v.allowRole)) as group (group.title)}
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
												<Button variant="outline" size="icon" href={item.rightAction.href}>
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
		{#if $auth.data?.user}
			<div class="flex flex-row justify-between">
				<div class="flex flex-row gap-2">
					<img
						src={$auth.data.user.image}
						class="size-10 rounded-2xl border"
						alt={$auth.data.user.name}
					/>
					<div class="flex flex-col text-sm">
						<span class="text-md">
							{$auth.data.user.name}
							{#if $auth.data.user.role?.split(',').includes('admin')}
								<span class="text-xs text-muted-foreground">(Admin)</span>
							{/if}
						</span>
						<span>
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
							<!-- <DropdownMenu.Label>My Account</DropdownMenu.Label> -->
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								variant="destructive"
								onclick={async () => {
									await authClient.signOut();
									await goto('/');
								}}
							>
								ออกจากระบบ
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</div>
		{:else}
			<Button
				onclick={async () => {
					await goto('/');
				}}>เข้าสู่ระบบ</Button
			>
		{/if}
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
