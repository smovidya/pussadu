<script lang="ts">
	import type { Snippet } from 'svelte';
	import { isHttpError } from '@sveltejs/kit';
	import { Pencil, Save } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { updateBorrowerInfo } from '$lib/rpc/borrower.remote';
	import { setStudentUserRole } from '$lib/rpc/user.remote';
	import { Button } from '$stories/shadcnui/button';
	import * as Field from '$stories/shadcnui/field';
	import { Input } from '$stories/shadcnui/input';
	import * as Select from '$stories/shadcnui/select';
	import * as Sheet from '$stories/shadcnui/sheet';
	import { Spinner } from '$stories/shadcnui/spinner';

	type Person = {
		userId: string | null;
		ouid: string | null;
		name: string;
		email: string;
		phone: string | null;
		lineId: string | null;
		departmentId: string | null;
		borrowingEligibility: 'eligible' | 'suspended' | null;
		globalRoles: string[];
	};

	type Department = { id: string; name: string };

	interface Props {
		person: Person;
		departments: Department[];
		trigger?: Snippet<[{ props: Record<string, unknown> }]>;
		onSaved: () => void | Promise<void>;
	}

	let { person, departments, trigger, onSaved }: Props = $props();
	let open = $state(false);
	let saving = $state(false);
	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let lineId = $state('');
	let departmentId = $state('');
	let role = $state<'admin' | 'staff' | 'user'>('user');

	const hasBorrower = $derived(person.borrowingEligibility !== null && !!person.ouid);
	const hasAccount = $derived(!!person.userId);

	function getPrimaryRole(roles: string[]): 'admin' | 'staff' | 'user' {
		if (roles.includes('admin')) return 'admin';
		if (roles.includes('staff')) return 'staff';
		return 'user';
	}

	function resetForm() {
		name = person.name;
		email = person.email;
		phone = person.phone ?? '';
		lineId = person.lineId ?? '';
		departmentId = person.departmentId ?? '';
		role = getPrimaryRole(person.globalRoles);
	}

	async function save() {
		if (hasBorrower && (!name.trim() || !email.trim() || !phone.trim() || !lineId.trim())) {
			toast.error('กรอกข้อมูลติดต่อให้ครบ');
			return;
		}
		if (hasBorrower && !departmentId) {
			toast.error('เลือกภาควิชา');
			return;
		}

		saving = true;
		try {
			if (hasBorrower && person.ouid) {
				await updateBorrowerInfo({
					ouid: person.ouid,
					name: name.trim(),
					email: email.trim(),
					phone: phone.trim(),
					line_id: lineId.trim(),
					departmentId
				});
			}
			if (hasAccount && person.userId && role !== getPrimaryRole(person.globalRoles)) {
				await setStudentUserRole({ id: person.userId, role });
			}
			await onSaved();
			toast.success(`บันทึกข้อมูลของ ${person.name || person.email} แล้ว`);
			open = false;
		} catch (error) {
			toast.error(
				isHttpError(error)
					? error.body.message
					: error instanceof Error
						? error.message
						: 'บันทึกข้อมูลไม่สำเร็จ'
			);
		} finally {
			saving = false;
		}
	}
</script>

<Sheet.Root
	bind:open
	onOpenChange={(nextOpen) => {
		if (nextOpen) resetForm();
	}}
>
	<Sheet.Trigger>
		{#snippet child({ props })}
			{#if trigger}
				{@render trigger({ props })}
			{:else}
				<Button {...props} variant="outline" size="sm">
					<Pencil data-icon="inline-start" aria-hidden="true" />แก้ไขข้อมูล
				</Button>
			{/if}
		{/snippet}
	</Sheet.Trigger>
	<Sheet.Content class="w-full overflow-y-auto sm:max-w-md">
		<Sheet.Header>
			<Sheet.Title>แก้ไขข้อมูลบุคคล</Sheet.Title>
			<Sheet.Description>
				จัดการบทบาทระบบและข้อมูลติดต่อของ {person.name || person.email}
			</Sheet.Description>
		</Sheet.Header>

		<form
			class="flex flex-1 flex-col gap-6 px-4 pb-4"
			onsubmit={(event) => {
				event.preventDefault();
				save();
			}}
		>
			<Field.Set>
				<Field.Legend>สิทธิ์ระบบ</Field.Legend>
				<Field.Description>กำหนดเมนูและงานที่บัญชีนี้เข้าถึงได้</Field.Description>
				<Field.Group>
					<Field.Field data-disabled={!hasAccount}>
						<Field.Label for={`role-${person.userId ?? person.ouid}`}>บทบาท</Field.Label>
						<Select.Root type="single" bind:value={role} disabled={!hasAccount}>
							<Select.Trigger id={`role-${person.userId ?? person.ouid}`} class="w-full">
								{role === 'admin' ? 'ผู้ดูแลระบบ' : role === 'staff' ? 'ฝ่ายพัสดุ' : 'นิสิต'}
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									<Select.Item value="user">นิสิต</Select.Item>
									<Select.Item value="staff">ฝ่ายพัสดุ</Select.Item>
									<Select.Item value="admin">ผู้ดูแลระบบ</Select.Item>
								</Select.Group>
							</Select.Content>
						</Select.Root>
						{#if !hasAccount}
							<Field.Description>บุคคลนี้ยังไม่ได้เชื่อมกับบัญชีผู้ใช้</Field.Description>
						{/if}
					</Field.Field>
				</Field.Group>
			</Field.Set>

			<Field.Set disabled={!hasBorrower}>
				<Field.Legend>ข้อมูลติดต่อและข้อมูลผู้ยืม</Field.Legend>
				<Field.Description>
					{hasBorrower
						? 'ข้อมูลที่ฝ่ายพัสดุใช้ติดต่อและตรวจสอบตัวตน'
						: 'บุคคลนี้ยังไม่มีข้อมูลผู้มีสิทธิ์ยืม จึงแก้ไขข้อมูลส่วนนี้ไม่ได้'}
				</Field.Description>
				<Field.Group>
					<Field.Field>
						<Field.Label for={`ouid-${person.userId ?? person.ouid}`}>เลขนิสิต</Field.Label>
						<Input
							id={`ouid-${person.userId ?? person.ouid}`}
							value={person.ouid ?? '-'}
							disabled
						/>
					</Field.Field>
					<Field.Field>
						<Field.Label for={`name-${person.userId ?? person.ouid}`}>ชื่อ-นามสกุล</Field.Label>
						<Input
							id={`name-${person.userId ?? person.ouid}`}
							bind:value={name}
							disabled={!hasBorrower}
						/>
					</Field.Field>
					<Field.Field>
						<Field.Label for={`email-${person.userId ?? person.ouid}`}>อีเมลติดต่อ</Field.Label>
						<Input
							id={`email-${person.userId ?? person.ouid}`}
							type="email"
							bind:value={email}
							disabled={!hasBorrower}
						/>
					</Field.Field>
					<div class="grid gap-4 sm:grid-cols-2">
						<Field.Field>
							<Field.Label for={`phone-${person.userId ?? person.ouid}`}>โทรศัพท์</Field.Label>
							<Input
								id={`phone-${person.userId ?? person.ouid}`}
								type="tel"
								inputmode="tel"
								bind:value={phone}
								disabled={!hasBorrower}
							/>
						</Field.Field>
						<Field.Field>
							<Field.Label for={`line-${person.userId ?? person.ouid}`}>LINE ID</Field.Label>
							<Input
								id={`line-${person.userId ?? person.ouid}`}
								bind:value={lineId}
								disabled={!hasBorrower}
							/>
						</Field.Field>
					</div>
					<Field.Field>
						<Field.Label for={`department-${person.userId ?? person.ouid}`}>ภาควิชา</Field.Label>
						<Select.Root type="single" bind:value={departmentId} disabled={!hasBorrower}>
							<Select.Trigger id={`department-${person.userId ?? person.ouid}`} class="w-full">
								{departments.find((department) => department.id === departmentId)?.name ??
									'เลือกภาควิชา'}
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									{#each departments as department (department.id)}
										<Select.Item value={department.id}>{department.name}</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
					</Field.Field>
				</Field.Group>
			</Field.Set>

			<Sheet.Footer class="mt-auto px-0">
				<Sheet.Close>
					{#snippet child({ props })}
						<Button {...props} type="button" variant="outline" disabled={saving}>ยกเลิก</Button>
					{/snippet}
				</Sheet.Close>
				<Button type="submit" disabled={saving}>
					{#if saving}
						<Spinner data-icon="inline-start" />กำลังบันทึก…
					{:else}
						<Save data-icon="inline-start" aria-hidden="true" />บันทึกข้อมูล
					{/if}
				</Button>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
