<script lang="ts">
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import Button from '$stories/shadcnui/button/button.svelte';
	import { Card } from '$stories/shadcnui/card';
	import { ChevronRight, User } from '@lucide/svelte';

	const pages = [
		{
			title: 'การจัดการผู้ใช้',
			description: 'จัดการผู้ใช้ในระบบของคุณ',
			href: '/admin/users',
			icon: User
		},
		{
			title: 'ผู้มีสิทธิ์ยืม',
			description: 'จัดการผู้มีสิทธิ์ยืมในระบบของคุณ',
			href: '/admin/borrowers',
			icon: User
		}
	];
</script>

<!-- @eslint-disable-next-line @typescript-eslint/no-unused-vars -->
{#snippet adminPageCard(title: string, description: string, href: string, _icon: unknown)}
	<Card class="mt-4 p-4">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold">{title}</h2>
			<icon class="size-6"></icon>
		</div>
		<p>{description}</p>
		<Button {href} class="mt-2"
			>ไปยัง {title}
			<ChevronRight class="size-4" />
		</Button>
	</Card>
{/snippet}

<PageWrapper groupTitle="การจัดการ" pageTitle="แดชบอร์ดผู้ดูแลระบบ" groupUrl="/admin">
	<h1 class="text-2xl font-bold">แดชบอร์ดผู้ดูแลระบบ</h1>
	<p>
		ยินดีต้อนรับสู่แดชบอร์ดผู้ดูแลระบบ ที่นี่คุณสามารถจัดการผู้ใช้ โครงการ และงานด้านการบริหารอื่นๆ
		ได้
	</p>

	<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each pages as card (card.href)}
			{@render adminPageCard(card.title, card.description, card.href, card.icon)}
		{/each}
	</div>
</PageWrapper>
