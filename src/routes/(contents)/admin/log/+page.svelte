<script lang="ts">
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import LogTable from '$stories/log/log-table.svelte';
	import PageHeader from '$stories/page-header/page-header.svelte';
</script>

<PageWrapper pageTitle="ประวัติการดำเนินการ" groupTitle="แอดมิน" groupUrl="/admin/approval">
	<div class="flex flex-col gap-6">
		<PageHeader
			title="ประวัติการดำเนินการ"
			description="ประวัติการกระทำทั้งหมดของผู้ดูแลระบบและสตาฟในระบบ ใช้ตรวจสอบย้อนหลังได้"
		/>
		<LogTable />
	</div>
</PageWrapper>
