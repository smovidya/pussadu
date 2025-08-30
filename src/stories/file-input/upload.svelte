<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { Input } from '$stories/shadcnui/input';
	import { cn } from '$stories/utils';
	import { toast } from 'svelte-sonner';

	interface Props {
		category?: string;
		isPublic?: boolean;
		description?: string;
		status?: 'idle' | 'uploading' | 'success' | 'error';
		uploadedUrl?: string | null;
	}

	let {
		category,
		isPublic,
		description,
		status = $bindable('idle'),
		uploadedUrl = $bindable(null)
	}: Props = $props();

	async function uploadFile(file: File) {
		status = 'uploading';

		if (file.size > 5 * 1024 * 1024) {
			status = 'error';
			toast.error('ไฟล์มีขนาดเกิน 5MB กรุณาเลือกไฟล์ใหม่');
			return;
		}

		try {
			const result = await authClient.uploadFile(file, {
				category,
				isPublic,
				description
			});

			if (result.error) {
				status = 'error';
				toast.error(`การอัปโหลดไฟล์ล้มเหลว: ${result.error.message}`);
			} else {
				status = 'success';
				toast.success('อัปโหลดไฟล์สำเร็จ');
				uploadedUrl = `/${result.data?.data.r2Key}`;
			}
		} catch (error) {
			status = 'error';
			toast.error(`การอัปโหลดไฟล์ล้มเหลว: ${error}`);
		} finally {
			if (status === 'uploading') {
				status = 'idle';
			}
		}
	}
</script>

<div>
	{#if uploadedUrl}
		<div class="my-2 h-40 w-full overflow-hidden rounded-md border shadow">
			<img src={uploadedUrl} alt="Uploaded file preview" class="h-full w-full object-cover" />
		</div>
	{/if}
	<Input
		type="file"
		disabled={status === 'uploading'}
		accept=".jpg,.jpeg,.png,.gif"
		oninput={async (e) => {
			e.preventDefault();
			if (!e?.target || !e.target?.files[0]) return;
			await uploadFile(e.target.files[0]);
		}}
	/>
	<div
		class={cn('text-sm', {
			'opacity-50': status === 'uploading',
			'font-bold': status === 'success',
			'text-red-500': status === 'error'
		})}
	>
		{#if status === 'uploading'}
			<p>กำลังอัปโหลดไฟล์...</p>
		{:else if status === 'success'}
			<p>อัปโหลดไฟล์สำเร็จ!</p>
		{:else if status === 'error'}
			<p>การอัปโหลดไฟล์ล้มเหลว</p>
		{/if}
	</div>
</div>
