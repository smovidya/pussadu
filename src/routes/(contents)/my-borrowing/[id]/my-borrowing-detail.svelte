<script lang="ts">
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import { getMyBorrowingRequestInfo } from '$lib/rpc/borrowing.remote';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import Badge from '$stories/shadcnui/badge/badge.svelte';
	import { Separator } from '$stories/shadcnui/separator';
	import { borrowingStatus, projectStatusOptions } from '$lib/constants';
	import { formatDate } from '$lib/utils/datetime';
	import { cn } from '$stories/utils';

	let { id }: { id: string } = $props();
</script>

<PageWrapper groupTitle="ยืมพัสดุ" pageTitle="รายละเอียดการยืม" groupUrl="/my-borrowing">
	<AsyncHttpBoundary dataLoader={getMyBorrowingRequestInfo({ id })}>
		{#snippet children(request)}
			{@const status = borrowingStatus.find((s) => s.value === request.status)}
			{@const projectStatus = projectStatusOptions.find((s) => s.value === request.project?.status)}
			<div class="mx-auto flex w-full max-w-2xl flex-col gap-4">
				<div class="flex flex-col gap-1">
					<div class="flex items-center gap-2">
						<h1 class="text-2xl font-bold">{request.asset?.name}</h1>
						<Badge class={cn('border-0', status?.color)}>{status?.label}</Badge>
					</div>
					<p class="text-muted-foreground">{request.asset?.description}</p>
				</div>

				{#if request.asset?.image_url}
					<div class="w-full overflow-hidden rounded-md border shadow">
						<img
							src={request.asset.image_url}
							alt="ตัวอย่างภาพพัสดุ"
							class="h-64 w-full object-cover"
						/>
					</div>
				{/if}

				<Separator />

				<div class="flex flex-col gap-1">
					<span class="text-sm text-muted-foreground">โครงการ</span>
					<div class="flex items-center gap-2">
						<strong class="text-lg">{request.project?.title}</strong>
						{#if projectStatus}
							<Badge class={cn('border-0 bg-background', projectStatus.color)}>
								{projectStatus.label}
							</Badge>
						{/if}
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="flex flex-col gap-1">
						<span class="text-sm text-muted-foreground">จำนวน</span>
						<strong class="text-lg">{request.amount} {request.asset?.unitTerm}</strong>
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-sm text-muted-foreground">ช่วงวันที่ยืม</span>
						<strong class="text-lg">
							{formatDate(request.startDate)} - {formatDate(request.endDate)}
						</strong>
					</div>
				</div>

				<Separator />

				<div class="flex flex-col gap-1">
					<span class="text-sm text-muted-foreground">หมายเหตุของคุณ</span>
					<p>{request.note || '-ไม่ระบุ-'}</p>
				</div>

				<div class="flex flex-col gap-1">
					<span class="text-sm text-muted-foreground">หมายเหตุจากแอดมิน</span>
					<p>{request.adminNote || '-ไม่ระบุ-'}</p>
				</div>
			</div>
		{/snippet}

		{#snippet pending()}
			<div class="mx-auto flex w-full max-w-2xl flex-col gap-4">
				<Skeleton class="h-8 w-1/2" />
				<Skeleton class="h-64 w-full" />
				<Skeleton class="h-12 w-full" />
				<Skeleton class="h-12 w-full" />
			</div>
		{/snippet}
	</AsyncHttpBoundary>
</PageWrapper>
