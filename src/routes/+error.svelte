<script lang="ts">
	import { page } from '$app/state';
	import BgImage from '$lib/assets/bg.jpg';
</script>

<svelte:head>
	<title>{page.error?.message || 'ข้อผิดพลาดไม่ทราบสาเหตุ'} | SMO Vidya PUSSADU</title>
</svelte:head>

<div class="relative flex h-screen w-screen flex-row items-center justify-center bg-black">
	<div
		class="flex h-full min-h-screen w-full items-center justify-center"
		style="background-image: url({BgImage});background-size: cover; background-position: center; filter: brightness(0.4) contrast(1.2) sepia(0.7);"
	></div>
	<div class="absolute flex flex-col items-center justify-center gap-4 text-center text-yellow-50">
		<h1 class="font-bold" style="font-size: 6vw; line-height: 1;">
			{page.status || 'Error'}: {page.error?.message || 'ข้อผิดพลาดไม่ทราบสาเหตุ'}
		</h1>
		<p class="max-w-md">
			ขออภัย เกิดข้อผิดพลาดขึ้นในระหว่างการประมวลผลคำขอของคุณ
			กรุณาลองอีกครั้งหรือติดต่อผู้ดูแลระบบหากปัญหายังคงมีอยู่
		</p>
	</div>
</div>
