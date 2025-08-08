<script>
	import BgImage from '$lib/assets/bg.png';
	import { authClient } from '$lib/auth-client';
	import * as Dialog from '$stories/dialog';
</script>

<svelte:head>
	<title>ระบบพัสดุ | SMO Vidya Chula</title>
</svelte:head>

{#snippet controls()}
	<!-- <Dialog.Minimize /> -->
	<Dialog.Close disabled />
{/snippet}

<div>
	<img src={BgImage} alt="Background" class="absolute inset-0 h-full w-full object-cover" />
	<Dialog.Root open>
		<Dialog.Window
			overlayProps={{
				hidden: true
			}}
		>
			<Dialog.Titlebar {controls}>ระบบพัสดุ | SMO Vidya Chula</Dialog.Titlebar>
			<Dialog.Body>
				<article class="flex flex-col justify-center gap-2 p-3">
					<h1 class="my-1 text-2xl">ระบบพัสดุ</h1>
					<span>สโมสรนิสิตคณะวิทยาศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย</span>
					<span>เข้าสู่ระบบโดยเลือกอีเมล @student.chula.ac.th หรือ @chula.ac.th เท่านั้น</span>
				</article>
				<div class="m-4 flex flex-col items-end justify-end gap-1">
					<button
						onclick={async () =>
							await authClient.signIn.social({
								provider: 'google'
							})}
					>
						เข้าสู่ระบบ
					</button>
				</div>
			</Dialog.Body>
		</Dialog.Window>
	</Dialog.Root>
</div>
