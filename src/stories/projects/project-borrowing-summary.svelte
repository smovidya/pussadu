<script lang="ts">
	import { borrowingStatus } from '$lib/constants';
	import { listProjectBorrowingRequests } from '$lib/rpc/borrowing.remote';
	import { formatDate } from '$lib/utils/datetime';
	import StatusBadge from '$stories/status-badge/status-badge.svelte';
	import * as Card from '$stories/shadcnui/card';
	import * as Empty from '$stories/shadcnui/empty';
	import { Spinner } from '$stories/shadcnui/spinner';
	import * as Table from '$stories/shadcnui/table';
	import { ClipboardList } from '@lucide/svelte';

	let { projectId }: { projectId: string } = $props();
	const requests = $derived(listProjectBorrowingRequests({ projectId }));
</script>

<Card.Root class="mx-auto mt-6 w-full max-w-7xl">
	<Card.Header
		><Card.Title>คำขอยืมของโครงการ</Card.Title><Card.Description
			>ผู้ประสานงานดูสถานะรวมได้ การอนุมัติและรับคืนยังเป็นหน้าที่เจ้าหน้าที่พัสดุ</Card.Description
		></Card.Header
	>
	<Card.Content>
		{#await requests}<Spinner />{:then rows}
			{#if rows.length}
				<div class="overflow-x-auto rounded-lg border">
					<Table.Root
						><Table.Header
							><Table.Row
								><Table.Head>สถานะ</Table.Head><Table.Head>พัสดุ</Table.Head><Table.Head
									>ผู้ยืม</Table.Head
								><Table.Head class="text-right">จำนวน</Table.Head><Table.Head>ช่วงใช้งาน</Table.Head
								></Table.Row
							></Table.Header
						><Table.Body>
							{#each rows.toSorted((a, b) => (b.asset_to_project.createdAt?.getTime() ?? 0) - (a.asset_to_project.createdAt?.getTime() ?? 0)) as row (row.asset_to_project.id)}
								{@const status = borrowingStatus.find(
									(candidate) => candidate.value === row.asset_to_project.status
								)}
								<Table.Row
									><Table.Cell
										>{#if status}<StatusBadge tone={status.tone}>{status.label}</StatusBadge
											>{/if}</Table.Cell
									><Table.Cell class="font-medium">{row.asset?.name ?? '-'}</Table.Cell><Table.Cell
										>{row.borrower?.name ?? '-'}</Table.Cell
									><Table.Cell class="text-right tabular-nums"
										>{row.asset_to_project.amount} {row.asset?.unitTerm}</Table.Cell
									><Table.Cell
										>{formatDate(row.asset_to_project.startDate)} – {formatDate(
											row.asset_to_project.endDate
										)}</Table.Cell
									></Table.Row
								>
							{/each}
						</Table.Body></Table.Root
					>
				</div>
			{:else}<Empty.Root
					><Empty.Header
						><Empty.Media variant="icon"><ClipboardList /></Empty.Media><Empty.Title
							>ยังไม่มีคำขอยืม</Empty.Title
						><Empty.Description>คำขอจากสมาชิกโครงการจะปรากฏที่นี่</Empty.Description></Empty.Header
					></Empty.Root
				>{/if}
		{/await}
	</Card.Content>
</Card.Root>
