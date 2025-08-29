<script lang="ts">
	import { listBorrowed } from '$lib/rpc/borrowing.remote';
	import * as Table from '$stories/shadcnui/table';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import { borrowingStatus, projectStatusOptions } from '$lib/constants';
	import { Badge } from '$stories/shadcnui/badge';
	import { cn } from '$stories/utils';
	import { formatDate } from '$lib/utils/datetime';
</script>

<PageWrapper pageTitle="รายการยืมของฉัน" groupTitle="ยืมพัสดุ" groupUrl="/projects">
	<div>
		<h1 class="text-2xl font-bold">รายการยืมของฉัน</h1>
		<p>แสดงรายการพัสดุที่ยืมอยู่ในขณะนี้</p>
	</div>
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
						<Table.Row>
							<Table.Cell>
								<Badge class={cn('text-medium', status?.color)}>
									{status?.label}
								</Badge>
							</Table.Cell>
							<Table.Cell class="flex flex-row items-center"
								>{item.project.title}
								<Badge class={cn(projectStatus?.color, 'bg-background')}
									>{projectStatus?.label}</Badge
								></Table.Cell
							>
							<Table.Cell class="font-medium">{item.asset.name}</Table.Cell>
							<Table.Cell class="text-right">{item.amount} {item.asset.unitTerm}</Table.Cell>
							<Table.Cell>
								{formatDate(item.startDate)} - {formatDate(item.endDate)}
							</Table.Cell>
							<Table.Cell>{item.note ?? '-'}</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colSpan={6} class="text-center">ไม่มีรายการยืม</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/await}
</PageWrapper>
