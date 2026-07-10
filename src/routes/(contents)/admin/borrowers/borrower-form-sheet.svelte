<script lang="ts">
	import * as Sheet from '$stories/shadcnui/sheet';
	import * as Form from '$stories/shadcnui/form';
	import * as Select from '$stories/shadcnui/select';
	import { Input } from '$stories/shadcnui/input';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import Button from '$stories/shadcnui/button/button.svelte';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { arktype } from 'sveltekit-superforms/adapters';
	import { createBorrowerSchema } from '$lib/validator/borrower.validator';
	import { createBorrower, updateBorrowerInfo, listAllBorrowers } from '$lib/rpc/borrower.remote';
	import { listDepartment } from '$lib/rpc/department.remote';
	import { toast } from 'svelte-sonner';
	import { isHttpError } from '@sveltejs/kit';
	import type { Snippet } from 'svelte';

	type Borrower = NonNullable<ReturnType<typeof listAllBorrowers>['current']>[number];

	interface Props {
		trigger: Snippet<[{ props: Record<string, unknown> }]>;
		borrower?: Borrower;
	}

	let { trigger, borrower }: Props = $props();
	let open = $state(false);

	const isEdit = !!borrower;
	const validators = arktype(createBorrowerSchema);
	const form = superForm(
		defaults(validators, {
			defaults: {
				ouid: borrower?.ouid ?? '',
				name: borrower?.name ?? '',
				email: borrower?.email ?? '',
				line_id: borrower?.line_id ?? '',
				phone: borrower?.phone ?? '',
				departmentId: borrower?.departmentId ?? ''
			}
		}),
		{
			id: `borrower-form-${borrower?.ouid ?? 'new'}`,
			SPA: true,
			validators,
			async onUpdate({ form }) {
				if (!form.valid) {
					toast.error('ตรวจสอบข้อมูลอีกครั้ง');
					return;
				}
				try {
					if (isEdit) {
						await updateBorrowerInfo(form.data);
						toast.success(`แก้ไขข้อมูล "${form.data.name}" เรียบร้อยแล้ว`);
					} else {
						await createBorrower(form.data);
						toast.success(`เพิ่ม "${form.data.name}" เรียบร้อยแล้ว`);
					}
					open = false;
				} catch (e) {
					if (isHttpError(e)) {
						toast.error(`เกิดข้อผิดพลาด: ${e.body.message}`);
						return;
					}
					toast.error(`เกิดข้อผิดพลาด: ${(e as Error).message}`);
				}
			}
		}
	);

	const { form: formData, enhance } = form;
	const departmentsQuery = listDepartment();

	// Re-seed the form from the latest row data every time the sheet is opened,
	// so a stale snapshot from a previous refresh isn't shown.
	$effect(() => {
		if (open) {
			form.reset({
				data: {
					ouid: borrower?.ouid ?? '',
					name: borrower?.name ?? '',
					email: borrower?.email ?? '',
					line_id: borrower?.line_id ?? '',
					phone: borrower?.phone ?? '',
					departmentId: borrower?.departmentId ?? ''
				}
			});
		}
	});
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger>
		{#snippet child({ props })}
			{@render trigger({ props })}
		{/snippet}
	</Sheet.Trigger>
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>{isEdit ? 'แก้ไขผู้มีสิทธิ์ยืม' : 'เพิ่มผู้มีสิทธิ์ยืม'}</Sheet.Title>
			<Sheet.Description>
				{isEdit ? 'แก้ไขข้อมูลของผู้มีสิทธิ์ยืมพัสดุ' : 'เพิ่มนิสิตที่มีสิทธิ์ยืมพัสดุเข้าสู่ระบบ'}
			</Sheet.Description>
		</Sheet.Header>
		<form use:enhance class="grid flex-1 auto-rows-min gap-4 overflow-y-auto px-4">
			<Form.Field {form} name="ouid">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>เลขนิสิต</Form.Label>
						<Input
							{...props}
							placeholder="6xxxxxxxxx"
							bind:value={$formData.ouid}
							disabled={isEdit}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>ชื่อ-นามสกุล</Form.Label>
						<Input {...props} placeholder="ชื่อ นามสกุล" bind:value={$formData.name} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="email">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>อีเมล</Form.Label>
						<Input
							{...props}
							type="email"
							placeholder="name@student.chula.ac.th"
							bind:value={$formData.email}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="phone">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>เบอร์โทร</Form.Label>
						<Input {...props} placeholder="0812345678" bind:value={$formData.phone} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="line_id">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Line ID</Form.Label>
						<Input {...props} placeholder="line_id" bind:value={$formData.line_id} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="departmentId">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>ภาควิชา</Form.Label>
						{#await departmentsQuery}
							<Skeleton class="h-9 w-full" />
						{:then departments}
							<Select.Root type="single" name={props.name} bind:value={$formData.departmentId}>
								<Select.Trigger class="w-full">
									{departments.find((d) => d.id === $formData.departmentId)?.name ?? 'เลือกภาควิชา'}
								</Select.Trigger>
								<Select.Content>
									{#each departments as dept (dept.id)}
										<Select.Item value={dept.id}>{dept.name}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						{/await}
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<div class="flex flex-wrap gap-2 py-4">
				<Button type="submit">{isEdit ? 'บันทึก' : 'เพิ่ม'}</Button>
				<Sheet.Close>
					{#snippet child({ props })}
						<Button variant="ghost" {...props}>ยกเลิก</Button>
					{/snippet}
				</Sheet.Close>
			</div>
		</form>
	</Sheet.Content>
</Sheet.Root>
