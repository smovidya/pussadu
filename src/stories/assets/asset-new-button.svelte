<script lang="ts">
	import Button, { buttonVariants } from '$stories/shadcnui/button/button.svelte';
	import * as Sheet from '$stories/shadcnui/sheet';
	import { Plus } from '@lucide/svelte';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { arktype } from 'sveltekit-superforms/adapters';
	import { createAsset, listAssets } from '$lib/rpc/assets.remote';
	import { insertAssetSchema } from '$lib/validator/asset.validator';
	import { toast } from 'svelte-sonner';
	import AssetForm from './asset-form.svelte';

	const validators = arktype(insertAssetSchema);
	const form = superForm(
		defaults(
			{
				amount: 1,
				type: 'normal',
				status: 'available',
				owner: 'secretary',
				image_url: '/placeholder/grey.png'
			},
			validators
		),
		{
			SPA: true,
			validators,
			async onUpdate({ form }) {
				if (!form.valid) {
					console.log(form.errors);
					return;
				}
				await createAsset(form.data).updates(listAssets({}));
				toast.success('เพิ่มพัสดุใหม่เรียบร้อยแล้ว');
			}
		}
	);
</script>

<Sheet.Root>
	<Sheet.Trigger>
		{#snippet child({ props })}
			<Button {...props}>
				<Plus />
				เพิ่มพัสดุ
			</Button>
		{/snippet}
	</Sheet.Trigger>
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>เพิ่มพัสดุใหม่</Sheet.Title>
			<Sheet.Description>
				เพิ่มพัสดุโดยกรอกข้อมูลในฟอร์มนี้ พัสดุจะพร้อมให้ยืมทันทีที่บันทึก
			</Sheet.Description>
		</Sheet.Header>
		<AssetForm {form} mode="create" />
		<Sheet.Footer>
			<Button onclick={() => form.submit()} class="mr-2">บันทึก</Button>
			<Sheet.Close class={buttonVariants({ variant: 'outline' })}>ปิด</Sheet.Close>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
