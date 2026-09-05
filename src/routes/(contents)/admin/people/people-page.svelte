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
	import { Search, UserRoundCheck, UserRoundX } from '@lucide/svelte';
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

	const peopleQuery = $derived(
		listPeople({
			query: page.url.searchParams.get('query') || undefined,
			eligibility:
				(page.url.searchParams.get('eligibility') as 'eligible' | 'suspended' | null) ?? undefined,
			role: (page.url.searchParams.get('role') as 'admin' | 'staff' | 'user' | null) ?? undefined,
			departmentId: page.url.searchParams.get('departmentId') || undefined,
			projectId: page.url.searchParams.get('projectId') || undefined,
			page: Math.max(1, Number(page.url.searchParams.get('page') ?? 1)),
			pageSize: 20
		})
	);

	async function updateUrl(nextPage = 1) {
		const url = new URL(page.url);
		if (query.trim()) url.searchParams.set('query', query.trim());
		else url.searchParams.delete('query');
		for (const [key, value] of Object.entries({ eligibility, role, departmentId, projectId })) {
			if (value !== 'all') url.searchParams.set(key, value);
			else url.searchParams.delete(key);
		}
		url.searchParams.set('page', String(nextPage));
		await goto(`${resolve('/admin/people')}${url.search}`, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
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
		class="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_11rem_11rem_13rem_15rem_auto]"
		onsubmit={(event) => {
			event.preventDefault();
			updateUrl();
		}}
	>
		<label class="sr-only" for="people-search">ค้นหาบุคคล</label>
		<Input
			id="people-search"
			name="query"
			bind:value={query}
			placeholder="ชื่อ อีเมล เลขนิสิต หรือโทรศัพท์…"
			autocomplete="off"
		/>
		<Select.Root type="single" bind:value={eligibility}>
			<Select.Trigger aria-label="กรองตามสิทธิ์ยืม">
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
		<Select.Root type="single" bind:value={role}>
			<Select.Trigger aria-label="กรองตามบทบาทบัญชี">
				{role === 'admin'
					? 'แอดมิน'
					: role === 'staff'
						? 'สตาฟ'
						: role === 'user'
							? 'นิสิต'
							: 'ทุกบทบาท'}
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Item value="all">ทุกบทบาท</Select.Item>
					<Select.Item value="admin">แอดมิน</Select.Item>
					<Select.Item value="staff">สตาฟ</Select.Item>
					<Select.Item value="user">นิสิต</Select.Item>
				</Select.Group>
			</Select.Content>
		</Select.Root>
		{#await departmentsQuery}
			<Skeleton class="h-9 w-full" />
		{:then departments}
			<Select.Root type="single" bind:value={departmentId}>
				<Select.Trigger aria-label="กรองตามภาควิชา"
					>{departments.find((department) => department.id === departmentId)?.name ??
						'ทุกภาควิชา'}</Select.Trigger
				>
				<Select.Content
					><Select.Group
						><Select.Item value="all">ทุกภาควิชา</Select.Item
						>{#each departments as department (department.id)}<Select.Item value={department.id}
								>{department.name}</Select.Item
							>{/each}</Select.Group
					></Select.Content
				>
			</Select.Root>
		{/await}
		{#await projectsQuery}
			<Skeleton class="h-9 w-full" />
		{:then projects}
			<Select.Root type="single" bind:value={projectId}>
				<Select.Trigger aria-label="กรองตามโครงการ"
					>{projects.find((project) => project.id === projectId)?.title ??
						'ทุกโครงการ'}</Select.Trigger
				>
				<Select.Content
					><Select.Group
						><Select.Item value="all">ทุกโครงการ</Select.Item
						>{#each projects as project (project.id)}<Select.Item value={project.id}
								>{project.title}</Select.Item
							>{/each}</Select.Group
					></Select.Content
				>
			</Select.Root>
		{/await}
		<Button type="submit"><Search data-icon="inline-start" />ค้นหา</Button>
	</form>

	{#await peopleQuery}
		<Skeleton class="h-72 w-full" />
	{:then result}
		<div class="overflow-x-auto rounded-xl border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>บุคคล</Table.Head>
						<Table.Head>เลขนิสิต</Table.Head>
						<Table.Head>ภาควิชา</Table.Head>
						<Table.Head>บัญชี</Table.Head>
						<Table.Head>สิทธิ์ยืม</Table.Head>
						<Table.Head class="text-right">โครงการ</Table.Head>
						<Table.Head><span class="sr-only">การดำเนินการ</span></Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each result.items as person (person.id)}
						<Table.Row>
							<Table.Cell>
								<div class="flex min-w-0 flex-col">
									<strong class="truncate">{person.name || 'ไม่มีชื่อ'}</strong>
									<span class="truncate text-sm text-muted-foreground">{person.email}</span>
								</div>
							</Table.Cell>
							<Table.Cell class="font-mono tabular-nums">{person.ouid ?? '-'}</Table.Cell>
							<Table.Cell>{person.departmentName ?? '-'}</Table.Cell>
							<Table.Cell>
								<StatusBadge tone={person.linked ? 'success' : 'neutral'}>
									{person.linked
										? 'เชื่อมแล้ว'
										: person.userId
											? 'ขาดข้อมูลผู้ยืม'
											: 'ยังไม่มีบัญชี'}
								</StatusBadge>
							</Table.Cell>
							<Table.Cell>
								{#if person.borrowingEligibility}
									<StatusBadge
										tone={person.borrowingEligibility === 'eligible' ? 'success' : 'destructive'}
									>
										{person.borrowingEligibility === 'eligible' ? 'ยืมได้' : 'ระงับสิทธิ์'}
									</StatusBadge>
								{:else}-{/if}
							</Table.Cell>
							<Table.Cell class="text-right tabular-nums">{person.projectIds.length}</Table.Cell>
							<Table.Cell>
								{#if person.ouid && person.borrowingEligibility === 'eligible'}
									<AlertDialog.Root
										open={selectedOuid === person.ouid}
										onOpenChange={(open) => (selectedOuid = open ? person.ouid : null)}
									>
										<AlertDialog.Trigger>
											{#snippet child({ props })}
												<Button
													{...props}
													variant="ghost"
													size="icon"
													aria-label={`ระงับสิทธิ์ยืมของ ${person.name}`}
													onclick={() => (selectedOuid = person.ouid)}
												>
													<UserRoundX />
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
											<label for={`reason-${person.ouid}`} class="text-sm font-medium">เหตุผล</label
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
										variant="ghost"
										size="icon"
										aria-label={`คืนสิทธิ์ยืมให้ ${person.name}`}
										disabled={!!setBorrowingEligibility.pending}
										onclick={() => changeEligibility(person.ouid!, 'eligible')}
									>
										<UserRoundCheck />
									</Button>
								{/if}
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
		<div class="flex items-center justify-between gap-4">
			<p class="text-sm text-muted-foreground">
				ทั้งหมด <span class="tabular-nums">{result.total}</span> คน
			</p>
			<div class="flex items-center gap-2">
				<Button
					variant="outline"
					disabled={result.page <= 1}
					onclick={() => updateUrl(result.page - 1)}>ก่อนหน้า</Button
				>
				<span class="text-sm tabular-nums">{result.page} / {result.pageCount}</span>
				<Button
					variant="outline"
					disabled={result.page >= result.pageCount}
					onclick={() => updateUrl(result.page + 1)}>ถัดไป</Button
				>
			</div>
		</div>
	{/await}
</PageWrapper>
