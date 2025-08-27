<script lang="ts">
	import Button from '$stories/shadcnui/button/button.svelte';
	import * as Card from '$stories/shadcnui/card';
	import * as Table from '$stories/shadcnui/table';
	import Input from '$stories/shadcnui/input/input.svelte';
	import { ArrowLeft, Trash2, UserSearch } from '@lucide/svelte';
	import { getBorrowerInfo } from '$lib/rpc/borrower.remote';
	import { toast } from 'svelte-sonner';
	import {
		assignBorrowerToProject,
		listAllStaffsForProject,
		removeBorrowerFromProject
	} from '$lib/rpc/project.remote';
	import { isHttpError } from '@sveltejs/kit';

	let {
		projectId
	}: {
		projectId: string;
	} = $props();

	let newStaffValue = $state({
		ouid: '',
		name: '',
		email: '',
		line_id: '',
		phone: '',
		departmentId: ''
	});

	let loadedStaffInfo = $state({
		ouid: '',
		name: '',
		email: '',
		line_id: '',
		phone: '',
		departmentId: ''
	});

	async function unassignBorrower(ouid: string) {
		await removeBorrowerFromProject({
			borrowerId: ouid,
			projectId
		});
		await listAllStaffsForProject({ projectId }).refresh();
		toast.success(`ลบ ${ouid} ออกจากโครงการเรียบร้อยแล้ว`);
	}

	async function searchStaff() {
		try {
			loadedStaffInfo = await getBorrowerInfo({ ouid: newStaffValue.ouid });
		} catch (err) {
			if (isHttpError(err) && err.status === 404) {
				toast.error(`ไม่พบข้อมูลสำหรับ ${newStaffValue.ouid}`);
				loadedStaffInfo = {
					ouid: newStaffValue.ouid,
					name: '',
					email: '',
					line_id: '',
					phone: '',
					departmentId: ''
				};
				return;
			}
			toast.error(`เกิดข้อผิดพลาดในการค้นหา: ${err.message}`);
		}
	}

	async function saveStaff() {
		try {
			await assignBorrowerToProject({
				borrowerData: {
					ouid: loadedStaffInfo.ouid,
					name: loadedStaffInfo.name,
					email: loadedStaffInfo.email,
					line_id: loadedStaffInfo.line_id,
					phone: loadedStaffInfo.phone,
					departmentId: loadedStaffInfo.departmentId
				},
				relations: {
					borrowerId: loadedStaffInfo.ouid,
					projectId
				}
			});
			await listAllStaffsForProject({ projectId }).refresh();
		} catch (err) {
			if (isHttpError(err) && err.status === 400) {
				toast.error(err);
				return;
			}
			toast.error(`เกิดข้อผิดพลาดในการบันทึก: ${err.message}`);
		}

		loadedStaffInfo = {
			ouid: '',
			name: '',
			email: '',
			line_id: '',
			phone: '',
			departmentId: ''
		};
	}

	async function resetNewStaff() {
		newStaffValue = {
			ouid: newStaffValue.ouid ?? '',
			name: '',
			email: '',
			line_id: '',
			phone: '',
			departmentId: ''
		};
		loadedStaffInfo = {
			ouid: '',
			name: '',
			email: '',
			line_id: '',
			phone: '',
			departmentId: ''
		};
	}
</script>

{#snippet StaffRow({
	staffInfo
}: {
	staffInfo: {
		name: string;
		createdAt: Date | null;
		updatedAt: Date | null;
		deletedAt: Date | null;
		ouid: string;
		departmentId: string;
		email: string;
		line_id: string;
		phone: string;
		oldIsAdmin: boolean;
	};
})}
	<Table.Row>
		<Table.Cell>{staffInfo.ouid}</Table.Cell>
		<Table.Cell>{staffInfo.name}</Table.Cell>
		<Table.Cell>{staffInfo.email}</Table.Cell>
		<Table.Cell>{staffInfo.line_id}</Table.Cell>
		<Table.Cell>{staffInfo.phone}</Table.Cell>
		<Table.Cell>{staffInfo.departmentId}</Table.Cell>
		<Table.Cell>
			<Button
				variant="outline"
				size="icon"
				onclick={async () => await unassignBorrower(staffInfo.ouid)}
			>
				<Trash2 class="h-4 w-4" />
			</Button>
		</Table.Cell>
	</Table.Row>
{/snippet}

{#snippet NewStaffRow()}
	<Table.Row>
		{#if !loadedStaffInfo.ouid}
			<Table.Cell colspan={6}>
				<div class="flex flex-row gap-2">
					<Input class="w-[140px]" bind:value={newStaffValue.ouid} placeholder="683xxxxx23" />
					<Button onclick={async () => await searchStaff()}>
						<UserSearch />
						ค้นหา
					</Button>
				</div>
				<span class="mt-3 text-sm text-muted-foreground">
					ระบุเลขนิสิต 10 หลักเพื่อเพิ่มเข้าโครง
				</span>
			</Table.Cell>
		{:else if loadedStaffInfo.ouid}
			<Table.Cell>
				<Input class="w-full min-w-[130px] text-sm" bind:value={loadedStaffInfo.ouid} disabled />
			</Table.Cell>
			<Table.Cell>
				<Input class="w-full min-w-[130px] text-sm" bind:value={loadedStaffInfo.name} />
			</Table.Cell>
			<Table.Cell>
				<Input class="w-full min-w-[130px] text-sm" bind:value={loadedStaffInfo.email} />
			</Table.Cell>
			<Table.Cell>
				<Input class="w-full min-w-[130px] text-sm" bind:value={loadedStaffInfo.line_id} />
			</Table.Cell>
			<Table.Cell>
				<Input class="w-full min-w-[130px] text-sm" bind:value={loadedStaffInfo.phone} />
			</Table.Cell>
			<Table.Cell>
				<Input class="w-full min-w-[130px] text-sm" bind:value={loadedStaffInfo.departmentId} />
			</Table.Cell>
			<Table.Cell>
				<Button onclick={async () => await saveStaff()}>บันทึก</Button>
				<Button variant="outline" onclick={async () => await resetNewStaff()}>ยกเลิก</Button>
			</Table.Cell>
		{/if}
	</Table.Row>
{/snippet}

<Card.Root class="w-full">
	<Card.Header>
		<div class="flex items-center justify-between">
			<div>
				<Card.Title>สตาฟโครงการ</Card.Title>
				<Card.Description class="mt-2">
					แก้ไขรายชื่อสตาฟที่มีสิทธิ์ยืมของภายใต้โครงการนี้ (คลิกที่เซลล์เพื่อแก้ไข)
				</Card.Description>
			</div>
			<Button variant="outline" href="/admin/projects" class="flex items-center gap-2">
				<ArrowLeft class="h-4 w-4" />
				กลับ
			</Button>
		</div>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Cell>เลขนิสิต</Table.Cell>
					<Table.Cell>ชื่อ</Table.Cell>
					<Table.Cell>อีเมล</Table.Cell>
					<Table.Cell>ไลน์ ID</Table.Cell>
					<Table.Cell>เบอร์โทร</Table.Cell>
					<Table.Cell>ภาควิชา</Table.Cell>
					<Table.Cell></Table.Cell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each listAllStaffsForProject({ projectId }).current ?? [] as staff (staff.borrowerId)}
					{@render StaffRow({ staffInfo: staff.borrower })}
				{/each}
				{@render NewStaffRow()}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>
