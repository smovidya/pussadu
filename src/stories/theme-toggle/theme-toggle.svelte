<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { setMode, userPrefersMode } from 'mode-watcher';
	import { Button } from '$stories/shadcnui/button';
	import * as DropdownMenu from '$stories/shadcnui/dropdown-menu';

	const choices = [
		{ value: 'light', label: 'สว่าง', Icon: SunIcon },
		{ value: 'dark', label: 'มืด', Icon: MoonIcon },
		{ value: 'system', label: 'ตามระบบ', Icon: MonitorIcon }
	] as const;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" class="w-full justify-start" aria-label="เลือกธีมสี">
				<SunIcon data-icon="inline-start" class="dark:hidden" />
				<MoonIcon data-icon="inline-start" class="hidden dark:block" />
				ธีมสี
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="start" class="w-44">
		<DropdownMenu.Group>
			<DropdownMenu.Label>ธีมสี</DropdownMenu.Label>
			{#each choices as choice (choice.value)}
				<DropdownMenu.Item onclick={() => setMode(choice.value)}>
					<choice.Icon data-icon="inline-start" />
					{choice.label}
					{#if userPrefersMode.current === choice.value}
						<CheckIcon data-icon="inline-end" class="ml-auto" />
					{/if}
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
