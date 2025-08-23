<script lang="ts">
	// import type { AuthClient } from '$lib/auth-client';
	import { getMyBorrowerData } from '$lib/rpc/borrower.remote';
	import { getAllMyProjects } from '$lib/rpc/project.remote';
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import { Skeleton } from '$stories/shadcnui/skeleton';

	const myBorrowerData = getMyBorrowerData();

	// interface Props {
	// 	authClient: AuthClient;
	// }
	// let { authClient }: Props = $props();
</script>

<PageWrapper pageTitle="เลือกโครงการ" groupTitle="ยืมพัสดุ" groupUrl="/projects">
	<section class="container mx-auto my-4">
		<h2 class="text-2xl font-bold">เลือกโครงการ</h2>
		{#await myBorrowerData}
			<Skeleton class="h-3 w-72" />
		{:then data}
			<p class="">
				ยินดีต้อนรับ <span class="font-semibold text-yellow-600">{data.name}</span> ({data.email})
				เลือกโครงการที่ต้องการยืมด้านล่าง หากไม่เจอโครงการที่ต้องการ ติดต่อฝ่ายพัสดุสโมสรนิสิตฯ
			</p>
		{:catch error}
			<p>ไม่สามารถโหลดข้อมูลโครงการได้: {error.message}</p>
		{/await}

		{#await getAllMyProjects()}
			<Skeleton class="h-3 w-72" />
			<Skeleton class="h-3 w-72" />
			<Skeleton class="h-3 w-72" />
			<Skeleton class="h-3 w-72" />
			<Skeleton class="h-3 w-72" />
		{:then projects}
			<ul>
				{#each projects as project (project.projectId)}
					<li>{project.project.title}</li>
				{/each}
			</ul>
		{:catch error}
			<p>ไม่สามารถโหลดข้อมูลโครงการได้: {error.message}</p>
		{/await}
	</section>
</PageWrapper>
