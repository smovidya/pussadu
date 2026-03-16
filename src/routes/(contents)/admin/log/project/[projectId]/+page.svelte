<script lang="ts">
	import { page } from '$app/state';
	import { getLogsByTarget } from '$lib/rpc/log.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';
	import * as Table from '$stories/shadcnui/table';

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

	let projectId = $derived(page.params.projectId);
</script>

<PageWrapper pageTitle="ประวัติโครงการ" groupTitle="ประวัติการดำเนินการ" groupUrl="/admin/log">
	<div class="container mx-auto py-10">
		<h2 class="mb-4 text-xl font-bold">Log สำหรับโครงการ ID: {projectId}</h2>
		<AsyncHttpBoundary dataLoader={getLogsByTarget({ targetId: projectId || '' })}>
			{#snippet children(logs)}
				<div class="rounded-md border">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>วันที่</Table.Head>
								<Table.Head>ผู้กระทำ</Table.Head>
								<Table.Head>การกระทำ</Table.Head>
								<Table.Head>รายละเอียด</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each logs as log (log.id)}
								<Table.Row>
									<Table.Cell>{formatDateWithTime(log.createdAt)}</Table.Cell>
									<Table.Cell>{log.actor}</Table.Cell>
									<Table.Cell>{log.action}</Table.Cell>
									<Table.Cell>
										{#if log.detail}
											<details>
												<summary class="cursor-pointer text-sm text-muted-foreground"
													>JSON Details</summary
												>
												<pre
													class="max-w-100 overflow-auto rounded bg-muted p-2 text-xs">{JSON.stringify(
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
