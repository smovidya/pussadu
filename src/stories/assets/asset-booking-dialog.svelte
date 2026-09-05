<script lang="ts">
	import { Button, buttonVariants } from '$stories/shadcnui/button';
	import * as Dialog from '$stories/shadcnui/dialog';
	import * as Popover from '$stories/shadcnui/popover';
	import { Input } from '$stories/shadcnui/input';
	import * as Field from '$stories/shadcnui/field';
	import * as InputGroup from '$stories/shadcnui/input-group';
	import { CalendarIcon, Minus, Plus, ShoppingCart } from '@lucide/svelte';
	import { cn } from '$stories/utils';
	import { DateFormatter, getLocalTimeZone, now, type DateValue } from '@internationalized/date';
	import RangeCalendar from '$stories/shadcnui/range-calendar/range-calendar.svelte';
	import type { DateRange } from 'bits-ui';
	import { requestToBorrow } from '$lib/rpc/borrowing.remote';
	import { toast } from 'svelte-sonner';
	import { getAssetAvailability, listAssets } from '$lib/rpc/assets.remote';
	import type { Snippet } from 'svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import { Spinner } from '$stories/shadcnui/spinner';
	import * as Select from '$stories/shadcnui/select';
	import type { AssetView, BorrowingProjectView } from './types';

	interface Props {
		asset: AssetView;
		project?: BorrowingProjectView;
		projects?: BorrowingProjectView[];
		trigger?: Snippet<[{ props: Record<string, unknown> }]>;
	}

	const submitBorrowingMutation = createMutation(() => ({
		mutationFn: async () => saveBooking()
	}));

	let { asset, project, projects = [], trigger }: Props = $props();
	let selectedProjectId = $state('');
	const selectedProject = $derived(
		project ?? projects.find((candidate) => candidate.id === selectedProjectId)
	);
	let availableForDates = $state(0);
	let availabilityPending = $state(false);
	let availabilityRequest = 0;
	let bookingInfoValue = $state({
		amount: 1,
		note: '',
		startDate: new Date(),
		endDate: new Date()
	});
	let dateValue: DateRange = $state({
		start: now('Asia/Bangkok'),
		end: now('Asia/Bangkok').add({ days: 7 })
	});
	let startValue: DateValue | undefined = $state(undefined);
	let isDialogOpen = $state(false);

	$effect(() => {
		if (!selectedProjectId) selectedProjectId = project?.id ?? projects[0]?.id ?? '';
		if (!isDialogOpen) availableForDates = asset.availableAmount;
	});

	$effect(() => {
		const start = dateValue.start;
		const end = dateValue.end;
		if (!start || !end) return;
		const request = ++availabilityRequest;
		availabilityPending = true;
		void getAssetAvailability({
			assetId: asset.id,
			startDate: start.toDate('Asia/Bangkok'),
			endDate: end.toDate('Asia/Bangkok')
		})
			.then((availability) => {
				if (request !== availabilityRequest) return;
				availableForDates = availability.availableAmount;
				bookingInfoValue.amount = Math.min(
					Math.max(1, bookingInfoValue.amount),
					Math.max(1, availableForDates)
				);
				availabilityPending = false;
			})
			.catch(() => {
				if (request !== availabilityRequest) return;
				availableForDates = 0;
				availabilityPending = false;
				toast.error('ตรวจสอบจำนวนพัสดุไม่สำเร็จ');
			});
	});

	const df = new DateFormatter('th-TH', {
		dateStyle: 'long'
	});

	async function saveBooking() {
		if (!dateValue.start || !dateValue.end) {
			toast.error('กรุณาเลือกช่วงวันที่ยืม');
			return;
		}
		if (!selectedProject) {
			toast.error('โปรดเลือกโครงการ');
			return;
		}
		if (bookingInfoValue.amount < 1 || bookingInfoValue.amount > availableForDates) {
			toast.error(`กรุณาเลือกจำนวนที่ยืมระหว่าง 1 ถึง ${availableForDates} ${asset.unitTerm}`);
			return;
		}
		await requestToBorrow({
			assetId: asset.id,
			projectId: selectedProject.id,
			endDate: dateValue.end.toDate('Asia/Bangkok'),
			startDate: dateValue.start.toDate('Asia/Bangkok'),
			amount: bookingInfoValue.amount,
			note: bookingInfoValue.note
		});

		toast.success(`ส่งคำขอยืม ${asset.name} สำหรับโครงการ ${selectedProject.title} เรียบร้อยแล้ว`);
		isDialogOpen = false;
		resetBookingInfo();
		listAssets({
			projectId: selectedProject.id
		}).refresh();
	}

	function resetBookingInfo() {
		bookingInfoValue = {
			amount: 1,
			note: '',
			startDate: new Date(),
			endDate: new Date()
		};
		dateValue = {
			start: now('Asia/Bangkok'),
			end: now('Asia/Bangkok').add({ days: 7 })
		};
		startValue = undefined;
	}
</script>

<Dialog.Root bind:open={isDialogOpen}>
	<Dialog.Trigger>
		{#snippet child(args)}
			{#if trigger}
				{@render trigger({ props: args.props })}
			{:else}
				<Button class="w-full" {...args.props}>
					<ShoppingCart data-icon="inline-start" />
					ยืม
				</Button>
			{/if}
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				{asset.name}
			</Dialog.Title>
			<Dialog.Description>
				<div class="flex flex-row gap-4">
					<div>
						<img
							src={asset.image_url ?? '/placeholder-image.png'}
							alt={asset.name}
							class="mb-4 h-32 rounded-2xl object-cover outline outline-1 -outline-offset-1 outline-border"
						/>
					</div>
					<div class="flex flex-col gap-1 text-start">
						<p>{asset.description}</p>
						<p>ประเภท: {asset.type}</p>
						<p>หมวดหมู่: {asset.category}</p>
						<p>เจ้าของ: {asset.owner}</p>
						<p class="font-bold tabular-nums">
							พร้อมยืมช่วงวันที่เลือก: {availabilityPending
								? 'กำลังตรวจสอบ…'
								: `${availableForDates} ${asset.unitTerm}`}
						</p>
					</div>
				</div>
				<Field.Group class="mt-6 border-t pt-4 text-start">
					<Field.Field>
						<Field.Label for="borrow-project">โครงการ</Field.Label>
						{#if project}
							<p class="text-lg font-semibold text-foreground">{project.title}</p>
						{:else if projects.length}
							<Select.Root type="single" bind:value={selectedProjectId}>
								<Select.Trigger id="borrow-project">
									{selectedProject?.title ?? 'เลือกโครงการ'}
								</Select.Trigger>
								<Select.Content>
									<Select.Group>
										{#each projects as candidate (candidate.id)}
											<Select.Item value={candidate.id}>{candidate.title}</Select.Item>
										{/each}
									</Select.Group>
								</Select.Content>
							</Select.Root>
						{:else}
							<p class="text-sm text-destructive">ยังไม่มีโครงการที่ยืมได้</p>
						{/if}
					</Field.Field>
					<Field.Field>
						<Field.Label for="borrow-amount">จำนวนที่ยืม</Field.Label>
						<InputGroup.Root>
							<InputGroup.Addon>
								<InputGroup.Button
									size="icon-xs"
									aria-label="ลดจำนวนพัสดุ"
									onclick={() => {
										bookingInfoValue.amount = Math.max(1, bookingInfoValue.amount - 1);
									}}
								>
									<Minus />
								</InputGroup.Button>
							</InputGroup.Addon>
							<InputGroup.Input
								id="borrow-amount"
								bind:value={bookingInfoValue.amount}
								type="number"
								min={1}
								max={availableForDates}
								class="text-center text-lg tabular-nums"
							/>
							<InputGroup.Addon align="inline-end">
								<InputGroup.Button
									size="icon-xs"
									aria-label="เพิ่มจำนวนพัสดุ"
									onclick={() => {
										bookingInfoValue.amount = Math.min(
											availableForDates,
											bookingInfoValue.amount + 1
										);
									}}
								>
									<Plus />
								</InputGroup.Button>
							</InputGroup.Addon>
						</InputGroup.Root>
						<Field.Description
							>เลือกได้สูงสุด {availableForDates} {asset.unitTerm}</Field.Description
						>
					</Field.Field>
					<Field.Field>
						<Field.Label for="borrow-note">หมายเหตุ</Field.Label>
						<Input
							id="borrow-note"
							bind:value={bookingInfoValue.note}
							class="text-foreground"
							placeholder="กรอกหมายเหตุ"
						/>
					</Field.Field>
					<Field.Field>
						<Field.Label>ช่วงวันที่ยืม</Field.Label>
						<div class="grid gap-2">
							<Popover.Root>
								<Popover.Trigger
									class={cn(
										buttonVariants({ variant: 'outline', class: 'text-foreground' }),
										!dateValue && 'text-muted-foreground'
									)}
								>
									<CalendarIcon data-icon="inline-start" />
									{#if dateValue && dateValue.start}
										{#if dateValue.end}
											{df.format(dateValue.start.toDate(getLocalTimeZone()))} - {df.format(
												dateValue.end.toDate(getLocalTimeZone())
											)} ({~~(dateValue.end.compare(dateValue.start) / (1000 * 60 * 60 * 24))} วัน)
										{:else}
											{df.format(dateValue.start.toDate(getLocalTimeZone()))}
										{/if}
									{:else if startValue}
										{df.format(startValue.toDate(getLocalTimeZone()))}
									{:else}
										เลือกช่วงวันที่ยืม
									{/if}
								</Popover.Trigger>
								<Popover.Content class="w-auto p-0" align="start">
									<RangeCalendar
										bind:value={dateValue}
										onStartValueChange={(v) => {
											startValue = v;
										}}
										numberOfMonths={2}
										locale="th"
									/>
								</Popover.Content>
							</Popover.Root>
						</div>
					</Field.Field>
					<div>
						<Button
							variant="default"
							class="mt-2 w-full"
							onclick={() => submitBorrowingMutation.mutate()}
							disabled={submitBorrowingMutation.isPending ||
								availabilityPending ||
								availableForDates < 1 ||
								!selectedProject}
						>
							{#if submitBorrowingMutation.isPending}
								<Spinner />
								<span> กำลังส่งคำขอ... </span>
							{:else}
								ส่งคำขอยืม
							{/if}
						</Button>
					</div>
				</Field.Group>
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
