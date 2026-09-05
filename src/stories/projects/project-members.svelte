<script lang="ts">
	import {
		assignBorrowerToProject,
		listAllStaffsForProject,
		removeBorrowerFromProject
	} from '$lib/rpc/project.remote';
	import { searchProjectMemberCandidates } from '$lib/rpc/person.remote';
	import StatusBadge from '$stories/status-badge/status-badge.svelte';
	import * as AlertDialog from '$stories/shadcnui/alert-dialog';
	import { Button } from '$stories/shadcnui/button';
	import * as Card from '$stories/shadcnui/card';
	import * as Empty from '$stories/shadcnui/empty';
	import { Input } from '$stories/shadcnui/input';
	import { Spinner } from '$stories/shadcnui/spinner';
	import * as Table from '$stories/shadcnui/table';
	import { Search, UserPlus, Users, UserX } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let { projectId, canManage = false }: { projectId: string; canManage?: boolean } = $props();
	let search = $state('');
	const members = $derived(listAllStaffsForProject({ projectId }));
	const candidates = $derived(searchProjectMemberCandidates({ projectId, query: search }));
	type Candidate = NonNullable<ReturnType<typeof searchProjectMemberCandidates>['current']>[number];

	async function addMember(candidate: Candidate) {
		if (!candidate.ouid || !candidate.departmentId) return;
		try {
			await assignBorrowerToProject({
				borrowerData: {
					ouid: candidate.ouid,
					name: candidate.name,
					email: candidate.email,
					line_id: candidate.lineId ?? '',
					phone: candidate.phone ?? '',
					departmentId: candidate.departmentId
				},
				relations: { projectId, borrowerId: candidate.ouid, role: 'member' }
			});
			await members.refresh();
			await candidates.refresh();
			toast.success(`เพิ่ม ${candidate.name} เป็นสมาชิกแล้ว`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'เพิ่มสมาชิกไม่สำเร็จ');
		}
	}

	async function removeMember(ouid: string, name: string) {
		try {
			await removeBorrowerFromProject({ projectId, borrowerId: ouid });
			await members.refresh();
			await candidates.refresh();
			toast.success(`นำ ${name} ออกจากโครงการแล้ว`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'นำสมาชิกออกไม่สำเร็จ');
		}
	}
</script>

<Card.Root class="mx-auto mt-6 w-full max-w-7xl">
	<Card.Header>
		<Card.Title>สมาชิกโครงการ</Card.Title>
		<Card.Description
			>{canManage
				? 'คุณเป็นผู้ประสานงาน จึงเพิ่มและนำสมาชิกออกได้'
				: 'รายชื่อผู้ที่ยืมพัสดุในนามโครงการนี้ได้'}</Card.Description
		>
	</Card.Header>
	<Card.Content class="flex flex-col gap-5">
		{#if canManage}
			<div class="rounded-lg border p-4">
				<label for="member-search" class="text-sm font-medium">เพิ่มสมาชิก</label>
				<div class="relative mt-2">
					<Search
						class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
					/><Input
						id="member-search"
						class="pl-9"
						bind:value={search}
						placeholder="ค้นหาชื่อ เลขนิสิต หรืออีเมล"
					/>
				</div>
				{#if search.trim().length >= 2}
					<div class="mt-3 flex flex-col gap-2">
						{#await candidates}<Spinner />{:then people}
							{#each people.slice(0, 8) as person (person.id)}
								<div class="flex items-center justify-between gap-3 rounded-md border p-3">
									<div class="min-w-0">
										<p class="truncate font-medium">{person.name}</p>
										<p class="truncate text-sm text-muted-foreground">
											{person.ouid} · {person.email}
										</p>
									</div>
									<Button
										size="sm"
										disabled={!!assignBorrowerToProject.pending}
										onclick={() => addMember(person)}
										><UserPlus data-icon="inline-start" />เพิ่ม</Button
									>
								</div>
							{:else}<p class="text-sm text-muted-foreground">ไม่พบผู้ที่เพิ่มได้</p>{/each}
						{/await}
					</div>
				{/if}
			</div>
		{/if}

		{#await members}<Spinner />{:then rows}
			{#if rows.length}
				<div class="overflow-x-auto rounded-lg border">
					<Table.Root
						><Table.Header
							><Table.Row
								><Table.Head>สมาชิก</Table.Head><Table.Head>บทบาท</Table.Head><Table.Head
									>ติดต่อ</Table.Head
								>{#if canManage}<Table.Head class="w-16"
										><span class="sr-only">จัดการ</span></Table.Head
									>{/if}</Table.Row
							></Table.Header
						><Table.Body>
							{#each rows as row (row.borrowerId)}<Table.Row
									><Table.Cell
										><p class="font-medium">{row.borrower.name}</p>
										<p class="text-sm text-muted-foreground">{row.borrower.ouid}</p></Table.Cell
									><Table.Cell
										><StatusBadge tone={row.role === 'coordinator' ? 'info' : 'neutral'}
											>{row.role === 'coordinator' ? 'ผู้ประสานงาน' : 'สมาชิก'}</StatusBadge
										></Table.Cell
									><Table.Cell
										><p>{row.borrower.email}</p>
										<p class="text-sm text-muted-foreground">
											{row.borrower.phone || '-'}
										</p></Table.Cell
									>{#if canManage}<Table.Cell
											>{#if row.role !== 'coordinator'}<AlertDialog.Root
													><AlertDialog.Trigger
														>{#snippet child({ props })}<Button
																{...props}
																variant="ghost"
																size="icon"
																aria-label={`นำ ${row.borrower.name} ออกจากโครงการ`}
																><UserX /></Button
															>{/snippet}</AlertDialog.Trigger
													><AlertDialog.Content
														><AlertDialog.Header
															><AlertDialog.Title
																>นำ {row.borrower.name} ออกจากโครงการ?</AlertDialog.Title
															><AlertDialog.Description
																>หากมีคำขอยืมที่ยังไม่สิ้นสุด ระบบจะไม่อนุญาตให้นำออก</AlertDialog.Description
															></AlertDialog.Header
														><AlertDialog.Footer
															><AlertDialog.Cancel>ยกเลิก</AlertDialog.Cancel><Button
																variant="destructive"
																onclick={() => removeMember(row.borrower.ouid, row.borrower.name)}
																>ยืนยันนำออก</Button
															></AlertDialog.Footer
														></AlertDialog.Content
													></AlertDialog.Root
												>{/if}</Table.Cell
										>{/if}</Table.Row
								>{/each}
						</Table.Body></Table.Root
					>
				</div>
			{:else}<Empty.Root
					><Empty.Header
						><Empty.Media variant="icon"><Users /></Empty.Media><Empty.Title
							>ยังไม่มีสมาชิก</Empty.Title
						><Empty.Description>ผู้ประสานงานเพิ่มสมาชิกได้จากช่องค้นหาด้านบน</Empty.Description
						></Empty.Header
					></Empty.Root
				>{/if}
		{/await}
	</Card.Content>
</Card.Root>
