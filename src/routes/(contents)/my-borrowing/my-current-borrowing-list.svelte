<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { listBorrowed } from '$lib/rpc/borrowing.remote';
	import { borrowingStatus } from '$lib/constants';
	import { formatDate } from '$lib/utils/datetime';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import PageHeader from '$stories/page-header/page-header.svelte';
	import StatusBadge from '$stories/status-badge/status-badge.svelte';
	import { Button } from '$stories/shadcnui/button';
	import { Input } from '$stories/shadcnui/input';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import * as Card from '$stories/shadcnui/card';
	import * as Empty from '$stories/shadcnui/empty';
	import * as Select from '$stories/shadcnui/select';
	import * as Table from '$stories/shadcnui/table';
	import * as Tabs from '$stories/shadcnui/tabs';
	import { ArrowRight, Clock3, PackagePlus, Search } from '@lucide/svelte';

	type Item = Awaited<ReturnType<typeof listBorrowed>>[number];
	const currentStatuses = ['pending', 'approved', 'inuse'] as const;
	let search = $state(page.url.searchParams.get('query') ?? '');
	let selectedStatus = $state(page.url.searchParams.get('status') ?? 'all');

	function setParams(values: Record<string, string | null>) {
		const url = new URL(page.url);
		for (const [key, value] of Object.entries(values)) {
			if (value) url.searchParams.set(key, value);
			else url.searchParams.delete(key);
		}
		const destination = resolve(`/my-borrowing${url.search}`);
		goto(destination, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	function dueInfo(item: Item) {
		if (item.status !== 'inuse') return null;
		const days = Math.ceil((item.endDate.getTime() - Date.now()) / 86_400_000);
		if (days < 0) return { label: `เกินกำหนด ${Math.abs(days)} วัน`, tone: 'destructive' as const };
		if (days === 0) return { label: 'ครบกำหนดวันนี้', tone: 'warning' as const };
		if (days <= 3) return { label: `เหลือ ${days} วัน`, tone: 'warning' as const };
		return { label: `เหลือ ${days} วัน`, tone: 'neutral' as const };
	}

	function nextAction(item: Item) {
		if (item.status === 'pending') {
			const days = item.createdAt
				? Math.max(0, Math.floor((Date.now() - item.createdAt.getTime()) / 86_400_000))
				: 0;
			return days ? `รอฝ่ายพัสดุตรวจมา ${days} วัน (ไม่มีวันหมดอายุ)` : 'รอฝ่ายพัสดุตรวจคำขอ';
		}
		if (item.status === 'approved') return 'พร้อมรับพัสดุ';
		if (item.status === 'inuse') return dueInfo(item)?.label ?? 'ส่งคืนตามกำหนด';
		if (item.status === 'rejected') return 'ตรวจเหตุผลแล้วส่งคำขอใหม่';
		if (item.status === 'cancelled') return 'ยืมรายการนี้ใหม่ได้';
		return 'เสร็จสิ้น';
	}

	function sortCurrent(items: Item[]) {
		return items.toSorted((a, b) => {
			const rank = (item: Item) => {
				if (item.status === 'inuse' && item.endDate < new Date()) return 0;
				if (item.status === 'inuse') return 1;
				if (item.status === 'approved') return 2;
				return 3;
			};
			return rank(a) - rank(b) || a.endDate.getTime() - b.endDate.getTime();
		});
	}
</script>

<PageWrapper pageTitle="รายการยืมของฉัน" groupTitle="ยืมพัสดุ" groupUrl="/projects">
	<PageHeader title="รายการยืมของฉัน" description="ติดตามคำขอ รับพัสดุ และตรวจวันส่งคืน">
		{#snippet actions()}
			<Button href={resolve('/projects')}
				><PackagePlus data-icon="inline-start" />ยืมพัสดุเพิ่ม</Button
			>
		{/snippet}
	</PageHeader>

	{#await listBorrowed()}
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{#each Array(4) as _, index (index)}<Skeleton class="h-28 w-full" />{/each}
		</div>
	{:then items}
		{@const counts = {
			pending: items.filter((item) => item.status === 'pending').length,
			approved: items.filter((item) => item.status === 'approved').length,
			inuse: items.filter((item) => item.status === 'inuse').length,
			due: items.filter(
				(item) => item.status === 'inuse' && item.endDate.getTime() <= Date.now() + 3 * 86_400_000
			).length
		}}
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{#each [{ label: 'รออนุมัติ', value: counts.pending, tone: 'info' as const }, { label: 'พร้อมรับ', value: counts.approved, tone: 'success' as const }, { label: 'กำลังใช้งาน', value: counts.inuse, tone: 'warning' as const }, { label: 'ใกล้/เกินกำหนด', value: counts.due, tone: counts.due ? ('destructive' as const) : ('neutral' as const) }] as summary (summary.label)}
				<Card.Root>
					<Card.Header class="gap-2">
						<Card.Description>{summary.label}</Card.Description>
						<Card.Title class="text-3xl tabular-nums">{summary.value}</Card.Title>
					</Card.Header>
					<Card.Footer><StatusBadge tone={summary.tone}>{summary.label}</StatusBadge></Card.Footer>
				</Card.Root>
			{/each}
		</div>

		<Tabs.Root
			value={page.url.searchParams.get('tab') === 'history' ? 'history' : 'current'}
			onValueChange={(value) => setParams({ tab: value === 'history' ? 'history' : null })}
		>
			<Tabs.List>
				<Tabs.Trigger value="current">รายการปัจจุบัน</Tabs.Trigger>
				<Tabs.Trigger value="history">ประวัติ</Tabs.Trigger>
			</Tabs.List>

			<form
				class="mt-4 grid gap-3 md:grid-cols-[minmax(16rem,1fr)_14rem_auto]"
				onsubmit={(event) => {
					event.preventDefault();
					setParams({
						query: search.trim() || null,
						status: selectedStatus === 'all' ? null : selectedStatus
					});
				}}
			>
				<label for="borrowing-search" class="sr-only">ค้นหารายการยืม</label>
				<Input
					id="borrowing-search"
					name="query"
					bind:value={search}
					placeholder="ค้นหาพัสดุหรือโครงการ…"
					autocomplete="off"
				/>
				<Select.Root type="single" bind:value={selectedStatus}>
					<Select.Trigger aria-label="กรองสถานะ">
						{borrowingStatus.find((status) => status.value === selectedStatus)?.label ?? 'ทุกสถานะ'}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Item value="all">ทุกสถานะ</Select.Item>
							{#each borrowingStatus as status (status.value)}
								<Select.Item value={status.value}>{status.label}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
				<Button type="submit" variant="outline"><Search data-icon="inline-start" />ค้นหา</Button>
			</form>

			{#each ['current', 'history'] as tab (tab)}
				<Tabs.Content value={tab} class="mt-4">
					{@const queryText = (page.url.searchParams.get('query') ?? '').toLocaleLowerCase('th')}
					{@const statusFilter = page.url.searchParams.get('status')}
					{@const tabItems = sortCurrent(
						items
							.filter((item) =>
								tab === 'current'
									? currentStatuses.includes(item.status as (typeof currentStatuses)[number])
									: !currentStatuses.includes(item.status as (typeof currentStatuses)[number])
							)
							.filter((item) => !statusFilter || item.status === statusFilter)
							.filter(
								(item) =>
									!queryText ||
									`${item.asset.name} ${item.project.title}`
										.toLocaleLowerCase('th')
										.includes(queryText)
							)
					)}

					<div class="grid gap-3 md:hidden">
						{#each tabItems as item (item.id)}
							{@const status = borrowingStatus.find((candidate) => candidate.value === item.status)}
							<Card.Root>
								<Card.Header>
									<div class="flex items-start justify-between gap-3">
										<div class="min-w-0">
											<Card.Title class="truncate">{item.asset.name}</Card.Title><Card.Description
												class="truncate">{item.project.title}</Card.Description
											>
										</div>
										{#if status}<StatusBadge tone={status.tone}>{status.label}</StatusBadge>{/if}
									</div>
								</Card.Header>
								<Card.Content class="grid grid-cols-2 gap-3 text-sm">
									<div>
										<span class="text-muted-foreground">จำนวน</span>
										<p class="tabular-nums">{item.amount} {item.asset.unitTerm}</p>
									</div>
									<div>
										<span class="text-muted-foreground">กำหนดคืน</span>
										<p>{formatDate(item.endDate)}</p>
									</div>
									<div class="col-span-2">
										<span class="text-muted-foreground">ขั้นตอนถัดไป</span>
										<p>{nextAction(item)}</p>
									</div>
								</Card.Content>
								<Card.Footer
									><Button
										class="w-full"
										variant="outline"
										href={resolve(`/my-borrowing/${item.id}`)}
										>ดูรายละเอียด<ArrowRight data-icon="inline-end" /></Button
									></Card.Footer
								>
							</Card.Root>
						{:else}
							<Empty.Root
								><Empty.Header
									><Empty.Media variant="icon"><Clock3 /></Empty.Media><Empty.Title
										>ไม่มีรายการ</Empty.Title
									><Empty.Description
										>{tab === 'current'
											? 'เมื่อส่งคำขอยืม รายการจะปรากฏที่นี่'
											: 'ประวัติที่เสร็จสิ้นจะปรากฏที่นี่'}</Empty.Description
									></Empty.Header
								></Empty.Root
							>
						{/each}
					</div>

					<div class="hidden overflow-x-auto rounded-xl border md:block">
						<Table.Root>
							<Table.Header
								><Table.Row
									><Table.Head>สถานะ</Table.Head><Table.Head>พัสดุ/โครงการ</Table.Head><Table.Head
										class="text-right">จำนวน</Table.Head
									><Table.Head>กำหนดคืน</Table.Head><Table.Head>ขั้นตอนถัดไป</Table.Head><Table.Head
										><span class="sr-only">รายละเอียด</span></Table.Head
									></Table.Row
								></Table.Header
							>
							<Table.Body>
								{#each tabItems as item (item.id)}
									{@const status = borrowingStatus.find(
										(candidate) => candidate.value === item.status
									)}
									<Table.Row>
										<Table.Cell
											>{#if status}<StatusBadge tone={status.tone}>{status.label}</StatusBadge
												>{/if}</Table.Cell
										>
										<Table.Cell
											><strong>{item.asset.name}</strong>
											<p class="text-sm text-muted-foreground">{item.project.title}</p></Table.Cell
										>
										<Table.Cell class="text-right tabular-nums"
											>{item.amount} {item.asset.unitTerm}</Table.Cell
										>
										<Table.Cell>{formatDate(item.endDate)}</Table.Cell>
										<Table.Cell>{nextAction(item)}</Table.Cell>
										<Table.Cell
											><Button
												variant="ghost"
												size="icon"
												href={resolve(`/my-borrowing/${item.id}`)}
												aria-label={`ดูคำขอยืม ${item.asset.name}`}><ArrowRight /></Button
											></Table.Cell
										>
									</Table.Row>
								{:else}
									<Table.Row
										><Table.Cell colspan={6}
											><Empty.Root
												><Empty.Header><Empty.Title>ไม่มีรายการ</Empty.Title></Empty.Header
												></Empty.Root
											></Table.Cell
										></Table.Row
									>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				</Tabs.Content>
			{/each}
		</Tabs.Root>
	{/await}
</PageWrapper>
