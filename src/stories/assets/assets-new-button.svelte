<script lang="ts">
	import Button, { buttonVariants } from '$stories/shadcnui/button/button.svelte';
	import { Input } from '$stories/shadcnui/input';
	import * as Sheet from '$stories/shadcnui/sheet';
	import * as Form from '$stories/shadcnui/form';
	import * as RadioGroup from '$stories/shadcnui/radio-group';
	import * as Select from '$stories/shadcnui/select';
	import { Plus } from '@lucide/svelte';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { arktype } from 'sveltekit-superforms/adapters';
	import { createAsset, listAssets } from '$lib/rpc/assets.remote';
	import { insertAssetSchema } from '$lib/validator/asset.validator';
	import { assetStatusOptions, assetTypeOptions, projectOwnerOptions } from '$lib/constants';
	import Textarea from '$stories/shadcnui/textarea/textarea.svelte';
	import Upload from '$stories/file-input/upload.svelte';
	import { listCategories } from '$lib/rpc/categories.remote';
	import Skeleton from '$stories/shadcnui/skeleton/skeleton.svelte';
	import { toast } from 'svelte-sonner';

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
	const { form: formData, enhance } = form;
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
		<form method="POST" use:enhance class="grid flex-1 auto-rows-min gap-6 overflow-y-auto px-4">
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>ชื่อพัสดุ</Form.Label>
						<Input {...props} bind:value={$formData.name} />
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
									<RadioGroup.Item value={option.value} {...props} />
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
			<div class="flex flex-row items-end">
				<Form.Field {form} name="amount">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>จำนวน</Form.Label>
							<Input
								{...props}
								placeholder="10"
								min="1"
								type="number"
								bind:value={$formData.amount}
								class="w-32 rounded-r-none border-r-0"
							/>
						{/snippet}
					</Form.Control>
					<Form.Description>จำนวนพัสดุคงคลัง</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="unitTerm">
					<Form.Control>
						{#snippet children({ props })}
							<Input
								{...props}
								placeholder="อัน"
								bind:value={$formData.unitTerm}
								class="rounded-l-none"
							/>
						{/snippet}
					</Form.Control>
					<Form.Description>คำลักษณะนามที่จะใช้กับพัสดุนี้ เช่น ชิ้น</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<Form.Field {form} name="status">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>สถานะ</Form.Label>
						<Select.Root type="single" bind:value={$formData.status} name={props.name}>
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
						<Select.Root type="single" bind:value={$formData.owner} name={props.name}>
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
					<Upload bind:uploadedUrl={$formData.image_url} />
				</Form.Control>
				<Form.Description
					>ระวังไฟล์โดนครอบด้านล่าง รองรับ .jpg, .jpeg, .png, และ .gif</Form.Description
				>
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
		<Sheet.Footer>
			<Button onclick={() => form.submit()} class="mr-2">บันทึก</Button>
			<Sheet.Close class={buttonVariants({ variant: 'outline' })}>ปืด</Sheet.Close>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
