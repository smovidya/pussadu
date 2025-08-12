<script lang="ts">
	import * as NavigationMenu from '$stories/shadcnui/navigation-menu';
	import * as Avatar from '$stories/shadcnui/avatar';
	import * as Sheet from '$stories/shadcnui/sheet';
	import Button from '$stories/shadcnui/button/button.svelte';
	import { Badge } from '$stories/shadcnui/badge';
	import { Separator } from '$stories/shadcnui/separator';
	import { Package, LogOut, Settings, BookOpen, User, Menu } from '@lucide/svelte';
	import type { AuthClient } from '$lib/auth-client';
	import { cn } from '$stories/utils';

	interface Props {
		authClient: AuthClient;
		currentPath?: string;
	}

	let { authClient, currentPath = '/' }: Props = $props();

	const auth = authClient.useSession();
	let mobileMenuOpen = $state(false);

	const handleLogout = async () => {
		try {
			await authClient.signOut();
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	const navItems = [
		{
			href: '/projects',
			label: 'เลือกโครง',
			icon: BookOpen
		},
		{
			href: '/my-borrowing',
			label: 'การยืมของฉัน',
			icon: User
		},
		{
			href: '/admin',
			label: 'ผู้ดูแลระบบ',
			icon: Settings
		}
	];

	const isActive = (path: string) => currentPath?.startsWith(path);
</script>

<nav
	class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="container mx-auto flex h-16 items-center justify-between px-4">
		<!-- Logo Section -->
		<div class="flex items-center space-x-3">
			<a href="/" class="flex items-center space-x-2 transition-opacity hover:opacity-80">
				<div
					class="flex aspect-square size-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-md"
				>
					<Package class="size-6 text-white" />
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
		</div>

		<!-- Desktop Navigation Menu -->
		<div class="hidden items-center space-x-6 md:flex">
			<NavigationMenu.Root>
				<NavigationMenu.List class="flex space-x-2">
					{#each navItems as item (item.href)}
						<NavigationMenu.Item>
							<NavigationMenu.Link
								href={item.href}
								class={cn(
									'group inline-flex items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors **:w-max hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50'
								)}
								data-active={isActive(item.href)}
							>
								{item.label}
							</NavigationMenu.Link>
						</NavigationMenu.Item>
					{/each}
				</NavigationMenu.List>
			</NavigationMenu.Root>
		</div>

		<!-- User Section -->
		<div class="flex items-center space-x-4">
			{#if $auth.data?.user}
				<!-- User Info -->
				<div class="hidden flex-col text-right lg:flex">
					<span class="text-sm font-medium">{$auth.data.user.name}</span>
					<div class="flex items-center justify-end space-x-1">
						<Badge variant="secondary" class="px-1.5 py-0.5 text-xs">
							{$auth.data.user.ouid}
						</Badge>
					</div>
				</div>

				<!-- Logout Button -->
				<Button
					variant="ghost"
					size="sm"
					onclick={handleLogout}
					class="text-red-600 hover:bg-red-50 hover:text-red-700"
				>
					<LogOut />
					<span class="hidden sm:inline">ออกจากระบบ</span>
				</Button>
			{:else}
				<Button href="/" size="sm">เข้าสู่ระบบ</Button>
			{/if}

			<Sheet.Root bind:open={mobileMenuOpen}>
				<Sheet.Trigger>
					<Button variant="ghost" size="icon" class="md:hidden">
						<Menu />
					</Button>
				</Sheet.Trigger>
				<Sheet.Content side="right">
					<div class="flex flex-col space-y-2 p-4">
						<!-- User Info -->
						{#if $auth.data?.user}
							<div class="flex items-center space-x-3">
								<Avatar.Root>
									<Avatar.Image src={$auth.data.user.image} alt="Avatar" />
									<Avatar.Fallback>
										{$auth.data.user.name.charAt(0).toUpperCase()}
									</Avatar.Fallback>
								</Avatar.Root>
								<div>
									<p class="text-sm font-medium">{$auth.data.user.name}</p>
									<Badge variant="secondary" class="text-xs">
										{$auth.data.user.ouid}
									</Badge>
								</div>
							</div>
							<Separator />
						{/if}

						<!-- Navigation Items -->
						{#each navItems as item (item.href)}
							<a
								href={item.href}
								class="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
								class:bg-accent={isActive(item.href)}
								onclick={() => (mobileMenuOpen = false)}
							>
								<item.icon class="size-4" />
								<span>{item.label}</span>
							</a>
						{/each}

						{#if $auth.data?.user}
							<Separator />
							<Button
								variant="ghost"
								onclick={() => {
									handleLogout();
									mobileMenuOpen = false;
								}}
								class="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
							>
								<LogOut class="mr-2 h-4 w-4" />
								ออกจากระบบ
							</Button>
						{/if}
					</div>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>
</nav>
