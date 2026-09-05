<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { listPeople, setBorrowingEligibility } from '$lib/rpc/person.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import PageHeader from '$stories/page-header/page-header.svelte';
	import { Input } from '$stories/shadcnui/input';
	import { Button } from '$stories/shadcnui/button';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import * as Select from '$stories/shadcnui/select';
	import * as Table from '$stories/shadcnui/table';
	import * as Empty from '$stories/shadcnui/empty';
	import * as AlertDialog from '$stories/shadcnui/alert-dialog';
	import StatusBadge from '$stories/status-badge/status-badge.svelte';
	import PersonEditSheet from './person-edit-sheet.svelte';
	import { Search, UserRoundCheck, UserRoundX, X } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { listDepartment } from '$lib/rpc/department.remote';
	import { getAllProjects } from '$lib/rpc/project.remote';

	let query = $state(page.url.searchParams.get('query') ?? '');
	let eligibility = $state(page.url.searchParams.get('eligibility') ?? 'all');
	let role = $state(page.url.searchParams.get('role') ?? 'all');
	let departmentId = $state(page.url.searchParams.get('departmentId') ?? 'all');
	let projectId = $state(page.url.searchParams.get('projectId') ?? 'all');
	let suspensionReason = $state('');
	let selectedOuid = $state<string | null>(null);
	const departmentsQuery = listDepartment();
	const projectsQuery = getAllProjects();

	function getPeopleFilters(): {
		query?: string;
		departmentId?: string;
		eligibility?: 'eligible' | 'suspended';
		projectId?: string;
		role?: 'admin' | 'staff' | 'user';
		page: number;
		pageSize: number;
	} {
		const params = page.url.searchParams;
		const searchQuery = params.get('query')?.trim();
		const eligibilityFilter = params.get('eligibility');
		const roleFilter = params.get('role');
		const selectedDepartmentId = params.get('departmentId');
		const selectedProjectId = params.get('projectId');
		const requestedPage = Number(params.get('page') ?? 1);

		return {
			...(searchQuery ? { query: searchQuery } : {}),
			...(eligibilityFilter === 'eligible' || eligibilityFilter === 'suspended'
				? { eligibility: eligibilityFilter }
				: {}),
			...(roleFilter === 'admin' || roleFilter === 'staff' || roleFilter === 'user'
				? { role: roleFilter }
				: {}),
			...(selectedDepartmentId ? { departmentId: selectedDepartmentId } : {}),
			...(selectedProjectId ? { projectId: selectedProjectId } : {}),
			page: Number.isInteger(requestedPage) && requestedPage >= 1 ? requestedPage : 1,
			pageSize: 20
		};
	}

	const peopleQuery = $derived(listPeople(getPeopleFilters()));
	const activeFilterCount = $derived(
		['query', 'eligibility', 'role', 'departmentId', 'projectId'].filter((key) =>
			page.url.searchParams.has(key)
		).length
	);

	$effect(() => {
		const params = page.url.searchParams;
		query = params.get('query') ?? '';
		eligibility = params.get('eligibility') ?? 'all';
		role = params.get('role') ?? 'all';
		departmentId = params.get('departmentId') ?? 'all';
		projectId = params.get('projectId') ?? 'all';
	});

	async function updateUrl(nextPage = 1) {
		const url = new URL(page.url);
		if (query.trim()) url.searchParams.set('query', query.trim());
		else url.searchParams.delete('query');
		for (const [key, value] of Object.entries({ eligibility, role, departmentId, projectId })) {
			if (value !== 'all') url.searchParams.set(key, value);
			else url.searchParams.delete(key);
		}
		url.searchParams.set('page', String(nextPage));
		// `resolve` handles the typed route; its query string must be appended afterwards.
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto(resolve('/admin/people') + url.search, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	async function resetFilters() {
		query = '';
		eligibility = 'all';
		role = 'all';
		departmentId = 'all';
		projectId = 'all';
		await updateUrl();
	}

	async function changeEligibility(ouid: string, next: 'eligible' | 'suspended') {
		await setBorrowingEligibility({
			ouid,
			eligibility: next,
			reason: next === 'suspended' ? suspensionReason : undefined
		});
		await peopleQuery.refresh();
		toast.success(next === 'eligible' ? 'คืนสิทธิ์ยืมแล้ว' : 'ระงับสิทธิ์ยืมแล้ว');
		suspensionReason = '';
		selectedOuid = null;
	}
</script>

<PageWrapper groupTitle="แอดมิน" pageTitle="บุคคล" groupUrl="/admin/people">
	<PageHeader
		title="บุคคล"
		description="ค้นหาบัญชี ผู้มีสิทธิ์ยืม และสมาชิกโครงการจากพื้นที่เดียว"
	/>

	<form
		class="flex flex-col gap-4 rounded-xl border bg-card p-4"
		onsubmit={(event) => {
			event.preventDefault();
			updateUrl();
		}}
	>
		<div class="flex flex-col gap-2 sm:flex-row">
			<div class="relative min-w-0 flex-1">
				<label class="sr-only" for="people-search">ค้นหาบุคคล</label>
				<Search
					aria-hidden="true"
					class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
				/>
				<Input
					id="people-search"
					name="query"
					type="search"
					inputmode="search"
					bind:value={query}
					class="pl-9"
					placeholder="ค้นหาชื่อ อีเมล เลขนิสิต หรือโทรศัพท์…"
					autocomplete="off"
					spellcheck="false"
				/>
			</div>
			<Button type="submit" class="sm:shrink-0">
				<Search data-icon="inline-start" aria-hidden="true" />ค้นหา
			</Button>
		</div>

		<div class="flex items-center justify-between gap-3">
			<p class="text-sm font-medium">ตัวกรอง</p>
			{#if activeFilterCount > 0}
				<Button type="button" variant="ghost" size="sm" onclick={resetFilters}>
					<X data-icon="inline-start" aria-hidden="true" />ล้างทั้งหมด ({activeFilterCount})
				</Button>
			{/if}
		</div>
		<div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
			<Select.Root
				type="single"
				value={eligibility}
				onValueChange={(value) => {
					eligibility = value;
					updateUrl();
				}}
			>
				<Select.Trigger class="w-full" aria-label="กรองตามสิทธิ์ยืม">
					{eligibility === 'eligible'
						? 'ยืมได้'
						: eligibility === 'suspended'
							? 'ระงับสิทธิ์'
							: 'ทุกสิทธิ์ยืม'}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Item value="all">ทุกสิทธิ์ยืม</Select.Item>
						<Select.Item value="eligible">ยืมได้</Select.Item>
						<Select.Item value="suspended">ระงับสิทธิ์</Select.Item>
					</Select.Group>
				</Select.Content>
			</Select.Root>
			<Select.Root
				type="single"
				value={role}
				onValueChange={(value) => {
					role = value;
					updateUrl();
				}}
			>
				<Select.Trigger class="w-full" aria-label="กรองตามบทบาทบัญชี">
					{role === 'admin'
						? 'แอดมิน'
						: role === 'staff'
							? 'ฝ่ายพัสดุ'
							: role === 'user'
								? 'นิสิต'
								: 'ทุกบทบาท'}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Item value="all">ทุกบทบาท</Select.Item>
						<Select.Item value="admin">แอดมิน</Select.Item>
						<Select.Item value="staff">ฝ่ายพัสดุ</Select.Item>
						<Select.Item value="user">นิสิต</Select.Item>
					</Select.Group>
				</Select.Content>
			</Select.Root>
			{#await departmentsQuery}
				<Skeleton class="h-10 w-full" />
			{:then departments}
				<Select.Root
					type="single"
					value={departmentId}
					onValueChange={(value) => {
						departmentId = value;
						updateUrl();
					}}
				>
					<Select.Trigger class="w-full" aria-label="กรองตามภาควิชา">
						{departments.find((department) => department.id === departmentId)?.name ?? 'ทุกภาควิชา'}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Item value="all">ทุกภาควิชา</Select.Item>
							{#each departments as department (department.id)}
								<Select.Item value={department.id}>{department.name}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			{/await}
			{#await projectsQuery}
				<Skeleton class="h-10 w-full" />
			{:then projects}
				<Select.Root
					type="single"
					value={projectId}
					onValueChange={(value) => {
						projectId = value;
						updateUrl();
					}}
				>
					<Select.Trigger class="w-full" aria-label="กรองตามโครงการ">
						{projects.find((project) => project.id === projectId)?.title ?? 'ทุกโครงการ'}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Item value="all">ทุกโครงการ</Select.Item>
							{#each projects as project (project.id)}
								<Select.Item value={project.id}>{project.title}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			{/await}
		</div>
	</form>

	{#await peopleQuery}
		<Skeleton class="h-72 w-full" />
	{:then result}
		<div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h2 class="font-semibold">รายชื่อบุคคล</h2>
				<p class="text-sm text-muted-foreground" aria-live="polite">
					{#if result.total > 0}
						แสดง <span class="tabular-nums"
							>{(result.page - 1) * result.pageSize + 1}–{Math.min(
								result.page * result.pageSize,
								result.total
							)}</span
						>
						จาก <span class="tabular-nums">{result.total}</span> คน
					{:else}
						ไม่พบรายชื่อที่ตรงกับตัวกรอง
					{/if}
				</p>
			</div>
		</div>
		<div class="overflow-x-auto rounded-xl border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>บุคคล</Table.Head>
						<Table.Head class="hidden md:table-cell">เลขนิสิต</Table.Head>
						<Table.Head class="hidden xl:table-cell">ภาควิชา</Table.Head>
						<Table.Head class="hidden lg:table-cell">บทบาท</Table.Head>
						<Table.Head>สิทธิ์ยืม</Table.Head>
						<Table.Head class="hidden text-right xl:table-cell">โครงการ</Table.Head>
						<Table.Head class="text-right">จัดการ</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each result.items as person (person.id)}
						<Table.Row>
							<Table.Cell>
								<div class="flex min-w-0 flex-col">
									<strong class="truncate">{person.name || 'ไม่มีชื่อ'}</strong>
									<span class="truncate text-sm text-muted-foreground">{person.email}</span>
									<span class="font-mono text-xs text-muted-foreground tabular-nums md:hidden">
										{person.ouid ?? 'ไม่มีเลขนิสิต'}
									</span>
									{#if !person.linked}
										<span class="text-xs text-muted-foreground">
											{person.userId ? 'ยังไม่มีข้อมูลผู้ยืม' : 'ยังไม่เชื่อมบัญชีผู้ใช้'}
										</span>
									{/if}
								</div>
							</Table.Cell>
							<Table.Cell class="hidden font-mono tabular-nums md:table-cell"
								>{person.ouid ?? '-'}</Table.Cell
							>
							<Table.Cell class="hidden xl:table-cell">{person.departmentName ?? '-'}</Table.Cell>
							<Table.Cell class="hidden lg:table-cell">
								{#if person.userId}
									<StatusBadge tone="neutral">
										{person.globalRoles.includes('admin')
											? 'ผู้ดูแลระบบ'
											: person.globalRoles.includes('staff')
												? 'ฝ่ายพัสดุ'
												: 'นิสิต'}
									</StatusBadge>
								{:else}
									<span class="text-sm text-muted-foreground">ไม่มีบัญชี</span>
								{/if}
							</Table.Cell>
							<Table.Cell>
								{#if person.borrowingEligibility}
									<div class="flex flex-col items-start gap-1">
										<StatusBadge
											tone={person.borrowingEligibility === 'eligible' ? 'success' : 'destructive'}
										>
											{person.borrowingEligibility === 'eligible' ? 'ยืมได้' : 'ระงับสิทธิ์'}
										</StatusBadge>
										{#if person.borrowingEligibility === 'suspended' && person.eligibilityReason}
											<span
												class="max-w-40 truncate text-xs text-muted-foreground"
												title={person.eligibilityReason}>{person.eligibilityReason}</span
											>
										{/if}
									</div>
								{:else}-{/if}
							</Table.Cell>
							<Table.Cell class="hidden text-right tabular-nums xl:table-cell">
								{person.projectIds.length} โครงการ
							</Table.Cell>
							<Table.Cell>
								<div class="flex flex-wrap justify-end gap-2">
									<PersonEditSheet
										{person}
										departments={departmentsQuery.current ?? []}
										onSaved={() => peopleQuery.refresh()}
									/>
									{#if person.ouid && person.borrowingEligibility === 'eligible'}
										<AlertDialog.Root
											open={selectedOuid === person.ouid}
											onOpenChange={(open) => (selectedOuid = open ? person.ouid : null)}
										>
											<AlertDialog.Trigger>
												{#snippet child({ props })}
													<Button
														{...props}
														variant="outline"
														size="sm"
														aria-label={`ระงับสิทธิ์ยืมของ ${person.name}`}
														onclick={() => (selectedOuid = person.ouid)}
													>
														<UserRoundX data-icon="inline-start" aria-hidden="true" />ระงับสิทธิ์
													</Button>
												{/snippet}
											</AlertDialog.Trigger>
											<AlertDialog.Content>
												<AlertDialog.Header>
													<AlertDialog.Title>ระงับสิทธิ์ยืมของ {person.name}?</AlertDialog.Title>
													<AlertDialog.Description
														>คำขอเดิมยังอยู่ แต่จะสร้างคำขอใหม่ไม่ได้</AlertDialog.Description
													>
												</AlertDialog.Header>
												<label for={`reason-${person.ouid}`} class="text-sm font-medium"
													>เหตุผล</label
												>
												<Input
													id={`reason-${person.ouid}`}
													bind:value={suspensionReason}
													placeholder="ระบุเหตุผล…"
												/>
												<AlertDialog.Footer>
													<AlertDialog.Cancel onclick={() => (selectedOuid = null)}
														>ยกเลิก</AlertDialog.Cancel
													>
													<Button
														variant="destructive"
														disabled={!suspensionReason.trim() || !!setBorrowingEligibility.pending}
														onclick={() => changeEligibility(person.ouid!, 'suspended')}
														>ยืนยันระงับสิทธิ์</Button
													>
												</AlertDialog.Footer>
											</AlertDialog.Content>
										</AlertDialog.Root>
									{:else if person.ouid && person.borrowingEligibility === 'suspended'}
										<Button
											variant="outline"
											size="sm"
											aria-label={`คืนสิทธิ์ยืมให้ ${person.name}`}
											disabled={!!setBorrowingEligibility.pending}
											onclick={() => changeEligibility(person.ouid!, 'eligible')}
										>
											<UserRoundCheck data-icon="inline-start" aria-hidden="true" />คืนสิทธิ์
										</Button>
									{/if}
								</div>
							</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={7}>
								<Empty.Root>
									<Empty.Header
										><Empty.Title>ไม่พบบุคคล</Empty.Title><Empty.Description
											>ลองเปลี่ยนคำค้นหาหรือตัวกรอง</Empty.Description
										></Empty.Header
									>
								</Empty.Root>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
		<div class="flex items-center justify-end gap-4">
			<div class="flex items-center gap-2">
				<Button
					variant="outline"
					disabled={result.page <= 1}
					onclick={() => updateUrl(result.page - 1)}>ก่อนหน้า</Button
				>
				<span class="text-sm tabular-nums">หน้า {result.page} จาก {result.pageCount}</span>
				<Button
					variant="outline"
					disabled={result.page >= result.pageCount}
					onclick={() => updateUrl(result.page + 1)}>ถัดไป</Button
				>
			</div>
		</div>
	{/await}
</PageWrapper>
