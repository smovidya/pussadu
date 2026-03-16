<script lang="ts">
	import { page } from '$app/state';
	import { getLogsByTarget } from '$lib/rpc/log.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';
	import * as Card from '$stories/shadcnui/card';
	import Badge from '$stories/shadcnui/badge/badge.svelte';
	import { ArrowRight, Plus, Minus, FileText, Check, X, AlertCircle } from '@lucide/svelte';
	import { cn } from '$stories/utils';

	const formatDateWithTime = (date: Date | string | null | undefined) => {
		if (!date) return '-';
		return new Date(date).toLocaleString('th-TH', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	let assetId = $derived(page.params.assetId);

	// Helper to extract amount change information
	const getAmountChange = (log: any) => {
		if (log.action === 'add-to-stock' && log.detail?.amountReturned) {
			return { type: 'inc', val: log.detail.amountReturned };
		}
		if (log.action === 'remove-from-stock' && log.detail?.difference) {
			return { type: 'dec', val: log.detail.difference }; // difference is positive but means reduction? Wait, check logic.
			// Logic: remove-from-stock usually means borrowing or reducing stock.
		}
		if (log.action === 'create-asset' && log.detail?.amount) {
			return { type: 'inc', val: log.detail.amount };
		}
		return null;
	};

	const getActionColor = (action: string) => {
		switch (action) {
			case 'create-asset':
				return 'bg-green-500';
			case 'update-asset':
				return 'bg-blue-500';
			case 'remove-asset':
				return 'bg-red-500';
			case 'request-borrow':
				return 'bg-yellow-500';
			case 'add-to-stock':
				return 'bg-green-600';
			case 'remove-from-stock':
				return 'bg-orange-500';
			default:
				return 'bg-gray-500';
		}
	};

	const getActionIcon = (action: string) => {
		switch (action) {
			case 'create-asset':
				return Plus;
			case 'add-to-stock':
				return Plus;
			case 'remove-from-stock':
				return Minus;
			case 'remove-asset':
				return X;
			default:
				return FileText;
		}
	};
</script>

<PageWrapper pageTitle="ประวัติพัสดุ" groupTitle="ประวัติการดำเนินการ" groupUrl="/admin/log">
	<div class="container mx-auto py-10">
		<h2 class="mb-6 text-xl font-bold">Timeline สำหรับพัสดุ ID: {assetId}</h2>
		<div class="mb-4">หมายเหตุ: ใหม่กว่าอยู่บนสุด</div>
		<AsyncHttpBoundary dataLoader={getLogsByTarget({ targetId: assetId || '' })}>
			{#snippet children(logs)}
				<div class="space-y-4">
					{#each logs as log (log.id)}
						{@const amountChange = getAmountChange(log)}
						{@const Icon = getActionIcon(log.action)}
						<div class="flex flex-row items-stretch gap-4">
							<div
								class={cn(
									`flex size-10 min-w-0 shrink-0 items-center justify-center rounded-full text-white shadow-sm`,
									getActionColor(log.action)
								)}
							>
								<Icon class="size-6" />
							</div>

							<Card.Root class="w-full">
								<Card.Header class="pb-2">
									<div class="flex items-center justify-between">
										<div class="flex flex-col gap-1">
											<span class="text-xs text-muted-foreground"
												>{formatDateWithTime(log.createdAt)}</span
											>
											<Card.Title class="text-base font-semibold">{log.action}</Card.Title>
										</div>
										{#if amountChange}
											<Badge
												variant={amountChange.type === 'inc' ? 'default' : 'destructive'}
												class="text-sm"
											>
												{amountChange.type === 'inc' ? '+' : '-'}{amountChange.val}
											</Badge>
										{/if}
									</div>
									<div class="text-sm text-muted-foreground">โดย: {log.actor}</div>
								</Card.Header>
								<Card.Content>
									<p class="text-sm">{log.comment || '-'}</p>
									{#if log.detail}
										<div class="mt-4">
											<details>
												<summary
													class="cursor-pointer text-xs text-muted-foreground hover:underline"
												>
													แสดงข้อมูลดิบ (JSON)
												</summary>
												<pre
													class="mt-2 max-h-50 overflow-auto rounded bg-muted p-2 text-xs">{JSON.stringify(
														log.detail,
														null,
														2
													)}</pre>
											</details>
										</div>
									{/if}
								</Card.Content>
							</Card.Root>
						</div>
					{/each}
					{#if logs.length === 0}
						<div class="text-muted-foreground">ไม่พบประวัติการดำเนินการ</div>
					{/if}
				</div>
			{/snippet}
		</AsyncHttpBoundary>
	</div>
</PageWrapper>
