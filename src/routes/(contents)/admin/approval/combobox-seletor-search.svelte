<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick, type Snippet } from 'svelte';
	import * as Command from '$stories/shadcnui/command';
	import * as Popover from '$stories/shadcnui/popover';
	import { Button } from '$stories/shadcnui/button';
	import { cn } from '$stories/utils';

	interface Option {
		group?: string;
		value: string;
		label: string;
	}

	type Props = {
		options: Array<Option>;
		empty?: Snippet;
		trigger?: Snippet<
			[
				{
					props: Record<string, unknown>;
					value: string | string[];
					options: Array<Option>;
				}
			]
		>;
		placeholder?: string;
		type?: 'single' | 'multiple';
		value?: string | string[];
		item?: Snippet<
			[
				{
					option: Option;
					isSelected: boolean;
					type: 'single' | 'multiple';
				}
			]
		>;
		onChange?: (value: string | string[]) => void;
	};

	let {
		options = $bindable([]),
		empty,
		trigger,
		placeholder,
		type = $bindable('single'),
		value: values = $bindable(type === 'multiple' ? [] : ''),
		onChange,
		item
	}: Props = $props();

	let open = $state(false);
	// let values = $state<string | string[]>(type === 'multiple' ? [] : '');
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedValue = $derived(options.find((f) => f.value === values)?.label);
	let groups = $derived(Array.from(new Set(options.map((option) => option.group))));

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	function onSelectionChange(selected: string | string[]) {
		values = selected;
		if (onChange && typeof onChange === 'function') {
			onChange(values);
		}
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			{#if trigger}
				{@render trigger({ props, value: values, options })}
			{:else}
				<Button
					{...props}
					variant="outline"
					class="w-50 justify-between"
					role="combobox"
					aria-expanded={open}
				>
					{selectedValue || 'เลือกค่า'}
					<ChevronsUpDownIcon class="opacity-50" />
				</Button>
			{/if}
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="p-0">
		<Command.Root>
			<Command.Input placeholder={placeholder || 'ค้นหา...'} />
			<Command.List>
				<Command.Empty>
					{#if empty}
						{@render empty()}
					{:else}
						ไม่พบข้อมูล
					{/if}
				</Command.Empty>
				{#each groups as group (group)}
					<Command.Group value={group || 'ungrouped'} heading={group || undefined}>
						{#each options.filter((option) => option.group === group) as option (option.value)}
							<Command.Item
								value={option.value}
								onSelect={() => {
									if (type === 'multiple') {
										if (Array.isArray(values)) {
											if (values.includes(option.value)) {
												onSelectionChange(values.filter((v) => v !== option.value));
											} else {
												onSelectionChange([...values, option.value]);
											}
										}
									} else {
										onSelectionChange(option.value);
										closeAndFocusTrigger();
									}
								}}
							>
								{#if item}
									{@render item({
										option,
										isSelected:
											type === 'multiple'
												? Array.isArray(values) && values.includes(option.value)
												: values === option.value,
										type
									})}
								{:else}
									<CheckIcon class={cn(values !== option.value && 'text-transparent')} />
									{option.label}
								{/if}
							</Command.Item>
						{/each}
					</Command.Group>
				{/each}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
