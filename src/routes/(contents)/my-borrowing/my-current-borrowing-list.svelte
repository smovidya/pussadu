<script lang="ts">
	import { resolve } from '$app/paths';
	import { listBorrowed } from '$lib/rpc/borrowing.remote';
	import * as Table from '$stories/shadcnui/table';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import { borrowingStatus, projectStatusOptions } from '$lib/constants';
	import StatusBadge from '$stories/status-badge/status-badge.svelte';
	import PageHeader from '$stories/page-header/page-header.svelte';
	import * as Empty from '$stories/shadcnui/empty';
	import { formatDate } from '$lib/utils/datetime';
</script>

<PageWrapper pageTitle="รายการยืมของฉัน" groupTitle="ยืมพัสดุ" groupUrl="/projects">
	<PageHeader title="รายการยืมของฉัน" description="แสดงรายการพัสดุที่ยืมอยู่ในขณะนี้" />
	{#await listBorrowed()}
		<Skeleton class="h-20 w-full" />
	{:then borrowedItems}
		<div class="w-full overflow-x-auto">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>สถานะ</Table.Head>
						<Table.Head>โครงการ</Table.Head>
						<Table.Head class="min-w-[100px]">รายการ</Table.Head>
						<Table.Head class="text-right">จำนวน</Table.Head>
						<Table.Head>ช่วงวันที่ยืม</Table.Head>
						<Table.Head>หมายเหตุ</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each borrowedItems as item (item.id)}
						{@const status = borrowingStatus.find((s) => s.value === item.status)}
						{@const projectStatus = projectStatusOptions.find(
							(s) => s.value === item.project.status
						)}
						<Table.Row class="hover:bg-muted/50">
							<Table.Cell>
								{#if status}<StatusBadge tone={status.tone}>{status.label}</StatusBadge>{/if}
							</Table.Cell>
							<Table.Cell class="flex flex-row items-center"
								>{item.project.title}
								{#if projectStatus}
									<StatusBadge tone={projectStatus.tone}>{projectStatus.label}</StatusBadge>
								{/if}</Table.Cell
							>
							<Table.Cell class="font-medium">
								<a
									href={resolve(`/my-borrowing/${item.id}`)}
									class="rounded-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
								>
									{item.asset.name}
								</a>
							</Table.Cell>
							<Table.Cell class="text-right tabular-nums"
								>{item.amount} {item.asset.unitTerm}</Table.Cell
							>
							<Table.Cell>
								{formatDate(item.startDate)} - {formatDate(item.endDate)}
							</Table.Cell>
							<Table.Cell>{item.note ?? '-'}</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={6}>
								<Empty.Root
									><Empty.Header><Empty.Title>ไม่มีรายการยืม</Empty.Title></Empty.Header
									></Empty.Root
								>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/await}
</PageWrapper>
