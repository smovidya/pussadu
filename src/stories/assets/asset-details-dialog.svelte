<script lang="ts">
	import * as Sheet from '$stories/shadcnui/sheet';
	import { buttonVariants } from '$stories/shadcnui/button';
	import type { Snippet } from 'svelte';
	import AssetForm from './asset-form.svelte';
	import { updateAssetSchema } from '$lib/validator/asset.validator';
	import { arktype } from 'sveltekit-superforms/adapters';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { listAssets, updateAsset } from '$lib/rpc/assets.remote';
	import { toast } from 'svelte-sonner';
	import Button from '$stories/shadcnui/button/button.svelte';

	interface Props {
		asset: {
			createdAt: Date | null;
			updatedAt: Date | null;
			deletedAt: Date | null;
			name: string;
			description: string | null;
			type: 'normal' | 'durable' | 'key';
			status: 'available' | 'borrowed' | 'reserved' | 'maintenance' | 'lost' | 'damaged';
			amount: number;
			unitTerm: string;
			image_url: string | null;
			category: string;
			owner:
				| 'president'
				| 'vice1'
				| 'vice2'
				| 'secretary'
				| 'treasurer'
				| 'student_relation'
				| 'arts'
				| 'academic'
				| 'sport'
				| 'social_development'
				| 'korkor_club'
				| 'sciren_club'
				| 'vata_club'
				| 'education_club'
				| 'anurak_club'
				| 'asa_club'
				| 'etc';
			categoryId: string | null;
			id: string;
		};
		trigger: Snippet<
			[
				{
					props: Record<string, unknown>;
				}
			]
		>;
		mode: 'edit' | 'view';
		listAssetsQuery?: ReturnType<typeof listAssets>;
	}

	let { asset = $bindable(), trigger, mode, listAssetsQuery }: Props = $props();
	let isOpen = $state(false);

	const validators = arktype(updateAssetSchema);
	const form = superForm(defaults(asset, validators), {
		id: `asset-details-${asset.id}`,
		SPA: true,
		validators,
		async onUpdate({ form }) {
			if (!form.valid) {
				console.log(form.errors);
				return;
			}
			await updateAsset(form.data);
			await listAssetsQuery?.refresh();
			toast.success('อัปเดตข้อมูลพัสดุแล้ว');
			isOpen = false;
		}
	});

	const { form: formData } = form;
</script>

<Sheet.Root bind:open={isOpen}>
	<Sheet.Trigger class={buttonVariants({ variant: 'outline' })}>
		{#snippet child(args)}
			{#if trigger}
				{@render trigger(args)}
			{:else}
				????
			{/if}
		{/snippet}
	</Sheet.Trigger>
	<Sheet.Content side="right">
		<Sheet.Header>
			<Sheet.Title>
				{#if mode === 'edit'}
					แก้ไข {$formData.name}
				{:else if mode === 'view'}
					ดูรายละเอียด {$formData.name}
				{/if}
			</Sheet.Title>
		</Sheet.Header>
		<AssetForm {form} {mode} />
		<Sheet.Footer>
			{#if mode !== 'view'}
				<Button onclick={() => form.submit()}>บันทึก</Button>
			{/if}
			<Sheet.Close class={buttonVariants({ variant: 'ghost' })}>ปิด</Sheet.Close>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
