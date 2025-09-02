<script lang="ts">
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { DateFormatter, type DateValue, fromDate } from '@internationalized/date';
	import { cn } from '$stories/utils';
	import { buttonVariants } from '$stories/shadcnui/button';
	import { Calendar } from '$stories/shadcnui/calendar';
	import * as Popover from '$stories/shadcnui/popover';

	const df = new DateFormatter('th-TH', {
		dateStyle: 'long'
	});

	interface Props {
		value: Date | undefined;
		onChange?: (value: DateValue | undefined) => void;
		class?: string;
	}

	let { onChange, value = $bindable(), class: className }: Props = $props();
	let dateValue = $derived(value ? fromDate(value, 'Asia/Bangkok') : undefined);
	let contentRef = $state<HTMLElement | null>(null);
</script>

<Popover.Root>
	<Popover.Trigger
		class={cn(
			buttonVariants({
				variant: 'outline',
				class: 'justify-start text-left font-normal'
			}),
			!dateValue && 'text-muted-foreground',
			className
		)}
	>
		<CalendarIcon />
		{dateValue ? df.format(dateValue.toDate()) : 'เลือกวัน'}
	</Popover.Trigger>
	<Popover.Content bind:ref={contentRef} class="w-auto p-0">
		<Calendar type="single" locale="th" bind:value={dateValue} onValueChange={onChange} />
	</Popover.Content>
</Popover.Root>
