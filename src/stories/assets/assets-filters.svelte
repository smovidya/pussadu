<script lang="ts">
	import * as Card from '$stories/shadcnui/card';
	import * as ToggleGroup from '$stories/shadcnui/toggle-group';
	import Input from '$stories/shadcnui/input/input.svelte';
	import { assetTypeOptions } from '$lib/constants';

	interface Props {
		searchTerm?: string;
		selectedTypes?: (typeof assetTypeOptions)[number]['value'][];
	}

	let {
		searchTerm = $bindable(),
		selectedTypes = $bindable(assetTypeOptions.map((v) => v.value))
	}: Props = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>ค้นหา</Card.Title>
	</Card.Header>
	<Card.Content class="flex flex-col gap-2">
		<Input placeholder="ค้นหาพัสดุ" bind:value={searchTerm} />
		<ToggleGroup.Root variant="outline" type="multiple" bind:value={selectedTypes}>
			{#each assetTypeOptions as { value, label } (value)}
				<ToggleGroup.Item
					{value}
					aria-label={`แสดง ${label}`}
					class="data-[state=on]:bg-amber-500 data-[state=on]:text-yellow-50"
				>
					{label}
				</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
	</Card.Content>
</Card.Root>
