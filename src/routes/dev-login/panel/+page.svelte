<script lang="ts">
	import { dev } from '$app/environment';
	import { Button } from '$stories/shadcnui/button';
	import { Input } from '$stories/shadcnui/input';
	import { Label } from '$stories/shadcnui/label';
	import * as Card from '$stories/shadcnui/card';

	type Role = 'admin' | 'staff' | 'user';

	const presets: { role: Role; ouid: string; label: string }[] = [
		{ role: 'admin', ouid: '9990000001', label: 'เข้าสู่ระบบเป็น Admin (dev)' },
		{ role: 'staff', ouid: '9990000002', label: 'เข้าสู่ระบบเป็น Staff (dev)' },
		{ role: 'user', ouid: '9990000003', label: 'เข้าสู่ระบบเป็นนิสิต (dev)' }
	];

	let customOuid = $state('');
	let customRole = $state<Role>('user');
</script>

<svelte:head>
	<title>Dev Login</title>
</svelte:head>

{#if dev}
	<div class="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-4">
		<div class="rounded-md border border-yellow-400 bg-yellow-50 p-3 text-sm text-yellow-800">
			<strong>DEV ONLY</strong> - หน้านี้ใช้ได้เฉพาะตอนรัน <code>npm run dev</code> เท่านั้น
			สร้าง/สลับบัญชีทดสอบโดยไม่ต้องผ่าน Google OAuth จริง (ใช้ตรงผ่าน URL/curl ได้ที่
			<code>/dev-login?ouid=...&role=...</code>)
		</div>

		<Card.Root>
			<Card.Header>
				<Card.Title>สลับผู้ใช้ทดสอบด่วน</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-2">
				{#each presets as preset (preset.ouid)}
					<Button variant="outline" href="/dev-login?ouid={preset.ouid}&role={preset.role}">
						{preset.label}
					</Button>
				{/each}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>กำหนดเอง</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-3">
				<div class="flex flex-col gap-1">
					<Label for="ouid">เลขนิสิต (6-10 หลัก)</Label>
					<Input id="ouid" placeholder="6xxxxxxxxx" bind:value={customOuid} />
				</div>
				<div class="flex flex-col gap-1">
					<Label for="role">บทบาท</Label>
					<select
						id="role"
						class="h-9 rounded-md border border-input bg-background px-3 text-sm"
						bind:value={customRole}
					>
						<option value="admin">admin</option>
						<option value="staff">staff</option>
						<option value="user">user</option>
					</select>
				</div>
				<Button
					disabled={!/^\d{6,10}$/.test(customOuid)}
					href="/dev-login?ouid={customOuid}&role={customRole}"
				>
					เข้าสู่ระบบ
				</Button>
			</Card.Content>
		</Card.Root>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center">
		<p class="text-muted-foreground">ไม่พบหน้านี้</p>
	</div>
{/if}
