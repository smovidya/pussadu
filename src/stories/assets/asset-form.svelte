<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms';
	import { Input } from '$stories/shadcnui/input';
	import * as Form from '$stories/shadcnui/form';
	import * as RadioGroup from '$stories/shadcnui/radio-group';
	import * as Select from '$stories/shadcnui/select';
	import * as FormPrimitive from 'formsnap';
	import { assetStatusOptions, assetTypeOptions, projectOwnerOptions } from '$lib/constants';
	import Textarea from '$stories/shadcnui/textarea/textarea.svelte';
	import { insertAssetSchema, updateAssetSchema } from '$lib/validator/asset.validator';
	import Upload from '$stories/file-input/upload.svelte';
	import { listCategories } from '$lib/rpc/categories.remote';
	import Skeleton from '$stories/shadcnui/skeleton/skeleton.svelte';

	type TSchema = typeof insertAssetSchema.infer | typeof updateAssetSchema.infer;

	interface Props {
		form: SuperForm<TSchema>;
		mode: 'create' | 'edit' | 'view';
	}

	let { form, mode = 'create' }: Props = $props();
	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance class="grid flex-1 auto-rows-min gap-4 overflow-y-auto px-4">
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>ชื่อพัสดุ</Form.Label>
				<Input readonly={mode === 'view'} {...props} bind:value={$formData.name} />
			{/snippet}
		</Form.Control>
		<Form.Description />
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="description">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>คำอธิบาย</Form.Label>
				<Textarea
					{...props}
					readonly={mode === 'view'}
					bind:value={$formData.description}
					placeholder="รายละเอียดสิ่งของ เช่น สี ความพัง"
				/>
			{/snippet}
		</Form.Control>
		<Form.Description />
		<Form.FieldErrors />
	</Form.Field>
	<Form.Fieldset {form} name="type">
		<Form.Legend>ประเภทพัสดุ</Form.Legend>
		<RadioGroup.Root bind:value={$formData.type} name="type" class="w-full">
			{#each assetTypeOptions as option (option.value)}
				<div class="flex w-full flex-row items-start space-y-0 space-x-2">
					<Form.Control>
						{#snippet children({ props })}
							<RadioGroup.Item disabled={mode === 'view'} value={option.value} {...props} />
							<Form.Label class="flex w-full flex-col items-start">
								<span>
									{option.label}
								</span>
								<span class="text-xs text-muted-foreground">
									{option.desc}
								</span>
							</Form.Label>
						{/snippet}
					</Form.Control>
				</div>
			{/each}
		</RadioGroup.Root>
		<Form.FieldErrors />
	</Form.Fieldset>
	<div
		class="grid grid-cols-2 grid-rows-3"
		style="grid-template-areas: 'label label' 'input-amount input-unitTerm' 'description-amount description-unitTerm' 'errors-amount errors-unitTerm'"
	>
		<FormPrimitive.Field {form} name="amount">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label class="grid-area-['label'] col-span-2">จำนวน</Form.Label>
					<Input
						{...props}
						placeholder="10"
						min="1"
						type="number"
						bind:value={$formData.amount}
						style="grid-area: input-amount"
						class="rounded-r-none border-r-0"
						readonly={mode === 'view'}
					/>
				{/snippet}
			</Form.Control>
			<Form.Description style="grid-area: description-amount">จำนวนพัสดุคงคลัง</Form.Description>
			<Form.FieldErrors style="grid-area: errors-amount" />
		</FormPrimitive.Field>
		<FormPrimitive.Field {form} name="unitTerm">
			<Form.Control>
				{#snippet children({ props })}
					<Input
						{...props}
						placeholder="อัน"
						bind:value={$formData.unitTerm}
						class="rounded-l-none"
						style="grid-area: input-unitTerm"
						readonly={mode === 'view'}
					/>
				{/snippet}
			</Form.Control>
			<Form.Description style="grid-area: description-unitTerm"
				>คำลักษณะนามที่จะใช้กับพัสดุนี้ เช่น ชิ้น</Form.Description
			>
			<Form.FieldErrors style="grid-area: errors-unitTerm" />
		</FormPrimitive.Field>
	</div>
	<Form.Field {form} name="status">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>สถานะ</Form.Label>
				<Select.Root
					disabled={mode === 'view'}
					type="single"
					bind:value={$formData.status}
					name={props.name}
				>
					<Select.Trigger>
						{#if $formData.status}
							{@const statusLabel = assetStatusOptions.find(
								(option) => option.value === $formData.status
							)?.label}
							{statusLabel}
						{:else}
							เลือกสถานะ
						{/if}
					</Select.Trigger>
					<Select.Content>
						{#each assetStatusOptions as option (option.value)}
							<Select.Item value={option.value}>{option.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.Description>สถานะของพัสดุ</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="owner">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>ฝ่ายเจ้าของพัสดุ</Form.Label>
				<Select.Root
					disabled={mode === 'view'}
					type="single"
					bind:value={$formData.owner}
					name={props.name}
				>
					<Select.Trigger>
						{#if $formData.owner}
							{@const ownerLabel = projectOwnerOptions.find(
								(option) => option.value === $formData.owner
							)?.label}
							{ownerLabel}
						{:else}
							เลือกฝ่ายเจ้าของพัสดุ
						{/if}
					</Select.Trigger>
					<Select.Content>
						{#each projectOwnerOptions as item (item.value)}
							<Select.Item value={item.value}>{item.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.Description>ฝ่ายที่รับผิดชอบพัสดุนี้</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="image_url">
		<Form.Control>
			<Form.Label>ภาพพัสดุ</Form.Label>
			{#if mode !== 'view'}
				<Upload bind:uploadedUrl={$formData.image_url} />
			{:else}
				<div class="my-2 w-full overflow-hidden rounded-md border shadow">
					<img
						src={$formData.image_url}
						alt="ตัวอย่างภาพพัสดุ"
						class="h-full w-full object-cover"
					/>
				</div>
			{/if}
		</Form.Control>
		{#if mode !== 'view'}
			<Form.Description
				>ระวังไฟล์โดนครอบด้านล่าง รองรับ .jpg, .jpeg, .png, และ .gif</Form.Description
			>
		{/if}
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="category">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>หมวดหมู่</Form.Label>
				{#await listCategories()}
					<Skeleton />
				{:then categories}
					<Select.Root
						disabled={mode === 'view'}
						type="single"
						onValueChange={(value) => {
							console.log(value);
							$formData.categoryId = value;
						}}
						name={props.name}
					>
						<Select.Trigger>
							{#if $formData.categoryId}
								{@const category = categories.find((cat) => cat.id === $formData.categoryId)}
								{category?.name ?? '-ไม่ทราบหมวดหมู่-'}
							{:else}
								เลือกหมวดหมู่
							{/if}
						</Select.Trigger>
						<Select.Content>
							{#each categories as category (category.id)}
								<Select.Item value={category.id}>{category.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{:catch err}
					{JSON.stringify(err)}
				{/await}
			{/snippet}
		</Form.Control>
		<Form.Description>หมวดหมู่ของพัสดุ เช่น อุปกรณ์ไฟฟ้า, เครื่องเขียน</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<input hidden bind:value={$formData.category} />
</form>
