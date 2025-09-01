<script lang="ts">
	// import type { AuthClient } from '$lib/auth-client';
	import { getMyBorrowerData } from '$lib/rpc/borrower.remote';
	import { getAllMyProjects } from '$lib/rpc/project.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import ProjectCard from './project-card.svelte';
	import * as Alert from '$stories/shadcnui/alert';
	import AsyncHttpBoundary from '$stories/boundary/async-http-boundary.svelte';
</script>

<PageWrapper pageTitle="เลือกโครงการ" groupTitle="ยืมพัสดุ" groupUrl="/projects">
	<section class="container mx-auto my-4">
		<h2 class="text-2xl font-bold">เลือกโครงการ</h2>
		<AsyncHttpBoundary dataLoader={getMyBorrowerData()}>
			{#snippet children(myBorrowerData)}
				{#if myBorrowerData?.current}
					{@const data = myBorrowerData.current}
					<p class="">
						ยินดีต้อนรับ <span class="font-semibold text-yellow-600">{data.name}</span>
						({data.email}) เลือกโครงการที่ต้องการยืมด้านล่าง หากไม่เจอโครงการที่ต้องการ
						ติดต่อฝ่ายพัสดุสโมสรนิสิตฯ
					</p>
				{:else}
					<Alert.Root class="border-destructive/50 text-destructive dark:border-destructive">
						<Alert.Title>ไม่พบข้อมูลผู้ยืม</Alert.Title>
						<Alert.Description>
							ไม่สามารถโหลดข้อมูลผู้ยืมได้ โปรดติดต่อฝ่ายพัสดุสโมสรนิสิตฯ
						</Alert.Description>
					</Alert.Root>
				{/if}
			{/snippet}
			{#snippet pending()}
				<Skeleton class="h-3 w-72" />
			{/snippet}
			{#snippet error()}{/snippet}
		</AsyncHttpBoundary>

		<AsyncHttpBoundary dataLoader={getAllMyProjects()}>
			{#snippet children(projects)}
				{@const inprogressProjects = projects.filter(
					(v) =>
						v.project?.status === 'inprogress' ||
						v.project?.status === 'evaluated' ||
						v.project?.status === 'notstarted'
				)}
				{@const endedProjects = projects.filter(
					(v) => v.project?.status === 'completed' || v.project?.status === 'cancelled'
				)}

				{#if inprogressProjects.length === 0}
					<Alert.Root>
						<Alert.Title>คุณยังไม่มีโครงการที่ยืมได้ในขณะนี้</Alert.Title>
						<Alert.Description>
							ยังไม่มีโครงการที่คุณสามารถยืมได้ หากไม่เจอโครงการที่ต้องการ
							โปรดติดต่อฝ่ายพัสดุสโมสรนิสิต</Alert.Description
						>
					</Alert.Root>
				{/if}
				<ul class="my-3 grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))]">
					{#each inprogressProjects ?? [] as project (project.project?.id)}
						<div class="flex flex-col flex-wrap p-1">
							<ProjectCard {project} />
						</div>
					{/each}
				</ul>

				{#if endedProjects.length > 0}
					<h2 class="mt-10 font-bold">โครงการที่สิ้นสุดแล้ว</h2>
					<ul class="my-3 grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))]">
						{#each endedProjects ?? [] as project (project.project?.id)}
							<div class="flex flex-col flex-wrap p-1">
								<ProjectCard {project} />
							</div>
						{/each}
					</ul>
				{/if}
			{/snippet}
			{#snippet pending()}
				<Skeleton class="h-3 w-72" />
				<Skeleton class="h-3 w-72" />
				<Skeleton class="h-3 w-72" />
				<Skeleton class="h-3 w-72" />
				<Skeleton class="h-3 w-72" />
			{/snippet}
		</AsyncHttpBoundary>
	</section>
</PageWrapper>
