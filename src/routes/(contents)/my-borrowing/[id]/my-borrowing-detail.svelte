<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		cancelMyBorrowingRequest,
		getMyBorrowingRequestInfo,
		updateMyBorrowingRequest
	} from '$lib/rpc/borrowing.remote';
	import { borrowingStatus } from '$lib/constants';
	import { formatDate } from '$lib/utils/datetime';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import PageHeader from '$stories/page-header/page-header.svelte';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';
	import StatusBadge from '$stories/status-badge/status-badge.svelte';
	import { Button } from '$stories/shadcnui/button';
	import { Input } from '$stories/shadcnui/input';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import * as Alert from '$stories/shadcnui/alert';
	import * as AlertDialog from '$stories/shadcnui/alert-dialog';
	import * as Card from '$stories/shadcnui/card';
	import * as Dialog from '$stories/shadcnui/dialog';
	import * as Field from '$stories/shadcnui/field';
	import { Textarea } from '$stories/shadcnui/textarea';
	import { Check, Circle, Clock3, PackagePlus, Pencil, X } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let { id }: { id: string } = $props();
	let cancelReason = $state('');
	let cancelOpen = $state(false);
	let editOpen = $state(false);
	let editAmount = $state(1);
	let editStartDate = $state('');
	let editEndDate = $state('');
	let editNote = $state('');
	const requestLoader = $derived(getMyBorrowingRequestInfo({ id }));
	type RequestDetail = Awaited<ReturnType<typeof getMyBorrowingRequestInfo>>;

	const eventLabels: Record<string, string> = {
		submitted: 'ส่งคำขอ',
		edited: 'แก้ไขคำขอ',
		approved: 'อนุมัติแล้ว',
		rejected: 'ปฏิเสธคำขอ',
		cancelled: 'ยกเลิกคำขอ',
		'picked-up': 'รับพัสดุแล้ว',
		'partial-return': 'รับคืนบางส่วน',
		completed: 'รับคืนครบแล้ว'
	};

	function nextStep(status: string, endDate: Date) {
		if (status === 'pending') return 'เจ้าหน้าที่กำลังตรวจคำขอ รายการถูกพักไว้ให้แล้ว';
		if (status === 'approved') return 'ติดต่อเจ้าหน้าที่เพื่อรับพัสดุตามวันที่กำหนด';
		if (status === 'inuse') {
			return endDate < new Date()
				? 'เลยกำหนดส่งคืนแล้ว โปรดติดต่อเจ้าหน้าที่ทันที'
				: `ส่งคืนภายใน ${formatDate(endDate)}`;
		}
		if (status === 'rejected') return 'ตรวจหมายเหตุจากเจ้าหน้าที่ แล้วสร้างคำขอใหม่ได้';
		if (status === 'cancelled') return 'คำขอนี้ถูกยกเลิก พัสดุถูกคืนสู่จำนวนพร้อมยืมแล้ว';
		return 'รายการนี้เสร็จสิ้นแล้ว';
	}

	async function cancelRequest() {
		try {
			await cancelMyBorrowingRequest({ id, reason: cancelReason.trim() || undefined });
			toast.success('ยกเลิกคำขอแล้ว');
			cancelOpen = false;
			await requestLoader.refresh();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'ยกเลิกคำขอไม่สำเร็จ');
		}
	}

	function dateInputValue(value: Date) {
		return new Intl.DateTimeFormat('en-CA', {
			timeZone: 'Asia/Bangkok',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		}).format(value);
	}

	function openEdit(request: RequestDetail) {
		editAmount = request.amount;
		editStartDate = dateInputValue(request.startDate);
		editEndDate = dateInputValue(request.endDate);
		editNote = request.note ?? '';
		editOpen = true;
	}

	async function saveEdit(request: RequestDetail) {
		try {
			await updateMyBorrowingRequest({
				id: request.id,
				projectId: request.projectId,
				amount: editAmount,
				startDate: new Date(`${editStartDate}T00:00:00+07:00`),
				endDate: new Date(`${editEndDate}T23:59:59+07:00`),
				note: editNote.trim() || null
			});
			toast.success('แก้ไขคำขอแล้ว');
			editOpen = false;
			await requestLoader.refresh();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'แก้ไขคำขอไม่สำเร็จ');
		}
	}
</script>

<PageWrapper groupTitle="ยืมพัสดุ" pageTitle="รายละเอียดการยืม" groupUrl="/my-borrowing">
	<AsyncHttpBoundary dataLoader={requestLoader}>
		{#snippet children(request)}
			{@const status = borrowingStatus.find((candidate) => candidate.value === request.status)}
			{@const returnedAmount = request.movements
				.filter((movement) => movement.type === 'returned-usable')
				.reduce((sum, movement) => sum + movement.amount, 0)}
			{@const damagedAmount = request.movements
				.filter((movement) => movement.type === 'damaged')
				.reduce((sum, movement) => sum + movement.amount, 0)}
			{@const lostAmount = request.movements
				.filter((movement) => movement.type === 'lost')
				.reduce((sum, movement) => sum + movement.amount, 0)}
			<div class="mx-auto flex w-full max-w-4xl flex-col gap-5">
				{#snippet actions()}
					{#if status}<StatusBadge tone={status.tone}>{status.label}</StatusBadge>{/if}
				{/snippet}
				<PageHeader
					title={request.asset?.name ?? 'รายละเอียดการยืม'}
					description={request.project?.title}
					{actions}
				/>

				<Alert.Root
					variant={request.status === 'inuse' && request.endDate < new Date()
						? 'destructive'
						: 'default'}
				>
					<Clock3 />
					<Alert.Title>ขั้นตอนถัดไป</Alert.Title>
					<Alert.Description>{nextStep(request.status, request.endDate)}</Alert.Description>
				</Alert.Root>

				<div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
					<div class="flex flex-col gap-5">
						<Card.Root>
							<Card.Header><Card.Title>รายละเอียดคำขอ</Card.Title></Card.Header>
							<Card.Content class="grid gap-4 sm:grid-cols-2">
								<div>
									<p class="text-sm text-muted-foreground">จำนวน</p>
									<p class="font-semibold tabular-nums">
										{request.amount}
										{request.asset?.unitTerm}
									</p>
								</div>
								<div>
									<p class="text-sm text-muted-foreground">ช่วงวันที่</p>
									<p class="font-semibold">
										{formatDate(request.startDate)} – {formatDate(request.endDate)}
									</p>
								</div>
								<div class="sm:col-span-2">
									<p class="text-sm text-muted-foreground">หมายเหตุของคุณ</p>
									<p class="break-words">{request.note || 'ไม่ระบุ'}</p>
								</div>
								<div class="sm:col-span-2">
									<p class="text-sm text-muted-foreground">หมายเหตุจากเจ้าหน้าที่</p>
									<p class="break-words">{request.adminNote || 'ไม่ระบุ'}</p>
								</div>
							</Card.Content>
						</Card.Root>

						{#if returnedAmount || damagedAmount || lostAmount}
							<Card.Root>
								<Card.Header><Card.Title>ผลการรับคืน</Card.Title></Card.Header>
								<Card.Content class="grid grid-cols-3 gap-3 text-center">
									<div>
										<p class="text-sm text-muted-foreground">ปกติ</p>
										<strong class="tabular-nums">{returnedAmount}</strong>
									</div>
									<div>
										<p class="text-sm text-muted-foreground">ชำรุด</p>
										<strong class="tabular-nums">{damagedAmount}</strong>
									</div>
									<div>
										<p class="text-sm text-muted-foreground">สูญหาย</p>
										<strong class="tabular-nums">{lostAmount}</strong>
									</div>
								</Card.Content>
							</Card.Root>
						{/if}
					</div>

					<Card.Root>
						<Card.Header><Card.Title>ลำดับเหตุการณ์</Card.Title></Card.Header>
						<Card.Content>
							<ol class="flex flex-col gap-4">
								{#each request.events.toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) as event, index (event.id)}
									<li class="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3">
										<div class="flex flex-col items-center">
											<div
												class="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
											>
												{#if index === request.events.length - 1}<Circle />{:else}<Check />{/if}
											</div>
											{#if index < request.events.length - 1}<div
													class="min-h-6 w-px flex-1 bg-border"
												></div>{/if}
										</div>
										<div class="min-w-0 pb-2">
											<p class="font-medium">{eventLabels[event.type] ?? event.type}</p>
											<p class="text-sm text-muted-foreground">{formatDate(event.createdAt)}</p>
										</div>
									</li>
								{:else}
									<li class="text-sm text-muted-foreground">ข้อมูลเดิมยังไม่มีลำดับเหตุการณ์</li>
								{/each}
							</ol>
						</Card.Content>
					</Card.Root>
				</div>

				<div class="flex flex-wrap justify-end gap-2">
					<Button variant="outline" href={resolve('/my-borrowing')}>กลับไปรายการ</Button>
					{#if request.status === 'pending'}
						<Dialog.Root bind:open={editOpen}>
							<Dialog.Trigger
								>{#snippet child({ props })}<Button
										{...props}
										variant="outline"
										onclick={() => openEdit(request)}
										><Pencil data-icon="inline-start" />แก้ไขคำขอ</Button
									>{/snippet}</Dialog.Trigger
							>
							<Dialog.Content
								><Dialog.Header
									><Dialog.Title>แก้ไขคำขอ</Dialog.Title><Dialog.Description
										>แก้จำนวน ช่วงวันที่ และหมายเหตุได้จนกว่าเจ้าหน้าที่จะอนุมัติ</Dialog.Description
									></Dialog.Header
								>
								<Field.Group
									><Field.Field
										><Field.Label for="edit-borrow-amount">จำนวน</Field.Label><Input
											id="edit-borrow-amount"
											type="number"
											min={1}
											bind:value={editAmount}
										/></Field.Field
									>
									<div class="grid gap-3 sm:grid-cols-2">
										<Field.Field
											><Field.Label for="edit-borrow-start">วันเริ่มใช้</Field.Label><Input
												id="edit-borrow-start"
												type="date"
												bind:value={editStartDate}
											/></Field.Field
										><Field.Field
											><Field.Label for="edit-borrow-end">วันคืน</Field.Label><Input
												id="edit-borrow-end"
												type="date"
												bind:value={editEndDate}
											/></Field.Field
										>
									</div>
									<Field.Field
										><Field.Label for="edit-borrow-note">หมายเหตุ</Field.Label><Textarea
											id="edit-borrow-note"
											bind:value={editNote}
										/></Field.Field
									></Field.Group
								>
								<Dialog.Footer
									><Dialog.Close
										>{#snippet child({ props })}<Button {...props} variant="ghost">ยกเลิก</Button
											>{/snippet}</Dialog.Close
									><Button
										disabled={!!updateMyBorrowingRequest.pending || !editStartDate || !editEndDate}
										onclick={() => saveEdit(request)}>บันทึกการแก้ไข</Button
									></Dialog.Footer
								>
							</Dialog.Content></Dialog.Root
						>
					{/if}
					{#if ['returned', 'rejected', 'cancelled'].includes(request.status)}
						<Button href={resolve(`/projects/${request.projectId}`)}
							><PackagePlus data-icon="inline-start" />ยืมอีกครั้ง</Button
						>
					{/if}
					{#if ['pending', 'approved'].includes(request.status)}
						<AlertDialog.Root bind:open={cancelOpen}>
							<AlertDialog.Trigger>
								{#snippet child({ props })}<Button {...props} variant="destructive"
										><X data-icon="inline-start" />ยกเลิกคำขอ</Button
									>{/snippet}
							</AlertDialog.Trigger>
							<AlertDialog.Content>
								<AlertDialog.Header
									><AlertDialog.Title>ยกเลิกคำขอนี้?</AlertDialog.Title><AlertDialog.Description
										>{request.status === 'approved'
											? 'คำขออนุมัติแล้ว เจ้าหน้าที่อาจเตรียมพัสดุไว้แล้ว'
											: 'พัสดุที่พักไว้จะกลับมาให้ผู้อื่นยืมได้'}</AlertDialog.Description
									></AlertDialog.Header
								>
								<label for="cancel-reason" class="text-sm font-medium">เหตุผล (ไม่บังคับ)</label>
								<Input id="cancel-reason" bind:value={cancelReason} placeholder="ระบุเหตุผล…" />
								<AlertDialog.Footer
									><AlertDialog.Cancel>เก็บคำขอไว้</AlertDialog.Cancel><Button
										variant="destructive"
										disabled={!!cancelMyBorrowingRequest.pending}
										onclick={cancelRequest}>ยืนยันยกเลิก</Button
									></AlertDialog.Footer
								>
							</AlertDialog.Content>
						</AlertDialog.Root>
					{/if}
				</div>
			</div>
		{/snippet}

		{#snippet pending()}
			<div class="mx-auto flex w-full max-w-4xl flex-col gap-4">
				<Skeleton class="h-12 w-2/3" /><Skeleton class="h-20 w-full" /><Skeleton
					class="h-72 w-full"
				/>
			</div>
		{/snippet}
	</AsyncHttpBoundary>
</PageWrapper>
