<script lang="ts">
	import { getAllSystemLogs } from '$lib/rpc/log.remote';
	import { getUserDirectory } from '$lib/rpc/user.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';
	import * as Table from '$stories/shadcnui/table';
	import * as Select from '$stories/shadcnui/select';
	import * as Collapsible from '$stories/shadcnui/collapsible';
	import * as HoverCard from '$stories/shadcnui/hover-card';
	import * as Avatar from '$stories/shadcnui/avatar';
	import * as Pagination from '$stories/shadcnui/pagination';
	import { Input } from '$stories/shadcnui/input';
	import Badge from '$stories/shadcnui/badge/badge.svelte';
	import Button from '$stories/shadcnui/button/button.svelte';
	import { ArrowDown, ArrowUp, ChevronsUpDown, ScrollText, XIcon } from '@lucide/svelte';
	import { logActionOptions } from '$lib/constants';
	import { formatRelativeTime } from '$lib/utils/datetime';
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

	let search = $state('');
	let action = $state('all');
	let sortBy = $state('createdAt');
	let sortDirection = $state<'asc' | 'desc'>('desc');
	const pageSize = 25;
	let page = $state(1);

	// Debounce search
	let debouncedSearch = $state('');
	let timer: ReturnType<typeof setTimeout>;

	$effect(() => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			debouncedSearch = search;
			page = 1;
		}, 500);
	});

	$effect(() => {
		// reset to first page whenever filters/sort change (search handled via debounce above)
		void action;
		void sortBy;
		void sortDirection;
		page = 1;
	});

	const toggleSort = (field: string) => {
		if (sortBy === field) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = field;
			sortDirection = 'desc';
		}
	};

	const isFiltered = $derived(search !== '' || action !== 'all');
	const selectedAction = $derived(logActionOptions.find((a) => a.value === action));

	function actionMeta(value: string) {
		return logActionOptions.find((a) => a.value === value);
	}
</script>

{#snippet SortIcon({ field }: { field: string })}
	{#if sortBy === field}
		{#if sortDirection === 'asc'}
			<ArrowUp class="size-3.5" />
		{:else}
			<ArrowDown class="size-3.5" />
		{/if}
	{:else}
		<ChevronsUpDown class="size-3.5 text-muted-foreground/50" />
	{/if}
{/snippet}

<PageWrapper pageTitle="ประวัติการดำเนินการ" groupTitle="แอดมิน" groupUrl="/admin/approval">
	<div class="container mx-auto flex flex-col gap-4 py-10">
		<div class="flex flex-col gap-1">
			<h1 class="flex items-center gap-2 text-2xl font-bold">
				<ScrollText class="size-6 text-muted-foreground" />
				ประวัติการดำเนินการ
			</h1>
			<p class="text-muted-foreground">
				ประวัติการกระทำทั้งหมดของผู้ดูแลระบบและสตาฟในระบบ ใช้ตรวจสอบย้อนหลังได้
			</p>
		</div>

		<div class="flex flex-col gap-2 md:flex-row md:items-center">
			<Input
				placeholder="ค้นหา (ผู้กระทำ, เป้าหมาย, คำอธิบาย)"
				class="max-w-sm"
				bind:value={search}
			/>
			<Select.Root type="single" bind:value={action}>
				<Select.Trigger class="w-full md:w-[220px]">
					{#if selectedAction}
						<selectedAction.icon class={cn('mr-1 size-4 shrink-0', selectedAction.color)} />
						{selectedAction.label}
					{/if}
				</Select.Trigger>
				<Select.Content>
					{#each logActionOptions as opt (opt.value)}
						<Select.Item value={opt.value}>
							<opt.icon class={cn('mr-2 size-4 shrink-0', opt.color)} />
							{opt.label}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			{#if isFiltered}
				<Button
					variant="ghost"
					size="sm"
					onclick={() => {
						search = '';
						action = 'all';
					}}
				>
					รีเซ็ต
					<XIcon />
				</Button>
			{/if}
		</div>

		<AsyncHttpBoundary
			dataLoader={Promise.all([
				getAllSystemLogs({
					search: debouncedSearch,
					action,
					sortBy,
					sortDirection,
					page: page - 1,
					pageSize
				}),
				getUserDirectory()
			])}
		>
			{#snippet children([{ logs, total }, directory])}
				{@const actorDirectory = new Map(
					directory.filter((u) => u.ouid).map((u) => [u.ouid as string, u])
				)}
				<p class="text-sm text-muted-foreground">
					พบ {total} รายการ (หน้า {page} จาก {Math.max(1, Math.ceil(total / pageSize))})
				</p>
				<div class="overflow-x-auto rounded-md border">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-40">
									<button
										class="flex items-center gap-1.5 hover:text-foreground"
										onclick={() => toggleSort('createdAt')}
									>
										เวลา
										{@render SortIcon({ field: 'createdAt' })}
									</button>
								</Table.Head>
								<Table.Head class="w-56">
									<button
										class="flex items-center gap-1.5 hover:text-foreground"
										onclick={() => toggleSort('action')}
									>
										การกระทำ
										{@render SortIcon({ field: 'action' })}
									</button>
								</Table.Head>
								<Table.Head>คำอธิบาย</Table.Head>
								<Table.Head class="w-32">
									<button
										class="flex items-center gap-1.5 hover:text-foreground"
										onclick={() => toggleSort('actor')}
									>
										ผู้กระทำ
										{@render SortIcon({ field: 'actor' })}
									</button>
								</Table.Head>
								<Table.Head class="w-40">
									<button
										class="flex items-center gap-1.5 hover:text-foreground"
										onclick={() => toggleSort('target')}
									>
										เป้าหมาย
										{@render SortIcon({ field: 'target' })}
									</button>
								</Table.Head>
								<Table.Head class="w-20">รายละเอียด</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each logs as log (log.id)}
								{@const meta = actionMeta(log.action)}
								<Table.Row>
									<Table.Cell class="whitespace-nowrap">
										<span title={formatDateWithTime(log.createdAt)} class="text-sm">
											{log.createdAt ? formatRelativeTime(log.createdAt) : '-'}
										</span>
									</Table.Cell>
									<Table.Cell>
										<Badge class={cn('gap-1.5 border-0 font-normal', meta?.color)}>
											{#if meta}
												<meta.icon class="size-3.5" />
											{/if}
											{meta?.label ?? log.action}
										</Badge>
									</Table.Cell>
									<Table.Cell class="max-w-90">
										<p class="truncate text-sm" title={log.comment ?? undefined}>
											{log.comment || '-'}
										</p>
									</Table.Cell>
									<Table.Cell>
										{@const actorInfo = actorDirectory.get(log.actor)}
										{#if actorInfo}
											<HoverCard.Root>
												<HoverCard.Trigger>
													{#snippet child({ props })}
														<button
															{...props}
															class="flex max-w-36 flex-col items-start text-left leading-tight"
														>
															<span class="truncate text-sm font-medium hover:underline"
																>{actorInfo.name}</span
															>
															<span class="truncate text-xs text-muted-foreground"
																>{actorInfo.email}</span
															>
														</button>
													{/snippet}
												</HoverCard.Trigger>
												<HoverCard.Content class="w-72">
													<div class="flex gap-3">
														<Avatar.Root>
															<Avatar.Fallback>
																{actorInfo.name?.trim()?.[0]?.toUpperCase() ?? '?'}
															</Avatar.Fallback>
														</Avatar.Root>
														<div class="flex flex-col gap-0.5 text-sm">
															<span class="font-semibold">{actorInfo.name}</span>
															<span class="text-muted-foreground">{actorInfo.email}</span>
															<code class="text-xs text-muted-foreground">{actorInfo.ouid}</code>
														</div>
													</div>
												</HoverCard.Content>
											</HoverCard.Root>
										{:else}
											<code class="rounded bg-muted px-1.5 py-0.5 text-xs">{log.actor}</code>
										{/if}
									</Table.Cell>
									<Table.Cell>
										<code class="rounded bg-muted px-1.5 py-0.5 text-xs">{log.target}</code>
									</Table.Cell>
									<Table.Cell>
										{#if log.detail}
											<Collapsible.Root>
												<Collapsible.Trigger>
													{#snippet child({ props })}
														<Button {...props} variant="ghost" size="sm" class="h-7 px-2 text-xs">
															JSON
														</Button>
													{/snippet}
												</Collapsible.Trigger>
												<Collapsible.Content>
													<pre
														class="mt-2 max-w-100 overflow-auto rounded bg-muted p-2 text-xs">{JSON.stringify(
															log.detail,
															null,
															2
														)}</pre>
												</Collapsible.Content>
											</Collapsible.Root>
										{:else}
											<span class="text-sm text-muted-foreground">-</span>
										{/if}
									</Table.Cell>
								</Table.Row>
							{:else}
								<Table.Row>
									<Table.Cell colspan={6} class="h-32 text-center text-muted-foreground">
										ไม่พบประวัติการดำเนินการ
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>

				{#if total > pageSize}
					<Pagination.Root count={total} perPage={pageSize} bind:page siblingCount={1}>
						{#snippet children({ pages, currentPage })}
							<Pagination.Content>
								<Pagination.Item>
									<Pagination.PrevButton />
								</Pagination.Item>
								{#each pages as p (p.key)}
									{#if p.type === 'ellipsis'}
										<Pagination.Item>
											<Pagination.Ellipsis />
										</Pagination.Item>
									{:else}
										<Pagination.Item>
											<Pagination.Link page={p} isActive={currentPage === p.value} />
										</Pagination.Item>
									{/if}
								{/each}
								<Pagination.Item>
									<Pagination.NextButton />
								</Pagination.Item>
							</Pagination.Content>
						{/snippet}
					</Pagination.Root>
				{/if}
			{/snippet}
		</AsyncHttpBoundary>
	</div>
</PageWrapper>
