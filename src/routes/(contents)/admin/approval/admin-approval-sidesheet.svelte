<script lang="ts">
	import { borrowingUpdateSchema } from '$lib/validator/borrowing.validator';
	import { Button } from '$stories/shadcnui/button';
	import * as Sheet from '$stories/shadcnui/sheet';
	import * as Form from '$stories/shadcnui/form';
	import * as Alert from '$stories/shadcnui/alert';
	import * as Select from '$stories/shadcnui/select';
	import Separator from '$stories/shadcnui/separator/separator.svelte';
	import type { Snippet } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { arktype } from 'sveltekit-superforms/adapters';
	import { listBorrowingRequests, updateBorrowingRequest } from '$lib/rpc/borrowing.remote';
	import StatusBadge from '$stories/status-badge/status-badge.svelte';
	import * as InputGroup from '$stories/shadcnui/input-group';
	import { borrowingStatus, projectStatusOptions } from '$lib/constants';
	import { BadgeAlert } from '@lucide/svelte';
	import Textarea from '$stories/shadcnui/textarea/textarea.svelte';
	import DatePicker from '$stories/date/date-picker.svelte';
	import { isHttpError } from '@sveltejs/kit';
	import { Spinner } from '$stories/shadcnui/spinner';

	interface Props {
		trigger?: Snippet<
			[
				{
					props: Record<string, unknown>;
				}
			]
		>;
		request: NonNullable<ReturnType<typeof listBorrowingRequests>['current']>[number];
	}

	let { trigger, request = $bindable() }: Props = $props();

	const validators = arktype(borrowingUpdateSchema);
	const form = superForm(
		defaults(validators, {
			defaults: {
				id: request.asset_to_project.id,
				adminNote: request.asset_to_project.adminNote || '',
				amount: request.asset_to_project.amount || 0,
				startDate: request.asset_to_project.startDate || '',
				endDate: request.asset_to_project.endDate || '',
				status: request.asset_to_project.status || 'pending'
			}
		}),
		{
			id: `admin-approval-borrowing-sidesheet-form-${request.asset_to_project.id}`,
			SPA: true,
			validators,
			onUpdate: async ({ form }) => {
				if (!form.valid) {
					toast.error('ตรวจสอบข้อมูลอีกครั้ง');
				}
				console.log({ form });
				try {
					await updateBorrowingRequest(form.data);
					toast.success('บันทึกข้อมูลเรียบร้อย');
				} catch (e) {
					if (isHttpError(e)) {
						toast.error(`เกิดข้อผิดพลาด: ${e.body.message}`);
					}
					toast.error(`เกิดข้อผิดพลาด: ${(e as Error).message}`);
					return;
				}
			}
		}
	);

	const { form: formData, enhance, submitting } = form;

	const projectStatus = projectStatusOptions.find((p) => p.value === request.project?.status);

	function dayDiff(a: Date, b: Date) {
		const _MS_PER_DAY = 1000 * 60 * 60 * 24;
		// Discard the time and time-zone information.
		const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
		const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
		return Math.floor((utc2 - utc1) / _MS_PER_DAY);
	}
</script>

<Sheet.Root>
	<Sheet.Trigger>
		{#snippet child({ props })}
			{@render trigger?.({ props })}
		{/snippet}
	</Sheet.Trigger>
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>ตรวจสอบคำขอยืมพัสดุ</Sheet.Title>
			<Sheet.Description>
				ตรวจสอบรายละเอียดการยืม แก้ไขคำขอหากจำเป็น แล้วกดบันทึกเมื่อเสร็จสิ้น
			</Sheet.Description>
		</Sheet.Header>
		<form use:enhance class="grid flex-1 auto-rows-min gap-4 overflow-y-auto px-4">
			<div class="my-2 w-full overflow-hidden rounded-md shadow">
				<img
					src={request.asset?.image_url}
					alt="ตัวอย่างภาพพัสดุ"
					class="h-full w-full object-cover outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
				/>
			</div>
			<div>
				<h2 class="text-lg font-semibold tabular-nums">
					{request.asset?.name} (x{$formData.amount})
				</h2>
				<p class="text-sm text-muted-foreground">{request.asset?.description}</p>
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-muted-foreground">โครงการ</span>
				<strong class="flex flex-row items-center gap-2 text-lg"
					>{request.project?.title}
					{#if projectStatus}<StatusBadge tone={projectStatus.tone}
							>{projectStatus.label}</StatusBadge
						>{/if}</strong
				>
				{#if ['cancelled', 'completed', 'evaluated'].includes(request.project?.status || '')}
					<Alert.Root variant="destructive" class="bg-destructive/10">
						<BadgeAlert class="size-10" />
						<Alert.Title>โครงปิดแล้วหรือเปล่า</Alert.Title>
						<Alert.Description>
							สถานะปัจจุบันของโครงการนี้คือ "{projectStatus?.label}"
							ตรวจสอบว่าอนุมัติการยืมแล้วจะเหมาะไหม
						</Alert.Description>
					</Alert.Root>
				{/if}
			</div>
			<Separator />
			<div class="flex flex-col gap-1">
				<span class="text-muted-foreground"> ผู้ยืม </span>
				<strong class="text-lg"
					>{request.borrower?.name || '-ไม่ระบุ-'}
					({request.borrower?.departmentId})
				</strong>
				<ul class="text-sm">
					<li>
						<span class="font-semibold text-muted-foreground">เลขนิสิต</span>
						<code>{request.borrower?.ouid}</code>
					</li>
					<li>
						<span class="font-semibold text-muted-foreground">Line ID:</span>
						<code>{request.borrower?.line_id || '-ไม่ระบุ-'}</code>
					</li>
					<li>
						<span class="font-semibold text-muted-foreground">โทร:</span>
						<code>{request.borrower?.phone || '-ไม่ระบุ-'}</code>
					</li>
					<li>
						<span class="font-semibold text-muted-foreground">อีเมล:</span>
						<code>{request.borrower?.email || '-ไม่ระบุ-'}</code>
					</li>
				</ul>
			</div>
			<Separator />
			<div class="flex flex-col gap-3 sm:grid sm:grid-cols-2">
				<div class="flex flex-col gap-1">
					<span class="text-sm text-muted-foreground"> ยืมทั้งหมด </span>
					<div>
						<Form.Field {form} name="amount">
							<Form.Control>
								{#snippet children({ props })}
									<InputGroup.Root>
										<InputGroup.Input
											placeholder="จำนวน"
											type="number"
											bind:value={$formData.amount}
											min={1}
											max={(request.asset?.amount || 0) + request.asset_to_project.amount}
											{...props}
										/>
										<InputGroup.Addon align="inline-end">
											<InputGroup.Text>{request.asset?.unitTerm}</InputGroup.Text>
										</InputGroup.Addon>
									</InputGroup.Root>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
					<span class="text-xs text-muted-foreground">
						<span class="tabular-nums">
							พร้อมยืม {(request.asset?.amount || 0) + request.asset_to_project.amount}
						</span>
						{request.asset?.unitTerm}
					</span>
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-sm text-muted-foreground"> เป็นเวลา </span>
					<p class="text-lg font-bold">
						{#if $formData.startDate && $formData.endDate}
							{dayDiff(new Date($formData.startDate), new Date($formData.endDate))} วัน
						{/if}
					</p>
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-sm text-muted-foreground">วันที่เริ่มใช้</span>
					<Form.Field {form} name="startDate">
						<Form.Control>
							<DatePicker
								value={$formData.startDate}
								onChange={(value) => {
									if (!value) return;
									$formData.startDate = value?.toDate('Asia/Bangkok');
								}}
								class="text-md font-bold"
							/>
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<span class="text-xs">
						{#if $formData.startDate && dayDiff($formData.startDate, new Date()) === 0}
							<span class="bg-destructive/15 font-semibold text-destructive"> (วันนี้) </span>
						{:else if $formData.startDate && dayDiff($formData.startDate, new Date()) > 0}
							<span class="bg-destructive/15 font-semibold text-destructive">
								({dayDiff($formData.startDate, new Date())} วันที่ผ่านมา)
							</span>
						{:else if $formData.startDate}
							(อีก {-dayDiff($formData.startDate, new Date())} วัน)
						{/if}
					</span>
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-sm text-muted-foreground">วันที่เลิกใช้</span>
					<Form.Field {form} name="endDate">
						<Form.Control>
							<DatePicker
								value={$formData.endDate}
								onChange={(value) => {
									if (!value) return;
									$formData.endDate = value?.toDate('Asia/Bangkok');
								}}
								class="text-lg font-bold"
							/>
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<div class="col-span-2 flex flex-col gap-1">
					<span class="text-sm text-muted-foreground">หมายเหตุ</span>
					<strong class="text-lg">{request.asset_to_project.note || '-ไม่ระบุ-'}</strong>
				</div>
				<div class="col-span-2 flex flex-col gap-1">
					<span class="text-sm text-muted-foreground">หมายเหตุแอดมิน (เห็นเฉพาะแอดมิน)</span>
					<Form.Field {form} name="adminNote">
						<Form.Control>
							{#snippet children({ props })}
								<Textarea placeholder="หมายเหตุ" bind:value={$formData.adminNote} {...props} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
						<Form.Description>สำหรับโน้ตอะไรก็ตามเกี่ยวกับการยืมนี้</Form.Description>
					</Form.Field>
				</div>
			</div>
			<Separator />
			<div class="flex flex-col gap-1">
				<span class="text-muted-foreground"> สถานะคำขอ </span>
				<Form.Field {form} name="status">
					<Form.Control>
						{#snippet children({ props })}
							<Select.Root type="single" bind:value={$formData.status} name={props.name}>
								<Select.Trigger class="w-45">
									{#if $formData.status}
										{@const status = borrowingStatus.find((s) => s.value === $formData.status)}
										{status?.label}
									{:else}
										เลือกสถานะ
									{/if}
								</Select.Trigger>
								<Select.Content>
									<Select.Group>
										{#each borrowingStatus as { label, value } (value)}
											<Select.Item {value}>{label}</Select.Item>
										{/each}
									</Select.Group>
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
					<Form.Description>
						หากอนุมัติ แก้เป็น "อนุมัติแล้ว" และเมื่อรับของแล้ว แก้เป็น "กำลังใช้งาน"
					</Form.Description>
				</Form.Field>
			</div>
			<div class="flex flex-wrap gap-2 py-4">
				<Button variant="default" type="submit" disabled={$submitting}>
					{#if $submitting}
						<Spinner />
						<span>กำลังบันทึก...</span>
					{:else}
						บันทึก
					{/if}
				</Button>
				<Button onclick={() => form.reset()} variant="ghost" disabled={$submitting}
					>รีเซ็ตฟอร์ม</Button
				>
				<Sheet.Close>
					{#snippet child({ props })}
						<Button variant="ghost" {...props}>ปิด</Button>
					{/snippet}
				</Sheet.Close>
			</div>
		</form>
	</Sheet.Content>
</Sheet.Root>
