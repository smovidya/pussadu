<script lang="ts">
	import { goto } from '$app/navigation';
	import { createProject } from '$lib/rpc/project.remote';
	import { createProjectSchema } from '$lib/validator/project.validator';
	import Button from '$stories/shadcnui/button/button.svelte';
	import * as Card from '$stories/shadcnui/card';
	import * as Form from '$stories/shadcnui/form';
	import * as Select from '$stories/shadcnui/select';
	import Input from '$stories/shadcnui/input/input.svelte';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { arktype } from 'sveltekit-superforms/adapters';

	const validators = arktype(createProjectSchema);
	const form = superForm(defaults(validators), {
		SPA: true,
		validators,
		async onUpdate({ form }) {
			console.log(form);
			if (!form.valid) return;
			await createProject(form.data);
			await goto('/admin/projects');
		}
	});

	const { form: formData, enhance, submit } = form;
</script>

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title>รายละเอียดโครงการ</Card.Title>
	</Card.Header>
	<Card.Content>
		<form method="POST" use:enhance class="w-2/3 space-y-6">
			<Form.Field {form} name="title">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>ชื่อโครงการ</Form.Label>
						<Input {...props} placeholder="รับน้องวิทยาปี 25555555" bind:value={$formData.title} />
					{/snippet}
				</Form.Control>
				<Form.Description />
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="owner">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>ฝ่ายเจ้าของโครงการ</Form.Label>
						<Input {...props} placeholder="อาจารย์สมชาย" bind:value={$formData.owner} />
					{/snippet}
				</Form.Control>
				<Form.Description />
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="isPublished">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>สถานะเผยแพร่</Form.Label>
						<Select.Root
							type="single"
							name={props.name}
							onValueChange={(val) => ($formData.isPublished = val === 'true')}
							value={$formData.isPublished ? 'true' : 'false'}
						>
							<Select.Trigger class="w-[180px]">
								{#if $formData.isPublished}
									เผยแพร่
								{:else}
									ไม่เผยแพร่
								{/if}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="true">เผยแพร่</Select.Item>
								<Select.Item value="false">ไม่เผยแพร่</Select.Item>
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.Description />
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="status">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>สถานะโครงการ</Form.Label>
						<Select.Root
							type="single"
							onValueChange={(val) => ($formData.status = val)}
							value={$formData.status}
							name={props.name}
						>
							<Select.Trigger class="w-[180px]">
								{#if $formData.status === 'notstarted'}
									ยังไม่เริ่ม
								{:else if $formData.status === 'inprogress'}
									กำลังดำเนินการ
								{:else if $formData.status === 'completed'}
									เสร็จสิ้น
								{:else if $formData.status === 'evaluated'}
									อยู่ระหว่างการประเมิน
								{:else if $formData.status === 'cancelled'}
									ยกเลิก
								{:else}
									ไม่ระบุ
								{/if}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="notstarted">ยังไม่เริ่ม</Select.Item>
								<Select.Item value="inprogress">กำลังดำเนินการ</Select.Item>
								<Select.Item value="completed">เสร็จสิ้น</Select.Item>
								<Select.Item value="evaluated">อยู่ระหว่างการประเมิน</Select.Item>
								<Select.Item value="cancelled">ยกเลิก</Select.Item>
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.Description />
				<Form.FieldErrors />
			</Form.Field>
		</form>
	</Card.Content>
	<Card.Footer>
		<Button type="submit" onclick={submit}>เพิ่มโครงการ</Button>
	</Card.Footer>
</Card.Root>
