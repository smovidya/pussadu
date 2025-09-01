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
	<Alert.Title>ยังไม่ได้เข้าสู่ระบบ</Alert.Title>
	<Alert.Description>
		<span>
			คุณไม่มีสิทธิ์เข้าถึงทรัพยากรนี้ โปรด<a class="link" href="/">เข้าสู่ระบบ</a>
		</span>
		<span class="font-mono text-xs">
			{error.status} -
			{error.body.message}
		</span>
	</Alert.Description>
</Alert.Root>
