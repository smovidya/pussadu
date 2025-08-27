<script lang="ts">
	import { goto } from '$app/navigation';
	import { setProjectInfo } from '$lib/rpc/project.remote';
	import { updateProjectSchema } from '$lib/validator/project.validator';
	import Button from '$stories/shadcnui/button/button.svelte';
	import * as Card from '$stories/shadcnui/card';
	import * as Form from '$stories/shadcnui/form';
	import * as Select from '$stories/shadcnui/select';
	import Input from '$stories/shadcnui/input/input.svelte';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { arktype } from 'sveltekit-superforms/adapters';
	import { possibleOwnerList } from '$lib/constants';
	import type { InferSelectModel } from 'drizzle-orm';
	import type { project } from '$lib/schema';
	import { Save, ArrowLeft } from '@lucide/svelte';

	interface Props {
		projectData: InferSelectModel<typeof project>;
	}

	const { projectData }: Props = $props();

	const validators = arktype(updateProjectSchema);
	const form = superForm(defaults(validators), {
		SPA: true,
		validators,
		async onUpdate({ form }) {
			if (!form.valid) return;
			await setProjectInfo(form.data);
			await goto('/admin/projects');
		}
	});

	const { form: formData, enhance, submit } = form;

	// Initialize form with existing project data
	$formData.id = projectData.id;
	$formData.title = projectData.title;
	$formData.owner = projectData.owner;
	$formData.isPinned = projectData.isPinned;
	$formData.status = projectData.status;
</script>

<Card.Root class="w-full">
	<Card.Header>
		<div class="flex items-center justify-between">
			<div>
				<Card.Title>แก้ไขรายละเอียดโครงการ</Card.Title>
				<Card.Description class="mt-2">
					แก้ไขข้อมูลโครงการ: {projectData.title}
				</Card.Description>
			</div>
			<Button variant="outline" href="/admin/projects" class="flex items-center gap-2">
				<ArrowLeft class="h-4 w-4" />
				กลับ
			</Button>
		</div>
	</Card.Header>
	<Card.Content>
		<form method="POST" use:enhance class="w-2/3 space-y-6">
			<!-- Hidden ID field -->
			<input type="hidden" name="id" bind:value={$formData.id} />

			<Form.Field {form} name="title">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>ชื่อโครงการ</Form.Label>
						<Input {...props} placeholder="รับน้องวิทยาปี 25555555" bind:value={$formData.title} />
					{/snippet}
				</Form.Control>
				<Form.Description>ชื่อโครงการที่จะแสดงในระบบ</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="owner">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>ฝ่ายเจ้าของโครงการ</Form.Label>
						<Select.Root
							type="single"
							onValueChange={(val) => ($formData.owner = val)}
							value={$formData.owner}
							name={props.name}
						>
							<Select.Trigger>
								{#if $formData.owner}
									{$formData.owner}
								{:else}
									เลือกฝ่ายเจ้าของโครงการ
								{/if}
							</Select.Trigger>
							<Select.Content>
								{#each possibleOwnerList as item (item)}
									<Select.Item value={item}>{item}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.Description>ฝ่ายที่รับผิดชอบโครงการนี้</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="isPinned">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>ใครมีสิทธื์ยืมบ้าง</Form.Label>
						<Select.Root
							type="single"
							name={props.name}
							onValueChange={(val) => ($formData.isPinned = val === 'true')}
							value={$formData.isPinned ? 'true' : 'false'}
						>
							<Select.Trigger class="w-[180px]">
								{#if $formData.isPinned}
									ทุกคนยืมได้
								{:else}
									เฉพาะสตาฟงาน
								{/if}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="true">ทุกคนยืมได้</Select.Item>
								<Select.Item value="false">เฉพาะสตาฟงาน</Select.Item>
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.Description>
					เช่น กุญแจบางห้อง ไม่จำเป็นต้องมีโครงการเพื่อยืม หากเลือก เฉพาะสตาฟงาน
					จะต้องเพิ่มชื่อในโครงการก่อนจึงจะยืมได้
				</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="status">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>สถานะโครงการ</Form.Label>
						<Select.Root
							type="single"
							onValueChange={(val) => ($formData.status = val as typeof $formData.status)}
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
				<Form.Description>สถานะปัจจุบันของโครงการ</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
		</form>
	</Card.Content>
	<Card.Footer class="flex justify-between">
		<div class="flex gap-2">
			<Button variant="outline" href="/admin/projects">ยกเลิก</Button>
		</div>
		<Button type="submit" onclick={submit} class="flex items-center gap-2">
			<Save class="h-4 w-4" />
			บันทึกการเปลี่ยนแปลง
		</Button>
	</Card.Footer>
</Card.Root>
