<script lang="ts">
	import { userRoleOptions } from '$lib/constants';
	import JsonView from './json-view.svelte';
	import LogDetailDiff from './log-detail-diff.svelte';
	import LogDetailKv from './log-detail-kv.svelte';
	import RawJsonToggle from './raw-json-toggle.svelte';
	import { isComplexValue } from './log-field-labels';

	let {
		action,
		detail
	}: {
		action: string;
		detail: Record<string, unknown> | null;
	} = $props();

	// Full-row / simple payloads that read well as a key-value summary
	const KV_ACTIONS = [
		'create-asset',
		'remove-asset',
		'create-project',
		'create-borrower',
		'request-borrow',
		'create-student-user',
		'assign-borrower-to-project',
		'remove-project',
		'remove-borrower',
		'unassign-borrower'
	];
	// Partial payloads: only the fields that were changed are stored
	const UPDATE_KV_ACTIONS = ['update-asset', 'update-borrower', 'update-project'];
	const BULK_ACTIONS = [
		'bulk-create-student-users',
		'bulk-ban-student-users',
		'bulk-unban-student-users',
		'bulk-remove-student-users'
	];

	const KV_KEY_ORDER = [
		'name',
		'title',
		'email',
		'amount',
		'unitTerm',
		'type',
		'status',
		'category',
		'owner',
		'startDate',
		'endDate',
		'borrowerId',
		'projectId',
		'assetId'
	];
	const BULK_LIST_CAP = 10;

	const isRecord = (value: unknown): value is Record<string, unknown> =>
		isComplexValue(value) && !Array.isArray(value);

	const bulkItemText = (item: unknown): string => {
		if (typeof item === 'string') return item;
		if (isRecord(item)) return String(item.email ?? item.id ?? JSON.stringify(item));
		return String(item);
	};
	const bulkItemError = (item: unknown): string | undefined =>
		isRecord(item) && typeof item.error === 'string' ? item.error : undefined;

	const roleLabel = (role: unknown) =>
		userRoleOptions.find((opt) => opt.value === role)?.label ?? String(role);
</script>

{#snippet bulkList(items: unknown[], tone: 'success' | 'failure')}
	{@const toneClass = tone === 'success' ? 'text-success' : 'text-destructive'}
	<ul class="flex flex-col gap-0.5">
		{#each items.slice(0, BULK_LIST_CAP) as item, i (i)}
			<li class="break-all">
				<code class={toneClass}>{bulkItemText(item)}</code>
				{#if bulkItemError(item)}
					<span class="text-muted-foreground">— {bulkItemError(item)}</span>
				{/if}
			</li>
		{/each}
	</ul>
	{#if items.length > BULK_LIST_CAP}
		<details>
			<summary class="cursor-pointer text-muted-foreground select-none hover:underline">
				<span class="tabular-nums">แสดงอีก {items.length - BULK_LIST_CAP} รายการ</span>
			</summary>
			<ul class="flex flex-col gap-0.5">
				{#each items.slice(BULK_LIST_CAP) as item, i (i)}
					<li class="break-all">
						<code class={toneClass}>{bulkItemText(item)}</code>
						{#if bulkItemError(item)}
							<span class="text-muted-foreground">— {bulkItemError(item)}</span>
						{/if}
					</li>
				{/each}
			</ul>
		</details>
	{/if}
{/snippet}

{#if !detail}
	<span class="text-sm text-muted-foreground">-</span>
{:else}
	<div class="text-xs">
		{#if KV_ACTIONS.includes(action)}
			<LogDetailKv data={detail} keys={KV_KEY_ORDER} />
		{:else if UPDATE_KV_ACTIONS.includes(action)}
			<p class="mb-1 font-medium text-muted-foreground">ฟิลด์ที่แก้ไข</p>
			<LogDetailKv data={detail} keys={KV_KEY_ORDER} />
		{:else if action === 'update-borrowing-request' && isRecord(detail.to)}
			<LogDetailDiff from={isRecord(detail.from) ? detail.from : null} to={detail.to} />
		{:else if action === 'add-to-stock' && typeof detail.amountReturned === 'number'}
			<p class="mb-1 font-medium text-success">
				<span class="tabular-nums">รับคืนเข้าคลัง +{detail.amountReturned}</span>
			</p>
			{#if isRecord(detail.request)}
				<LogDetailKv data={detail.request} keys={KV_KEY_ORDER} />
			{/if}
		{:else if action === 'remove-from-stock' && typeof detail.difference === 'number'}
			<p class="mb-1 font-medium text-warning tabular-nums">
				ตัดออกจากคลัง −{detail.difference} (คงเหลือ {detail.newAmount})
			</p>
			{#if isRecord(detail.request)}
				<LogDetailKv data={detail.request} keys={KV_KEY_ORDER} />
			{/if}
		{:else if BULK_ACTIONS.includes(action) && Array.isArray(detail.succeeded) && Array.isArray(detail.failed)}
			<div class="flex flex-col gap-1.5">
				{#if typeof detail.reason === 'string' && detail.reason}
					<p><span class="font-medium text-muted-foreground">เหตุผล:</span> {detail.reason}</p>
				{/if}
				{#if detail.succeeded.length > 0}
					<div>
						<p class="font-medium text-success">
							<span class="tabular-nums">สำเร็จ ({detail.succeeded.length})</span>
						</p>
						{@render bulkList(detail.succeeded, 'success')}
					</div>
				{/if}
				{#if detail.failed.length > 0}
					<div>
						<p class="font-medium text-destructive">
							<span class="tabular-nums">ล้มเหลว ({detail.failed.length})</span>
						</p>
						{@render bulkList(detail.failed, 'failure')}
					</div>
				{/if}
			</div>
		{:else if action === 'set-student-role' && typeof detail.role === 'string'}
			<p>เปลี่ยนบทบาทเป็น <span class="font-medium">{roleLabel(detail.role)}</span></p>
		{:else if action === 'send-return-reminders' && typeof detail.count === 'number'}
			<p class="tabular-nums">ส่งอีเมลแจ้งเตือนคืนพัสดุ {detail.count} ฉบับ</p>
		{:else}
			<JsonView value={detail} showFooter={false} />
		{/if}
		<RawJsonToggle value={detail} />
	</div>
{/if}
