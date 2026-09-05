<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { borrowingStatus, projectStatusOptions } from '$lib/constants';
	import {
		approveBorrowingRequest,
		listBorrowingRequests,
		markBorrowingPickedUp,
		processBorrowingReturn,
		rejectBorrowingRequest
	} from '$lib/rpc/borrowing.remote';
	import StatusBadge from '$stories/status-badge/status-badge.svelte';
	import * as Alert from '$stories/shadcnui/alert';
	import * as AlertDialog from '$stories/shadcnui/alert-dialog';
	import { Button } from '$stories/shadcnui/button';
	import * as Field from '$stories/shadcnui/field';
	import * as InputGroup from '$stories/shadcnui/input-group';
	import * as Sheet from '$stories/shadcnui/sheet';
	import { Spinner } from '$stories/shadcnui/spinner';
	import { Textarea } from '$stories/shadcnui/textarea';
	import { AlertTriangle, Check, PackageCheck, Undo2 } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		trigger?: Snippet<[{ props: Record<string, unknown> }]>;
		request: NonNullable<ReturnType<typeof listBorrowingRequests>['current']>[number];
	}

	let { trigger, request }: Props = $props();
	let open = $state(false);
	let actionPending = $state(false);
	let note = $state('');
	let returnedAmount = $state(0);
	let damagedAmount = $state(0);
	let lostAmount = $state(0);
	$effect(() => {
		if (open) note = request.asset_to_project.adminNote ?? '';
	});

	const status = $derived(
		borrowingStatus.find((candidate) => candidate.value === request.asset_to_project.status)
	);
	const projectStatus = $derived(
		projectStatusOptions.find((candidate) => candidate.value === request.project?.status)
	);
	const outstandingAmount = $derived(
		request.asset_to_project.amount -
			request.resolution.returnedAmount -
			request.resolution.damagedAmount -
			request.resolution.lostAmount
	);
	const resolvingAmount = $derived(returnedAmount + damagedAmount + lostAmount);

	async function runAction(action: () => Promise<unknown>, success: string) {
		actionPending = true;
		try {
			await action();
			toast.success(success);
			open = false;
			await invalidateAll();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'ทำรายการไม่สำเร็จ');
		} finally {
			actionPending = false;
		}
	}

	function formatDate(value: Date) {
		return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(value);
	}
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger>
		{#snippet child({ props })}{@render trigger?.({ props })}{/snippet}
	</Sheet.Trigger>
	<Sheet.Content class="flex flex-col gap-0 sm:max-w-xl">
		<Sheet.Header>
			<div class="flex flex-wrap items-center gap-2">
				<Sheet.Title>{request.asset?.name ?? 'คำขอยืมพัสดุ'}</Sheet.Title>
				{#if status}<StatusBadge tone={status.tone}>{status.label}</StatusBadge>{/if}
			</div>
			<Sheet.Description>ตรวจข้อมูล แล้วเลือกขั้นตอนถัดไปตามสถานะปัจจุบัน</Sheet.Description>
		</Sheet.Header>

		<div class="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-5">
			{#if ['cancelled', 'completed', 'evaluated'].includes(request.project?.status ?? '')}
				<Alert.Root variant="destructive">
					<AlertTriangle />
					<Alert.Title>โครงการ{projectStatus?.label ?? 'สิ้นสุดแล้ว'}</Alert.Title>
					<Alert.Description>ตรวจสอบกับผู้ประสานงานก่อนดำเนินการต่อ</Alert.Description>
				</Alert.Root>
			{/if}

			<div class="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
				<div>
					<p class="text-sm text-muted-foreground">โครงการ</p>
					<p class="font-medium">{request.project?.title ?? '-'}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">ผู้ยืม</p>
					<p class="font-medium">{request.borrower?.name ?? '-'}</p>
					<p class="text-sm text-muted-foreground">{request.borrower?.ouid}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">จำนวน</p>
					<p class="font-medium tabular-nums">
						{request.asset_to_project.amount}
						{request.asset?.unitTerm}
					</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">ช่วงใช้งาน</p>
					<p class="font-medium tabular-nums">
						{formatDate(request.asset_to_project.startDate)} – {formatDate(
							request.asset_to_project.endDate
						)}
					</p>
				</div>
				<div class="sm:col-span-2">
					<p class="text-sm text-muted-foreground">หมายเหตุผู้ยืม</p>
					<p>{request.asset_to_project.note || '-'}</p>
				</div>
			</div>

			<Field.Field>
				<Field.Label for={`admin-note-${request.asset_to_project.id}`}
					>หมายเหตุฝ่ายพัสดุ</Field.Label
				>
				<Textarea
					id={`admin-note-${request.asset_to_project.id}`}
					bind:value={note}
					placeholder="เหตุผลหรือข้อมูลส่งต่อภายในฝ่ายพัสดุ"
				/>
			</Field.Field>

			{#if request.asset_to_project.status === 'pending'}
				<div class="rounded-lg border p-4">
					<h3 class="font-semibold">ขั้นตอนถัดไป: ตรวจสอบคำขอ</h3>
					<p class="mt-1 text-sm text-muted-foreground">
						อนุมัติเพื่อรอผู้ยืมมารับ หรือปฏิเสธพร้อมระบุเหตุผล
					</p>
					<div class="mt-4 flex flex-wrap gap-2">
						<Button
							disabled={actionPending}
							onclick={() =>
								runAction(
									() => approveBorrowingRequest({ id: request.asset_to_project.id, note }),
									'อนุมัติคำขอแล้ว'
								)}><Check data-icon="inline-start" />อนุมัติ</Button
						>
						<AlertDialog.Root>
							<AlertDialog.Trigger
								>{#snippet child({ props })}<Button
										{...props}
										variant="destructive"
										disabled={actionPending}>ปฏิเสธ</Button
									>{/snippet}</AlertDialog.Trigger
							>
							<AlertDialog.Content
								><AlertDialog.Header
									><AlertDialog.Title>ปฏิเสธคำขอนี้?</AlertDialog.Title><AlertDialog.Description
										>พัสดุที่พักไว้จะกลับมาให้คำขออื่นทันที ควรระบุเหตุผลในหมายเหตุ</AlertDialog.Description
									></AlertDialog.Header
								><AlertDialog.Footer
									><AlertDialog.Cancel>กลับ</AlertDialog.Cancel><Button
										variant="destructive"
										disabled={actionPending}
										onclick={() =>
											runAction(
												() => rejectBorrowingRequest({ id: request.asset_to_project.id, note }),
												'ปฏิเสธคำขอแล้ว'
											)}>ยืนยันปฏิเสธ</Button
									></AlertDialog.Footer
								></AlertDialog.Content
							>
						</AlertDialog.Root>
					</div>
				</div>
			{:else if request.asset_to_project.status === 'approved'}
				<div class="rounded-lg border p-4">
					<h3 class="font-semibold">ขั้นตอนถัดไป: ส่งมอบพัสดุ</h3>
					<p class="mt-1 text-sm text-muted-foreground">กดยืนยันเมื่อผู้ยืมรับพัสดุจริงแล้ว</p>
					<Button
						class="mt-4"
						disabled={actionPending}
						onclick={() =>
							runAction(
								() => markBorrowingPickedUp({ id: request.asset_to_project.id, note }),
								'บันทึกการรับพัสดุแล้ว'
							)}><PackageCheck data-icon="inline-start" />ยืนยันรับพัสดุ</Button
					>
				</div>
			{:else if request.asset_to_project.status === 'inuse'}
				<div class="rounded-lg border p-4">
					<h3 class="font-semibold">รับคืนพัสดุ</h3>
					<p class="mt-1 text-sm text-muted-foreground">
						คงค้าง <strong class="text-foreground tabular-nums"
							>{outstandingAmount} {request.asset?.unitTerm}</strong
						> รับคืนบางส่วนได้
					</p>
					<Field.Group class="mt-4 grid gap-3 sm:grid-cols-3">
						{#each [{ label: 'สภาพพร้อมใช้', value: 'returned' }, { label: 'ชำรุด', value: 'damaged' }, { label: 'สูญหาย', value: 'lost' }] as field (field.value)}
							<Field.Field
								><Field.Label for={`${field.value}-${request.asset_to_project.id}`}
									>{field.label}</Field.Label
								><InputGroup.Root
									><InputGroup.Input
										id={`${field.value}-${request.asset_to_project.id}`}
										type="number"
										min={0}
										max={outstandingAmount}
										value={field.value === 'returned'
											? returnedAmount
											: field.value === 'damaged'
												? damagedAmount
												: lostAmount}
										oninput={(event) => {
											const value = Number(event.currentTarget.value);
											if (field.value === 'returned') returnedAmount = value;
											else if (field.value === 'damaged') damagedAmount = value;
											else lostAmount = value;
										}}
									/><InputGroup.Addon align="inline-end"
										><InputGroup.Text>{request.asset?.unitTerm}</InputGroup.Text></InputGroup.Addon
									></InputGroup.Root
								></Field.Field
							>
						{/each}
					</Field.Group>
					<AlertDialog.Root>
						<AlertDialog.Trigger
							>{#snippet child({ props })}<Button
									{...props}
									class="mt-4"
									disabled={actionPending ||
										resolvingAmount < 1 ||
										resolvingAmount > outstandingAmount}
									><Undo2 data-icon="inline-start" />บันทึกรับคืน {resolvingAmount || ''}</Button
								>{/snippet}</AlertDialog.Trigger
						>
						<AlertDialog.Content
							><AlertDialog.Header
								><AlertDialog.Title>ยืนยันผลการรับคืน?</AlertDialog.Title><AlertDialog.Description
									>พร้อมใช้ {returnedAmount}, ชำรุด {damagedAmount}, สูญหาย {lostAmount}
									{request.asset?.unitTerm} รายการชำรุดและสูญหายจะปรับยอดคลัง</AlertDialog.Description
								></AlertDialog.Header
							><AlertDialog.Footer
								><AlertDialog.Cancel>กลับไปตรวจ</AlertDialog.Cancel><Button
									disabled={actionPending}
									onclick={() =>
										runAction(
											() =>
												processBorrowingReturn({
													id: request.asset_to_project.id,
													returnedAmount,
													damagedAmount,
													lostAmount,
													note
												}),
											'บันทึกรับคืนแล้ว'
										)}
									>{#if actionPending}<Spinner />{/if}ยืนยันรับคืน</Button
								></AlertDialog.Footer
							></AlertDialog.Content
						>
					</AlertDialog.Root>
				</div>
			{:else}
				<Alert.Root
					><Check /><Alert.Title>รายการนี้สิ้นสุดแล้ว</Alert.Title><Alert.Description
						>ไม่มีขั้นตอนที่ต้องดำเนินการต่อ</Alert.Description
					></Alert.Root
				>
			{/if}
		</div>
	</Sheet.Content>
</Sheet.Root>
