<script lang="ts">
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import LogTable from '$stories/log/log-table.svelte';
	import { ScrollText } from '@lucide/svelte';
</script>

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

		<LogTable />
	</div>
</PageWrapper>
