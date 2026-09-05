<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Input } from '$stories/shadcnui/input';

	const { Story } = defineMeta({
		title: 'System/Foundation',
		parameters: { a11y: { test: 'error' } }
	});

	const tokens = [
		['brand', 'แบรนด์', 'bg-brand text-brand-foreground'],
		['success', 'สำเร็จ', 'bg-success text-success-foreground'],
		['warning', 'คำเตือน', 'bg-warning text-warning-foreground'],
		['info', 'ข้อมูล', 'bg-info text-info-foreground'],
		['neutral', 'ทั่วไป', 'bg-neutral text-neutral-foreground'],
		['destructive', 'ข้อผิดพลาด', 'bg-destructive text-destructive-foreground']
	] as const;
</script>

<Story name="Semantic foundations" asChild>
	<div class="grid gap-8 bg-background p-8 text-foreground md:grid-cols-2">
		<section class="flex flex-col gap-4">
			<h1 class="text-3xl font-semibold">ระบบพัสดุ</h1>
			<p class="text-muted-foreground">พื้นผิว ตัวอักษร รัศมี โฟกัส และสีเชิงความหมายในโหมดสว่าง</p>
			<div class="flex flex-wrap gap-2">
				{#each tokens as [token, label, classes] (token)}
					<div class={`rounded-md px-3 py-2 ${classes}`}>{label}</div>
				{/each}
			</div>
			<Input aria-label="ตัวอย่างโฟกัส" placeholder="กด Tab เพื่อดูวงแหวนโฟกัส" />
			<Input aria-label="ตัวอย่างข้อมูลไม่ถูกต้อง" aria-invalid value="ข้อมูลไม่ถูกต้อง" />
		</section>
		<section
			class="dark flex flex-col gap-4 rounded-xl bg-background p-6 text-foreground shadow-sm"
		>
			<h2 class="text-2xl font-semibold">โหมดมืด</h2>
			<p class="text-muted-foreground">สี foreground แต่ละคู่ยังอ่านได้ชัดบนพื้นหลัง semantic</p>
			<div class="flex flex-wrap gap-2">
				{#each tokens as [token, label, classes] (token)}
					<div class={`rounded-md px-3 py-2 ${classes}`}>{label}</div>
				{/each}
			</div>
		</section>
	</div>
</Story>
