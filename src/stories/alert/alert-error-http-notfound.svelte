<script lang="ts">
	import * as Alert from '$stories/shadcnui/alert';
	import { TriangleAlert } from '@lucide/svelte';
	import type { HttpError } from '@sveltejs/kit';

	interface Props {
		error: HttpError;
	}

	let { error }: Props = $props();
</script>

<Alert.Root variant="destructive">
	<TriangleAlert />
	<Alert.Title>ไม่พบรายการนี้</Alert.Title>
	<Alert.Description>
		<span> ไม่พบทรัพยากรที่ค้นหา โปรดตรวจสอบรายละเอียดอีกครั้ง </span>
		<span class="font-mono text-xs">
			{error.status} -
			{error.body.message}
		</span>
	</Alert.Description>
</Alert.Root>
