<script>
	import { authClient } from '$lib/auth-client';
	import Button from '$stories/shadcnui/button/button.svelte';
	import BgImage from '$lib/assets/bg.jpg';
	import { Card } from '$stories/shadcnui/card';
	import { Package } from '@lucide/svelte';
</script>

<div
	class="flex h-full w-full items-center justify-center"
	style="background-image: url({BgImage}); background-size: cover; background-position: center;"
>
	<Card class="flex w-full max-w-md flex-col items-center justify-center gap-4 p-6">
		<div class="flex flex-col items-center justify-center gap-2">
			<Package class="h-12 w-12" />
			<h1 class="text-2xl font-bold">ระบบพัสดุ</h1>
			<span>สโมสรนิสิตคณะวิทยาศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย</span>
			<Button
				onclick={() =>
					authClient.signIn.social({
						provider: 'google',
						callbackURL: '/dashboard'
					})}
			>
				เข้าสู่ระบบ
			</Button>
		</div>
	</Card>
</div>
