<script lang="ts">
	import type { AuthClient } from '$lib/auth-client';
	import Button from '$stories/shadcnui/button/button.svelte';
	import BgImage from '$lib/assets/bg.jpg';
	import { Card } from '$stories/shadcnui/card';
	import { Package } from '@lucide/svelte';
	import { Skeleton } from '$stories/shadcnui/skeleton';

	interface Props {
		authClient: AuthClient;
	}

	const { authClient }: Props = $props();

	const auth = authClient.useSession();
</script>

<div
	class="flex h-full min-h-screen w-full items-center justify-center"
	style="background-image: url({BgImage}); background-size: cover; background-position: center;"
>
	<Card
		class="flex w-full max-w-md flex-col items-center justify-center gap-4 bg-background/90 p-5 backdrop-blur-sm"
	>
		<div class="items-text-center flex w-full flex-col items-center justify-center gap-2">
			<Package class="size-12" />
			<h1 class="text-2xl font-bold">ระบบพัสดุ</h1>
			<span>สโมสรนิสิตคณะวิทยาศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย</span>
			{#if $auth.data?.user}
				<Button href="/projects" class="mt-4 flex h-auto flex-row gap-3 rounded-xl px-3.5 py-2.5">
					<img src={$auth.data.user.image} alt="" class="size-8 rounded-sm" />
					<div class="flex flex-col">
						<span class="text-xs">ดำเนินการต่อในฐานะ</span>
						<span class="text-sm font-bold">{$auth.data.user.name}</span>
					</div>
				</Button>
			{:else if !$auth.data}
				<Button
					class="mt-4 w-full"
					onclick={() =>
						authClient.signIn.social({
							provider: 'google',
							callbackURL: '/projects'
						})}
				>
					เข้าสู่ระบบ
				</Button>
			{:else if $auth.isPending}
				<Skeleton class="h-9 w-full border" />
			{/if}
		</div>
	</Card>
</div>
