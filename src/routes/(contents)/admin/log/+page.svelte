<script lang="ts">
	import { getAllSystemLogs } from '$lib/rpc/log.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';
	import * as Table from '$stories/shadcnui/table';
	import { Input } from '$stories/shadcnui/input';
	import { ArrowDown, ArrowUp } from '@lucide/svelte';

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

	let search = $state('');
	let action = $state('all');
	let sortBy = $state('createdAt');
	let sortDirection = $state<'asc' | 'desc'>('desc');

	// Debounce search
	let debouncedSearch = $state('');
	let timer: any;

	$effect(() => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			debouncedSearch = search;
		}, 500);
	});

	const toggleSort = (field: string) => {
		if (sortBy === field) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = field;
			sortDirection = 'desc';
		}
	};

	const LOG_ACTIONS = [
		'all',
		'create-asset',
		'update-asset',
		'remove-asset',
		'request-borrow',
		'add-to-stock',
		'remove-from-stock',
		'update-borrowing-request',
		'create-project',
		'assign-borrower-to-project',
		'unassign-borrower',
		'update-project',
		'remove-project',
		'create-student-user',
		'bulk-create-student-users',
		'bulk-ban-student-users',
		'bulk-unban-student-users',
		'bulk-remove-student-users',
		'set-student-role'
	];
</script>

<PageWrapper pageTitle="ประวัติการดำเนินการ" groupTitle="แอดมิน" groupUrl="/admin/approval">
	<div class="container mx-auto py-10">
		<div class="mb-4 flex flex-col gap-4 md:flex-row">
			<Input
				placeholder="ค้นหา (ผู้กระทำ, เป้าหมาย, การกระทำ)"
				class="max-w-sm"
				bind:value={search}
			/>
			<select
				class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:w-[200px]"
				bind:value={action}
			>
				{#each LOG_ACTIONS as act}
					<option value={act}>{act === 'all' ? 'ทั้งหมด' : act}</option>
				{/each}
			</select>
		</div>

		<AsyncHttpBoundary
			dataLoader={getAllSystemLogs({
				search: debouncedSearch,
				action,
				sortBy,
				sortDirection
			})}
		>
			{#snippet children(logs)}
				<div class="rounded-md border">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="cursor-pointer" onclick={() => toggleSort('createdAt')}>
									<div class="flex items-center gap-2">
										วันที่
										{#if sortBy === 'createdAt'}
											{#if sortDirection === 'asc'}<ArrowUp class="size-4" />{:else}<ArrowDown
													class="size-4"
												/>{/if}
										{/if}
									</div>
								</Table.Head>
								<Table.Head class="cursor-pointer" onclick={() => toggleSort('actor')}>
									<div class="flex items-center gap-2">
										ผู้กระทำ
										{#if sortBy === 'actor'}
											{#if sortDirection === 'asc'}<ArrowUp class="size-4" />{:else}<ArrowDown
													class="size-4"
												/>{/if}
										{/if}
									</div>
								</Table.Head>
								<Table.Head class="cursor-pointer" onclick={() => toggleSort('action')}>
									<div class="flex items-center gap-2">
										การกระทำ
										{#if sortBy === 'action'}
											{#if sortDirection === 'asc'}<ArrowUp class="size-4" />{:else}<ArrowDown
													class="size-4"
												/>{/if}
										{/if}
									</div>
								</Table.Head>
								<Table.Head class="cursor-pointer" onclick={() => toggleSort('target')}>
									<div class="flex items-center gap-2">
										เป้าหมาย
										{#if sortBy === 'target'}
											{#if sortDirection === 'asc'}<ArrowUp class="size-4" />{:else}<ArrowDown
													class="size-4"
												/>{/if}
										{/if}
									</div>
								</Table.Head>
								<Table.Head>รายละเอียด</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each logs as log (log.id)}
								<Table.Row>
									<Table.Cell>{formatDateWithTime(log.createdAt)}</Table.Cell>
									<Table.Cell>{log.actor}</Table.Cell>
									<Table.Cell>{log.action}</Table.Cell>
									<Table.Cell>{log.target}</Table.Cell>
									<Table.Cell>
										{#if log.detail}
											<details>
												<summary class="cursor-pointer text-sm text-muted-foreground"
													>JSON Details</summary
												>
												<pre
													class="max-w-[400px] overflow-auto rounded bg-muted p-2 text-xs">{JSON.stringify(
														log.detail,
														null,
														2
													)}</pre>
											</details>
										{:else}
											<div class="text-sm text-muted-foreground">-</div>
										{/if}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			{/snippet}
		</AsyncHttpBoundary>
	</div>
</PageWrapper>
