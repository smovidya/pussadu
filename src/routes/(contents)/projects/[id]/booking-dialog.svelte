<script lang="ts">
	import Button, { buttonVariants } from '$stories/shadcnui/button/button.svelte';
	import * as Dialog from '$stories/shadcnui/dialog';
	import * as Popover from '$stories/shadcnui/popover';
	import Input from '$stories/shadcnui/input/input.svelte';
	import Label from '$stories/shadcnui/label/label.svelte';
	import { CalendarIcon, Minus, Plus, ShoppingCart } from '@lucide/svelte';
	import Calendar from '$stories/shadcnui/calendar/calendar.svelte';
	import { cn } from '$stories/utils';
	import { DateFormatter, getLocalTimeZone, now, type DateValue } from '@internationalized/date';
	import RangeCalendar from '$stories/shadcnui/range-calendar/range-calendar.svelte';
	import type { DateRange } from 'bits-ui';
	import { requestToBorrow } from '$lib/rpc/borrowing.remote';
	import { toast } from 'svelte-sonner';

	interface Props {
		asset: {
			name: string;
			description: string | null;
			type: 'normal' | 'durable' | 'key';
			status: 'available' | 'borrowed' | 'reserved' | 'maintenance' | 'lost' | 'damaged';
			amount: number;
			unitTerm: string;
			image_url: string | null;
			category: string;
			owner: string;
			categoryId: string | null;
			id: string;
		};
		project: {
			id: string;
			title: string;
			status: 'notstarted' | 'inprogress' | 'completed' | 'evaluated' | 'cancelled';
			owner: string;
		};
	}

	let { asset, project }: Props = $props();
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

	const df = new DateFormatter('th-TH', {
		dateStyle: 'long'
	});

	async function saveBooking() {
		if (!dateValue.start || !dateValue.end) {
			toast.error('กรุณาเลือกช่วงวันที่ยืม');
			return;
		}
		await requestToBorrow({
			assetId: asset.id,
			projectId: project.id,
			endDate: dateValue.end.toDate('Asia/Bangkok'),
			startDate: dateValue.start.toDate('Asia/Bangkok'),
			amount: bookingInfoValue.amount,
			note: bookingInfoValue.note
		});

		toast.success(`ส่งคำขอยืม ${asset.name} สำหรับโครงการ ${project.title} เรียบร้อยแล้ว`);
	}
</script>

<Dialog.Root>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button class="w-full" {...props}>
				<ShoppingCart class="mr-2" />
				ยืม
			</Button>
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
							class="mb-4 h-32 rounded-2xl object-cover"
						/>
					</div>
					<div>
						<p>{asset.description}</p>
						<p>ประเภท: {asset.type}</p>
						<p>สถานะ: {asset.status}</p>
						<p class="font-bold">จำนวน: {asset.amount} {asset.unitTerm}</p>
						<p>หมวดหมู่: {asset.category}</p>
						<p>เจ้าของ: {asset.owner}</p>
					</div>
				</div>
				<div class="mt-6 flex flex-col gap-2 border-t pt-4">
					<div class="flex flex-col gap-1">
						<Label>โครงการ</Label>
						<p class="text-lg font-semibold text-gray-900">{project.title}</p>
					</div>
					<div class="flex flex-col gap-1">
						<Label>จำนวนที่ยืม</Label>
						<div class="flex flex-row gap-2 text-gray-900">
							<Button
								size="icon"
								variant="outline"
								onclick={() => {
									bookingInfoValue.amount = Math.max(1, bookingInfoValue.amount - 1);
								}}
							>
								<Minus />
							</Button>
							<Input
								bind:value={bookingInfoValue.amount}
								type="number"
								min={1}
								max={asset.amount}
								class="text-center text-lg"
							/>
							<Button
								size="icon"
								variant="outline"
								onclick={() => {
									bookingInfoValue.amount = Math.min(asset.amount, bookingInfoValue.amount + 1);
								}}
							>
								<Plus />
							</Button>
						</div>
					</div>
					<div class="flex flex-col gap-2">
						<Label>หมายเหตุ</Label>
						<Input
							bind:value={bookingInfoValue.note}
							class="text-gray-900"
							placeholder="กรอกหมายเหตุ"
						/>
					</div>
					<div class="flex flex-col gap-2">
						<Label>ช่วงวันที่ยืม</Label>
						<div class="grid gap-2">
							<Popover.Root>
								<Popover.Trigger
									class={cn(
										buttonVariants({ variant: 'outline', class: 'text-gray-900' }),
										!dateValue && 'text-muted-foreground'
									)}
								>
									<CalendarIcon class="mr-2 size-4" />
									{#if dateValue && dateValue.start}
										{#if dateValue.end}
											{df.format(dateValue.start.toDate(getLocalTimeZone()))} - {df.format(
												dateValue.end.toDate(getLocalTimeZone())
											)} ({dateValue.end.compare(dateValue.start) / (1000 * 60 * 60 * 24)} วัน)
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
					</div>
					<div>
						<Button variant="default" class="mt-2 w-full" onclick={async () => await saveBooking()}
							>ยืนยันการจอง</Button
						>
					</div>
				</div>
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
