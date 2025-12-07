<script lang="ts">
	import Button from '$stories/shadcnui/button/button.svelte';
	import * as Card from '$stories/shadcnui/card';
	import * as Table from '$stories/shadcnui/table';
	import * as Select from '$stories/shadcnui/select';
	import Input from '$stories/shadcnui/input/input.svelte';
	import { ArrowLeft, UserRoundPlus, UserRoundX, UserSearch } from '@lucide/svelte';
	import { getBorrowerInfo } from '$lib/rpc/borrower.remote';
	import { toast } from 'svelte-sonner';
	import {
		assignBorrowerToProject,
		listAllStaffsForProject,
		removeBorrowerFromProject
	} from '$lib/rpc/project.remote';
	import { isHttpError } from '@sveltejs/kit';
	import { listDepartment } from '$lib/rpc/department.remote';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import Label from '$stories/shadcnui/label/label.svelte';

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

	// Simple Quality of Life for OUID input
	const ouidReplaceCharMap = new Map([
		['ๅ', '1'],
		['/', '2'],
		['-', '3'],
		['ภ', '4'],
		['ถ', '5'],
		['ุ', '6'],
		['ึ', '7'],
		['ค', '8'],
		['ต', '9'],
		['จ', '0'],
		[' ', ''],
		['-', '']
	]);

	$effect(() => {
		if (/^\d*$/.test(newStaffValue.ouid)) return;
		newStaffValue.ouid = newStaffValue.ouid
			.split('')
			.map((char) => {
				const replaceChar = ouidReplaceCharMap.get(char);
				return replaceChar ? replaceChar : char;
			})
			.join('');
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
				toast.error(`ไม่พบข้อมูลสำหรับ ${newStaffValue.ouid} โปรดกรอกข้อมูลเพิ่มเติม`);
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
			console.log('here', err);
			if (isHttpError(err) && err.status === 400) {
				toast.error(err.body.message);
				await listAllStaffsForProject({ projectId }).refresh();
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
		newStaffValue = {
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

	const staffQuery = listAllStaffsForProject({ projectId });
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
		<Table.Cell>{staffInfo.line_id || '-'}</Table.Cell>
		<Table.Cell>{staffInfo.phone || '-'}</Table.Cell>
		<Table.Cell>{staffInfo.departmentId}</Table.Cell>
		<Table.Cell>
			<Button
				variant="outline"
				size="icon"
				onclick={async () => await unassignBorrower(staffInfo.ouid)}
			>
				<UserRoundX />
			</Button>
		</Table.Cell>
	</Table.Row>
{/snippet}

{#snippet NewStaffRow()}
	<div class="mt-4 flex flex-col gap-2 rounded-md border p-3">
		<h3 class="text-md col-span-full mb-2 leading-none font-medium">เพิ่มสตาฟใหม่</h3>
		{#if !loadedStaffInfo.ouid}
			<div class="flex flex-col gap-2">
				<form
					class="flex flex-row gap-2"
					onsubmit={async (e) => {
						e.preventDefault();
						await searchStaff();
					}}
				>
					<Input class="max-w-72" bind:value={newStaffValue.ouid} placeholder="683xxxxx23" />
					<Button type="submit">
						<UserSearch />
						ค้นหา
					</Button>
				</form>
				<span class="text-sm text-muted-foreground"> ระบุเลขนิสิต 10 หลักเพื่อเพิ่มเข้าโครง </span>
			</div>
		{:else if loadedStaffInfo.ouid}
			<p class="text-sm text-muted-foreground">
				แก้ไขหรือบันทึกข้อมูลติดต่อของผู้ยืม ยังตรงกับข้อมูลที่ได้รับมาหรือไม่ หากไม่
				แก้ไขด้านล่างแล้วกดบันทึก
			</p>
			<p class="text-sm text-muted-foreground">
				กรณี<u>ไม่มีข้อมูลแสดง</u> เพราะ (1) ยังไม่มีข้อมูลคนนี้ ให้เพิ่มข้อมูลใหม่ก่อนบันทึก หรือ (2)
				เลขนิสิตผิด? กดยกเลิกแล้วกรอกใหม่
			</p>
			<form
				class="grid grid-cols-1 gap-2 md:grid-cols-[fit-content_1fr]"
				onsubmit={async (e) => {
					e.preventDefault();
					await saveStaff();
				}}
			>
				<Label>เลขนิสิต</Label>
				<Input class="w-full min-w-[130px] text-sm" bind:value={loadedStaffInfo.ouid} disabled />
				<Label>ชื่อ</Label>
				<Input class="w-full min-w-[130px] text-sm" bind:value={loadedStaffInfo.name} />
				<Label>อีเมล</Label>
				<Input class="w-full min-w-[130px] text-sm" bind:value={loadedStaffInfo.email} />
				<Label>ไลน์ ID</Label>
				<Input class="w-full min-w-[130px] text-sm" bind:value={loadedStaffInfo.line_id} />
				<Label>เบอร์โทร</Label>
				<Input class="w-full min-w-[130px] text-sm" bind:value={loadedStaffInfo.phone} />

				<Label>ภาควิชา</Label>
				{#await listDepartment()}
					<Skeleton class="w-[180px]" />
				{:then departments}
					<Select.Root
						type="single"
						value={loadedStaffInfo.departmentId}
						onValueChange={(value) => (loadedStaffInfo.departmentId = value)}
					>
						<Select.Trigger class="w-[180px]">
							{#if loadedStaffInfo.departmentId}
								{loadedStaffInfo.departmentId}
							{:else}
								เลือกภาควิชา
							{/if}
						</Select.Trigger>
						<Select.Content>
							{#each departments as department (department.id)}
								<Select.Item value={department.id}>{department.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{/await}
				<Input
					hidden
					class="w-full min-w-[130px] text-sm"
					bind:value={loadedStaffInfo.departmentId}
				/>
				<div class="col-span-full mt-2 flex gap-2">
					<Button type="submit">
						<UserRoundPlus />
						เพิ่มนิสิต
					</Button>
					<Button variant="outline" onclick={async () => await resetNewStaff()}>ยกเลิก</Button>
				</div>
			</form>
		{/if}
	</div>
{/snippet}

<Card.Root class="w-full">
	<Card.Header>
		<div class="flex items-center justify-between">
			<div>
				<Card.Title>สตาฟโครงการ</Card.Title>
				<Card.Description class="mt-2">
					จัดการสตาฟที่มีสิทธิ์เข้าถึงและแก้ไขโครงการนี้
				</Card.Description>
			</div>
			<Button variant="outline" href="/admin/projects" class="flex items-center gap-2">
				<ArrowLeft class="h-4 w-4" />
				กลับ
			</Button>
		</div>
	</Card.Header>
	<Card.Content>
		<div class="rounded-sm border">
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
					{#each staffQuery.current ?? [] as staff (staff.borrowerId)}
						{@render StaffRow({ staffInfo: staff.borrower })}
					{:else}
						<Table.Row>
							<Table.Cell colspan={7}>
								<p class="py-4 text-center text-sm text-muted-foreground">
									Owo<br />ยังไม่มีสตาฟในโครงการนี้
								</p>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
		{@render NewStaffRow()}
	</Card.Content>
</Card.Root>
