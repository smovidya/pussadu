<script lang="ts">
	import * as Sheet from '$stories/shadcnui/sheet';
	import * as Tabs from '$stories/shadcnui/tabs';
	import Button from '$stories/shadcnui/button/button.svelte';
	import { Input } from '$stories/shadcnui/input';
	import { Label } from '$stories/shadcnui/label';
	import Textarea from '$stories/shadcnui/textarea/textarea.svelte';
	import { Spinner } from '$stories/shadcnui/spinner';
	import { CirclePlus } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { createStudentUser, bulkCreateStudentUsers } from '$lib/rpc/user.remote';
	import { isHttpError } from '@sveltejs/kit';

	let open = $state(false);

	let singleEmail = $state('');
	let singleName = $state('');

	let bulkText = $state('');

	const bulkPlaceholder =
		'6xxxxxxxxx@student.chula.ac.th,ชื่อ นามสกุล\n6xxxxxxxxx@student.chula.ac.th,ชื่อ นามสกุล';

	function parseBulkRows() {
		return bulkText
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line.length > 0)
			.map((line) => {
				const [email, name] = line.split(',').map((v) => v.trim());
				return { email, name: name || email?.split('@')[0] || '' };
			})
			.filter((row) => row.email);
	}

	async function handleSingleSubmit() {
		try {
			await createStudentUser({
				email: singleEmail,
				name: singleName || singleEmail.split('@')[0]
			});
			toast.success(`เพิ่มผู้ใช้ "${singleEmail}" เรียบร้อยแล้ว`);
			singleEmail = '';
			singleName = '';
			open = false;
		} catch (e) {
			if (isHttpError(e)) {
				toast.error(`เกิดข้อผิดพลาด: ${e.body.message}`);
				return;
			}
			toast.error(`เกิดข้อผิดพลาด: ${(e as Error).message}`);
		}
	}

	async function handleBulkSubmit() {
		const rows = parseBulkRows();
		if (rows.length === 0) {
			toast.error('โปรดกรอกอีเมลอย่างน้อย 1 รายการ');
			return;
		}
		try {
			const result = await bulkCreateStudentUsers({ rows });
			if (result.failed.length === 0) {
				toast.success(`เพิ่มผู้ใช้สำเร็จ ${result.succeeded.length} คน`);
			} else {
				toast.warning(
					`เพิ่มผู้ใช้สำเร็จ ${result.succeeded.length} คน ล้มเหลว ${result.failed.length} คน: ${result.failed
						.map((f) => `${f.email} (${f.error})`)
						.join(', ')}`
				);
			}
			bulkText = '';
			open = false;
		} catch (e) {
			if (isHttpError(e)) {
				toast.error(`เกิดข้อผิดพลาด: ${e.body.message}`);
				return;
			}
			toast.error(`เกิดข้อผิดพลาด: ${(e as Error).message}`);
		}
	}
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="default">
				<CirclePlus />
				<span>เพิ่มนิสิต</span>
			</Button>
		{/snippet}
	</Sheet.Trigger>
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>เพิ่มนิสิต</Sheet.Title>
			<Sheet.Description>
				เพิ่มบัญชีนิสิตทีละคนหรือหลายคนพร้อมกัน โดยต้องใช้อีเมล @chula.ac.th หรือ
				@student.chula.ac.th เท่านั้น
			</Sheet.Description>
		</Sheet.Header>
		<div class="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
			<Tabs.Root value="single">
				<Tabs.List class="w-full">
					<Tabs.Trigger value="single" class="flex-1">เพิ่มทีละคน</Tabs.Trigger>
					<Tabs.Trigger value="bulk" class="flex-1">เพิ่มหลายคน</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="single" class="flex flex-col gap-4">
					<div class="flex flex-col gap-1">
						<Label for="single-email">อีเมล</Label>
						<Input
							id="single-email"
							type="email"
							placeholder="6xxxxxxxxx@student.chula.ac.th"
							bind:value={singleEmail}
						/>
					</div>
					<div class="flex flex-col gap-1">
						<Label for="single-name">ชื่อ</Label>
						<Input
							id="single-name"
							placeholder="ชื่อ-นามสกุล (ถ้าไม่ระบุจะใช้ค่าเริ่มต้น)"
							bind:value={singleName}
						/>
					</div>
					<Button
						onclick={handleSingleSubmit}
						disabled={!!createStudentUser.pending || !singleEmail}
					>
						{#if createStudentUser.pending}
							<Spinner />
							<span>กำลังเพิ่ม...</span>
						{:else}
							เพิ่มนิสิต
						{/if}
					</Button>
				</Tabs.Content>
				<Tabs.Content value="bulk" class="flex flex-col gap-4">
					<div class="flex flex-col gap-1">
						<Label for="bulk-rows">รายชื่อ (บรรทัดละ 1 คน รูปแบบ: อีเมล,ชื่อ)</Label>
						<Textarea id="bulk-rows" rows={8} placeholder={bulkPlaceholder} bind:value={bulkText} />
						<p class="text-xs text-muted-foreground">
							ไม่ระบุชื่อได้ (จะใช้ส่วนหน้าอีเมลแทน) แต่ต้องมีอีเมลทุกบรรทัด
						</p>
					</div>
					<Button onclick={handleBulkSubmit} disabled={!!bulkCreateStudentUsers.pending}>
						{#if bulkCreateStudentUsers.pending}
							<Spinner />
							<span>กำลังเพิ่ม...</span>
						{:else}
							เพิ่มนิสิตทั้งหมด
						{/if}
					</Button>
				</Tabs.Content>
			</Tabs.Root>
		</div>
	</Sheet.Content>
</Sheet.Root>
