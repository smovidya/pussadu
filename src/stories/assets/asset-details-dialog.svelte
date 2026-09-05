<script lang="ts">
	import * as Sheet from '$stories/shadcnui/sheet';
	import { buttonVariants } from '$stories/shadcnui/button';
	import type { Snippet } from 'svelte';
	import AssetForm from './asset-form.svelte';
	import { updateAssetSchema } from '$lib/validator/asset.validator';
	import { arktype } from 'sveltekit-superforms/adapters';
	import { defaults, superForm } from 'sveltekit-superforms';
	import {
		adjustInventory,
		confirmInventory,
		listAssets,
		setAssetCatalogState,
		updateAsset
	} from '$lib/rpc/assets.remote';
	import { toast } from 'svelte-sonner';
	import Button from '$stories/shadcnui/button/button.svelte';
	import { Spinner } from '$stories/shadcnui/spinner';
	import { Input } from '$stories/shadcnui/input';
	import * as Field from '$stories/shadcnui/field';
	import * as Select from '$stories/shadcnui/select';
	import type { AssetView } from './types';

	interface Props {
		asset: AssetView;
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
	type InventoryOperation =
		| 'add-stock'
		| 'remove-stock'
		| 'start-maintenance'
		| 'complete-maintenance'
		| 'record-damage'
		| 'recover-damage'
		| 'record-lost'
		| 'recover-lost';
	let operation = $state<InventoryOperation>('add-stock');
	let inventoryAmount = $state(1);
	let inventoryReason = $state('');
	let inventoryPending = $state(false);
	const inventoryOperations: Array<{ value: InventoryOperation; label: string }> = [
		{ value: 'add-stock', label: 'เพิ่มจำนวนเข้าคลัง' },
		{ value: 'remove-stock', label: 'ลดจำนวนออกจากคลัง' },
		{ value: 'start-maintenance', label: 'ส่งซ่อม/บำรุงรักษา' },
		{ value: 'complete-maintenance', label: 'กลับจากซ่อม' },
		{ value: 'record-damage', label: 'บันทึกชำรุด' },
		{ value: 'recover-damage', label: 'กู้คืนจากชำรุด' },
		{ value: 'record-lost', label: 'บันทึกสูญหาย' },
		{ value: 'recover-lost', label: 'พบของที่สูญหาย' }
	];

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

	const { form: formData, submitting } = form;

	async function saveInventoryAdjustment() {
		if (!inventoryReason.trim()) {
			toast.error('โปรดระบุเหตุผลการปรับคลัง');
			return;
		}
		inventoryPending = true;
		try {
			const updated = await adjustInventory({
				assetId: asset.id,
				operation,
				amount: inventoryAmount,
				reason: inventoryReason.trim()
			});
			asset = { ...asset, ...updated };
			await listAssetsQuery?.refresh();
			inventoryReason = '';
			toast.success('ปรับยอดคลังแล้ว');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'ปรับยอดคลังไม่สำเร็จ');
		} finally {
			inventoryPending = false;
		}
	}

	async function changeCatalogState(state: AssetView['catalogState']) {
		if (!inventoryReason.trim()) {
			toast.error('โปรดระบุเหตุผลก่อนเปลี่ยนสถานะรายการ');
			return;
		}
		inventoryPending = true;
		try {
			await setAssetCatalogState({ assetId: asset.id, state, reason: inventoryReason.trim() });
			asset.catalogState = state;
			await listAssetsQuery?.refresh();
			toast.success('เปลี่ยนสถานะรายการแล้ว');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'เปลี่ยนสถานะไม่สำเร็จ');
		} finally {
			inventoryPending = false;
		}
	}

	async function confirmCurrentInventory() {
		if (!inventoryReason.trim()) {
			toast.error('โปรดระบุหลักฐานหรือเหตุผลการตรวจนับ');
			return;
		}
		inventoryPending = true;
		try {
			await confirmInventory({
				assetId: asset.id,
				totalAmount: asset.totalAmount,
				maintenanceAmount: asset.maintenanceAmount,
				damagedAmount: asset.damagedAmount,
				lostAmount: asset.lostAmount,
				reason: inventoryReason.trim()
			});
			asset.needsInventoryReview = false;
			await listAssetsQuery?.refresh();
			toast.success('ยืนยันยอดตรวจนับแล้ว');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'ยืนยันยอดไม่สำเร็จ');
		} finally {
			inventoryPending = false;
		}
	}
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
		{#if mode === 'edit'}
			<section class="mx-4 flex flex-col gap-4 rounded-lg border p-4">
				<div>
					<h3 class="font-semibold">คลังและสภาพพัสดุ</h3>
					<p class="text-sm text-muted-foreground tabular-nums">
						ทั้งหมด {asset.totalAmount} · พร้อมใช้ {asset.usableAmount} · ซ่อม {asset.maintenanceAmount}
						· ชำรุด {asset.damagedAmount} · สูญหาย {asset.lostAmount}
					</p>
				</div>
				{#if asset.needsInventoryReview}
					<div
						class="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning-foreground"
					>
						<p class="font-semibold">ต้องตรวจนับก่อนเปิดให้ยืม</p>
						<p>ปรับยอดด้านล่างให้ถูกต้อง ระบุเหตุผล แล้วกดยืนยันยอด</p>
					</div>
				{/if}
				<Field.Field>
					<Field.Label for={`inventory-reason-${asset.id}`}>เหตุผลการเปลี่ยนแปลง</Field.Label>
					<Input
						id={`inventory-reason-${asset.id}`}
						bind:value={inventoryReason}
						placeholder="เช่น ตรวจนับประจำเดือน / ส่งซ่อม"
					/>
				</Field.Field>
				<div class="grid gap-3 sm:grid-cols-[1fr_7rem_auto] sm:items-end">
					<Field.Field
						><Field.Label>รายการปรับคลัง</Field.Label><Select.Root
							type="single"
							bind:value={operation}
							><Select.Trigger
								>{inventoryOperations.find((item) => item.value === operation)
									?.label}</Select.Trigger
							><Select.Content
								><Select.Group
									>{#each inventoryOperations as item (item.value)}<Select.Item value={item.value}
											>{item.label}</Select.Item
										>{/each}</Select.Group
								></Select.Content
							></Select.Root
						></Field.Field
					>
					<Field.Field
						><Field.Label for={`inventory-amount-${asset.id}`}>จำนวน</Field.Label><Input
							id={`inventory-amount-${asset.id}`}
							type="number"
							min={1}
							bind:value={inventoryAmount}
						/></Field.Field
					>
					<Button
						type="button"
						variant="outline"
						disabled={inventoryPending}
						onclick={saveInventoryAdjustment}
						>{#if inventoryPending}<Spinner />{/if}บันทึกยอด</Button
					>
				</div>
				<div class="flex flex-wrap gap-2">
					{#if asset.needsInventoryReview}<Button
							type="button"
							size="sm"
							disabled={inventoryPending}
							onclick={confirmCurrentInventory}>ยืนยันยอดตรวจนับ</Button
						>{/if}
					<Button
						type="button"
						size="sm"
						variant={asset.catalogState === 'active' ? 'secondary' : 'outline'}
						disabled={inventoryPending || asset.catalogState === 'active'}
						onclick={() => changeCatalogState('active')}>เปิดให้ยืม</Button
					><Button
						type="button"
						size="sm"
						variant={asset.catalogState === 'paused' ? 'secondary' : 'outline'}
						disabled={inventoryPending || asset.catalogState === 'paused'}
						onclick={() => changeCatalogState('paused')}>พักรายการ</Button
					><Button
						type="button"
						size="sm"
						variant="destructive"
						disabled={inventoryPending || asset.catalogState === 'retired'}
						onclick={() => changeCatalogState('retired')}>เลิกใช้งาน</Button
					>
				</div>
			</section>
		{/if}
		<Sheet.Footer>
			{#if mode !== 'view'}
				<Button onclick={() => form.submit()} disabled={$submitting}>
					{#if $submitting}
						<Spinner />
						<span>กำลังบันทึก...</span>
					{:else}
						บันทึก
					{/if}
				</Button>
			{/if}
			<Sheet.Close class={buttonVariants({ variant: 'ghost' })}>ปิด</Sheet.Close>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
