<script lang="ts">
	import type { AuthClient } from '$lib/auth-client';
	import Button from '$stories/shadcnui/button/button.svelte';
	import BgImage from '$lib/assets/bg.jpg';
	import { Card } from '$stories/shadcnui/card';
	import { Package } from '@lucide/svelte';

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
				<Button href="/projects" class="mt-4 w-full">ไปยังแดชบอร์ด</Button>
			{:else}
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
			{/if}
		</div>
	</Card>
</div>
