<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SearchIcon from '@lucide/svelte/icons/search';
	import * as InputGroup from './index';
	import * as Field from '$stories/shadcnui/field';

	const { Story } = defineMeta({
		title: 'UI/InputGroup',
		parameters: { a11y: { test: 'error' } }
	});
</script>

<script lang="ts">
	let quantity = $state(3);
</script>

<Story name="Search and quantity" asChild>
	<div class="flex w-full max-w-md flex-col gap-6 p-6">
		<Field.Field>
			<Field.Label for="group-search">ค้นหาพัสดุ</Field.Label>
			<InputGroup.Root>
				<InputGroup.Addon><SearchIcon /></InputGroup.Addon>
				<InputGroup.Input id="group-search" placeholder="เช่น กล้องถ่ายรูป" />
			</InputGroup.Root>
		</Field.Field>
		<Field.Field>
			<Field.Label for="group-quantity">จำนวนที่ยืม</Field.Label>
			<InputGroup.Root>
				<InputGroup.Addon>
					<InputGroup.Button
						aria-label="ลดจำนวน"
						size="icon-xs"
						onclick={() => (quantity = Math.max(1, quantity - 1))}><MinusIcon /></InputGroup.Button
					>
				</InputGroup.Addon>
				<InputGroup.Input
					id="group-quantity"
					type="number"
					min="1"
					bind:value={quantity}
					class="text-center tabular-nums"
				/>
				<InputGroup.Addon align="inline-end">
					<InputGroup.Button aria-label="เพิ่มจำนวน" size="icon-xs" onclick={() => (quantity += 1)}
						><PlusIcon /></InputGroup.Button
					>
				</InputGroup.Addon>
			</InputGroup.Root>
			<Field.Description>จำนวนคงเหลือ 10 ชิ้น</Field.Description>
		</Field.Field>
		<Field.Field data-invalid>
			<Field.Label for="group-invalid">รหัสพัสดุ</Field.Label>
			<InputGroup.Root data-invalid>
				<InputGroup.Input id="group-invalid" aria-invalid value="ไม่ถูกต้อง" />
			</InputGroup.Root>
			<Field.Error>ไม่พบรหัสพัสดุนี้</Field.Error>
		</Field.Field>
		<InputGroup.Root data-disabled>
			<InputGroup.Input aria-label="ข้อมูลที่ปิดใช้งาน" disabled value="ปิดใช้งาน" />
		</InputGroup.Root>
	</div>
</Story>
