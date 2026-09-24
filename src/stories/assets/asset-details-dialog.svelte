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
	let inventoryOpen = $state(false);
	let catalogReason = $state('');
	$effect(() => {
		if (!isOpen) inventoryOpen = false;
	});
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
		if (!Number.isInteger(inventoryAmount) || inventoryAmount < 1) {
			toast.error('โปรดระบุจำนวนเต็มตั้งแต่ 1 ขึ้นไป');
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
		if (!catalogReason.trim()) {
			toast.error('โปรดระบุเหตุผลก่อนเปลี่ยนสถานะรายการ');
			return;
		}
		inventoryPending = true;
		try {
			await setAssetCatalogState({ assetId: asset.id, state, reason: catalogReason.trim() });
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
	<Sheet.Content side="right" class="h-dvh w-full gap-0 sm:max-w-xl">
		<Sheet.Header class="shrink-0 border-b pr-14">
			<Sheet.Title class="break-words">
				{inventoryOpen ? 'ปรับจำนวนพัสดุ' : mode === 'edit' ? 'แก้ไขพัสดุ' : 'รายละเอียดพัสดุ'}
			</Sheet.Title>
			<Sheet.Description class="break-words">{asset.name}</Sheet.Description>
		</Sheet.Header>
		<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
			<div class={inventoryOpen ? 'hidden' : 'space-y-8 p-4 sm:p-6'}>
				<AssetForm {form} {mode} embedded />
				{#if mode === 'view'}
					<section class="space-y-4 border-t pt-6" aria-label="คลังและสภาพพัสดุ">
						<h3 class="font-semibold">คลังและสภาพพัสดุ</h3>
						{@render inventorySummary()}
					</section>
				{/if}
				{#if mode === 'edit'}
					<section class="space-y-4 border-t pt-6" aria-label="คลังและสภาพพัสดุ">
						<h3 class="font-semibold">คลังและสภาพพัสดุ</h3>
						{@render inventorySummary()}
						{#if asset.needsInventoryReview}
							<p class="rounded-lg bg-warning/10 p-3 text-sm text-warning">
								ต้องตรวจนับก่อนเปิดให้ยืม
							</p>
						{/if}
						<Button
							type="button"
							variant="outline"
							class="min-h-11 w-full"
							onclick={() => (inventoryOpen = true)}>ปรับจำนวนพัสดุ</Button
						>
					</section>
					<section class="space-y-4 border-t pt-6" aria-label="สถานะการให้ยืม">
						<div>
							<h3 class="font-semibold">สถานะการให้ยืม</h3>
							<p class="mt-1 text-sm text-muted-foreground">
								ปัจจุบัน: {asset.catalogState === 'active'
									? 'เปิดให้ยืม'
									: asset.catalogState === 'paused'
										? 'พักรายการ'
										: 'เลิกใช้งาน'}
							</p>
						</div>
						<Field.Field>
							<Field.Label for={`catalog-reason-${asset.id}`}>เหตุผลการเปลี่ยนสถานะ</Field.Label>
							<Input
								id={`catalog-reason-${asset.id}`}
								bind:value={catalogReason}
								placeholder="ระบุเหตุผลก่อนเปลี่ยนสถานะ"
							/>
						</Field.Field>
						<p class="text-sm text-muted-foreground">
							การเปลี่ยนสถานะมีผลทันที แยกจากการบันทึกข้อมูลพัสดุ
						</p>
						<div class="grid grid-cols-2 gap-3">
							<Button
								type="button"
								class="min-h-11"
								variant="outline"
								disabled={inventoryPending || asset.catalogState === 'active'}
								onclick={() => changeCatalogState('active')}>เปิดให้ยืม</Button
							>
							<Button
								type="button"
								class="min-h-11"
								variant="outline"
								disabled={inventoryPending || asset.catalogState === 'paused'}
								onclick={() => changeCatalogState('paused')}>พักรายการ</Button
							>
						</div>
						<div class="space-y-3 border-t pt-4">
							<p class="text-sm text-muted-foreground">
								เลิกใช้งานเมื่อไม่ต้องการนำพัสดุนี้มาให้ยืมอีก
							</p>
							<Button
								type="button"
								class="min-h-11 w-full"
								variant="destructive"
								disabled={inventoryPending || asset.catalogState === 'retired'}
								onclick={() => changeCatalogState('retired')}>เลิกใช้งาน</Button
							>
						</div>
					</section>
				{/if}
			</div>
			{#if inventoryOpen}
				<div class="space-y-6 p-4 sm:p-6">
					{@render inventorySummary()}
					<p class="text-sm text-muted-foreground">
						บันทึกการเปลี่ยนจำนวนหรือสภาพพัสดุ พร้อมเหตุผลสำหรับตรวจสอบย้อนหลัง
					</p>
					<form
						id={`inventory-form-${asset.id}`}
						class="grid gap-5"
						onsubmit={(event) => {
							event.preventDefault();
							saveInventoryAdjustment();
						}}
					>
						<Field.Field>
							<Field.Label for={`inventory-operation-${asset.id}`}>รายการปรับคลัง</Field.Label>
							<Select.Root type="single" bind:value={operation} disabled={inventoryPending}>
								<Select.Trigger id={`inventory-operation-${asset.id}`} class="min-h-11 w-full"
									>{inventoryOperations.find((item) => item.value === operation)
										?.label}</Select.Trigger
								>
								<Select.Content
									><Select.Group
										>{#each inventoryOperations as item (item.value)}<Select.Item value={item.value}
												>{item.label}</Select.Item
											>{/each}</Select.Group
									></Select.Content
								>
							</Select.Root>
						</Field.Field>
						<Field.Field>
							<Field.Label for={`inventory-amount-${asset.id}`}
								>จำนวน ({asset.unitTerm})</Field.Label
							>
							<Input
								id={`inventory-amount-${asset.id}`}
								class="min-h-11"
								type="number"
								inputmode="numeric"
								min={1}
								step={1}
								required
								bind:value={inventoryAmount}
								disabled={inventoryPending}
							/>
						</Field.Field>
						<Field.Field>
							<Field.Label for={`inventory-reason-${asset.id}`}>เหตุผลการปรับคลัง</Field.Label>
							<Input
								id={`inventory-reason-${asset.id}`}
								class="min-h-11"
								required
								bind:value={inventoryReason}
								disabled={inventoryPending}
								placeholder="เช่น ตรวจนับประจำเดือน / ส่งซ่อม"
							/>
						</Field.Field>
					</form>
					{#if asset.needsInventoryReview}
						<section class="space-y-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
							<h3 class="font-semibold">ยืนยันการตรวจนับ</h3>
							<p class="text-sm text-muted-foreground">
								ปรับยอดให้ถูกต้องก่อน แล้วระบุหลักฐานหรือเหตุผลในช่องด้านบนเพื่อยืนยันยอดปัจจุบัน
							</p>
							<Button
								type="button"
								variant="outline"
								class="min-h-11 w-full"
								disabled={inventoryPending}
								onclick={confirmCurrentInventory}>ยืนยันยอดตรวจนับ</Button
							>
						</section>
					{/if}
				</div>
			{/if}
		</div>
		<Sheet.Footer
			class="shrink-0 border-t bg-background pb-[max(1rem,env(safe-area-inset-bottom))]"
		>
			{#if inventoryOpen}
				<Button
					type="submit"
					form={`inventory-form-${asset.id}`}
					class="min-h-11 w-full"
					disabled={inventoryPending}
					>{#if inventoryPending}<Spinner />{/if}บันทึกการปรับคลัง</Button
				>
				<Button
					type="button"
					variant="ghost"
					class="min-h-11 w-full"
					disabled={inventoryPending}
					onclick={() => (inventoryOpen = false)}>กลับไปข้อมูลพัสดุ</Button
				>
			{:else}
				{#if mode === 'edit'}
					<Button
						class="min-h-11 w-full"
						onclick={() => form.submit()}
						disabled={$submitting || inventoryPending}
					>
						{#if $submitting}<Spinner />กำลังบันทึก...{:else}บันทึกการแก้ไข{/if}
					</Button>
				{/if}
				<Sheet.Close class={buttonVariants({ variant: 'ghost', class: 'min-h-11 w-full' })}
					>ปิด</Sheet.Close
				>
			{/if}
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>

{#snippet inventorySummary()}
	<dl class="grid grid-cols-2 gap-3 rounded-xl bg-muted/50 p-4">
		{#each [{ label: 'ทั้งหมด', value: asset.totalAmount }, { label: 'พร้อมใช้', value: asset.usableAmount }, { label: 'ซ่อม', value: asset.maintenanceAmount }, { label: 'ชำรุด', value: asset.damagedAmount }, { label: 'สูญหาย', value: asset.lostAmount }] as item (item.label)}
			<div class="flex items-baseline justify-between gap-2">
				<dt class="text-sm text-muted-foreground">{item.label}</dt>
				<dd class="font-semibold tabular-nums">{item.value}</dd>
			</div>
		{/each}
	</dl>
{/snippet}
