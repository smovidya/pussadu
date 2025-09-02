<script lang="ts">
	import { borrowingStatus, projectStatusOptions } from '$lib/constants';
	import { listBorrowingRequests } from '$lib/rpc/borrowing.remote';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import * as Card from '$stories/shadcnui/card';
	import * as Alert from '$stories/shadcnui/alert';
	import * as Select from '$stories/shadcnui/select';
	import Input from '$stories/shadcnui/input/input.svelte';
	import Badge from '$stories/shadcnui/badge/badge.svelte';
	import { cn } from '$stories/utils';
	import AdminApprovalSidesheet from './admin-approval-sidesheet.svelte';
	import DatePicker from '$stories/date/date-picker.svelte';
	import Separator from '$stories/shadcnui/separator/separator.svelte';
	import type { borrowingFilterSchema } from '$lib/validator/borrowing.validator';
	import Button from '$stories/shadcnui/button/button.svelte';
	import { TextSearch } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import Skeleton from '$stories/shadcnui/skeleton/skeleton.svelte';

	type FilterState = typeof borrowingFilterSchema.infer;

	let filter: FilterState = $state({
		searchTerm: '',
		statuses: ['pending'],
		projectIds: [],
		projectStatus: []
	});

	const presets: Array<{ label: string; state: FilterState }> = [
		{
			label: 'รออนุมัติ',
			state: { searchTerm: '', statuses: ['pending'], projectIds: [], projectStatus: [] }
		},
		{
			label: 'อนุมัติแล้วรอมารับ',
			state: { searchTerm: '', statuses: ['approved'], projectIds: [], projectStatus: [] }
		},
		{
			label: 'โครงจบแต่ยังไม่คืน/ยังยืมอยู่',
			state: {
				searchTerm: '',
				statuses: ['pending', 'approved', 'inuse'],
				projectIds: [],
				projectStatus: ['ended']
			}
		}
	];

	function applyPreset(id: number) {
		const preset = presets[id];
		if (preset) {
			filter = preset.state;
		}
	}

	const filteredRequests = $derived(listBorrowingRequests(filter));
</script>

<PageWrapper pageTitle="รายการยืม" groupTitle="แอดมิน" groupUrl="/admin">
	<div>
		<h1 class="text-2xl font-bold">รายการการยืม</h1>
		<p>ตรวจสอบและอนุมัติการยืมพัสดุในระบบ กดที่การ์ดเพื่อดูรายละเอียดเพิ่มเติมและอนุมัติการยืม</p>
	</div>

	<section>
		<Card.Root>
			<Card.Header>
				<Card.Title>ค้นหาคำขอ</Card.Title>
				<Card.Description>
					พิมพ์คำค้นหา เลือกตัวกรอง หรือเลือกรายการใดรายการหนึ่งด้านล่างเพื่อความรวดเร็ว
					ไม่จำเป็นต้องกรอกทุกช่อง
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex flex-col gap-4">
					<Input
						placeholder="ค้นหาด้วยชื่อพัสดุ คำอธิบายพัสดุ ชื่อผู้ยืม เลขนิสิตผู้ยืม หรือหมายเหตุ"
						bind:value={filter.searchTerm}
					/>
					<div>
						<span class="text-sm text-muted-foreground"> สถานะการยืม </span>
						<div class="flex flex-row items-center gap-2">
							<Select.Root type="multiple" bind:value={filter.statuses}>
								<Select.Trigger class="w-[180px]">
									เลือกไว้ {filter.statuses.length} สถานะ
								</Select.Trigger>
								<Select.Content>
									{#each borrowingStatus as status (status.value)}
										<Select.Item value={status.value}>
											<Badge class={cn('ml-2 border-0', status.color)}>
												{status.label}
											</Badge>
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</div>
					<div>
						<span class="text-sm text-muted-foreground"> วันที่ยืมระหว่าง </span>
						<div class="flex flex-row items-center gap-2">
							<DatePicker bind:value={filter.startDate} />
							<span class="text-sm text-muted-foreground">ถึง</span>
							<DatePicker bind:value={filter.endDate} />
						</div>
						<span class="text-sm text-muted-foreground"> เว้นว่างเพื่อแสดงทั้งหมด </span>
					</div>
					<div>
						<span class="text-sm text-muted-foreground"> สถานะโครงการ </span>
						<div class="flex flex-row items-center gap-2">
							<Select.Root type="multiple" bind:value={filter.projectStatus}>
								<Select.Trigger class="w-[180px]">
									เลือกไว้ {filter.projectStatus.length} สถานะ
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="inprogress">ยังดำเนินอยู่</Select.Item>
									<Select.Item value="ended">โครงสิ้นสุดแล้ว</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
					</div>
					<Separator />
					<div class="flex flex-col gap-2">
						<span class="text-sm text-muted-foreground"> ค้นหาไว ๆ </span>
						<div class="flex flex-wrap space-y-2 space-x-2">
							{#each presets as preset, i (preset.label)}
								<Button size="sm" variant="secondary" onclick={() => applyPreset(i)}>
									<TextSearch />
									{preset.label}
								</Button>
							{/each}
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<AsyncHttpBoundary dataLoader={filteredRequests}>
		{#snippet children(requests)}
			<div
				class="mt-4 grid min-h-screen grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
			>
				{#each requests as request (request.asset_to_project.id)}
					{@const project = projectStatusOptions.find((p) => p.value === request.project?.status)}
					{@const projectStatus = project ? project.label : 'ไม่ระบุสถานะ'}
					{@const requestStatus = borrowingStatus.find(
						(a) => a.value === request.asset_to_project.status
					)}
					<AdminApprovalSidesheet {request}>
						{#snippet trigger({ props })}
							<Card.Root {...props}>
								<Card.Header>
									<Card.Title>{request.asset?.name}</Card.Title>
									<Card.Description>
										โครงการ {request.project?.title} <span>({projectStatus})</span>
									</Card.Description>
								</Card.Header>
								<Card.Content>
									<div class="h-40 w-full overflow-hidden rounded-md bg-muted">
										<img
											src={request.asset?.image_url || '/placeholder/grey.png'}
											alt={request.asset?.name}
											class="h-full w-full object-cover"
										/>
									</div>
									<div class="mt-2 space-y-1 text-sm">
										<div class="flex items-center justify-between gap-2">
											<span class="flex items-center text-muted-foreground"> ชื่อผู้ยืม </span>
											<span>
												{request.borrower?.name}
											</span>
										</div>
										<div class="flex items-center justify-between gap-2">
											<span class="flex items-center text-muted-foreground"> หมายเหตุ </span>
											<span class="truncate">
												{request.asset_to_project.note || '-ไม่ระบุ-'}
											</span>
										</div>
										<div class="flex items-center justify-between gap-2">
											<span class="flex items-center text-muted-foreground"> สถานะ </span>
											<span class="truncate">
												<Badge
													variant="outline"
													class={cn('border-0 shadow', requestStatus?.color)}
												>
													{requestStatus?.label}
												</Badge>
											</span>
										</div>
									</div>
								</Card.Content>
							</Card.Root>
						{/snippet}
					</AdminApprovalSidesheet>
				{:else}
					<div class="text-muted-foreground text-sm text-center col-span-full">
						ไม่มีคำขอที่ตรงกับตัวกรอง
					</div>
				{/each}
			</div>
			<Alert.Root class="mt-4 flex flex-col items-center justify-center">
				<Alert.Title>แสดงผลคำขอสูงสุด 50 รายการ</Alert.Title>
				<Alert.Description>กรุณาใช้ตัวกรองเพื่อค้นหาคำขอที่ต้องการ</Alert.Description>
			</Alert.Root>
		{/snippet}
		{#snippet pending()}
			<div
				transition:fade={{
					duration: 400,
					delay: 200
				}}
			>
				<Skeleton class="h-screen w-full" />
			</div>
		{/snippet}
	</AsyncHttpBoundary>
</PageWrapper>
