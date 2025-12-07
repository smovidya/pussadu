<script lang="ts">
	import * as Alert from '$stories/shadcnui/alert';
	import { TriangleAlert } from '@lucide/svelte';
	import type { HttpError } from '@sveltejs/kit';

	interface Props {
		error?: HttpError;
		class?: string;
	}

	let { error, class: className }: Props = $props();
</script>

<Alert.Root variant="destructive" class={className}>
	<TriangleAlert />
	<Alert.Title>ยังไม่ได้เข้าสู่ระบบ</Alert.Title>
	<Alert.Description>
		<span>
			คุณไม่มีสิทธิ์เข้าถึงทรัพยากรนี้ โปรด<a class="link" href="/">เข้าสู่ระบบ</a>
		</span>
		{#if error}
			<span class="font-mono text-xs">
				{error.status} -
				{error.body.message}
			</span>
		{/if}
	</Alert.Description>
</Alert.Root>
