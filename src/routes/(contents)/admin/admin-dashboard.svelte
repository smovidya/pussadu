<script lang="ts">
	import PageWrapper from '$stories/page-wrapper/page-wrapper.svelte';
	import { Button } from '$stories/shadcnui/button';
	import * as Card from '$stories/shadcnui/card';
	import PageHeader from '$stories/page-header/page-header.svelte';
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

{#snippet adminPageCard(title: string, description: string, href: string, Icon: typeof User)}
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2"><Icon />{title}</Card.Title>
			<Card.Description>{description}</Card.Description>
		</Card.Header>
		<Card.Footer>
			<Button {href}>ไปยัง {title}<ChevronRight data-icon="inline-end" /></Button>
		</Card.Footer>
	</Card.Root>
{/snippet}

<PageWrapper groupTitle="การจัดการ" pageTitle="แดชบอร์ดผู้ดูแลระบบ" groupUrl="/admin">
	<PageHeader
		title="แดชบอร์ดผู้ดูแลระบบ"
		description="จัดการผู้ใช้ โครงการ และงานด้านการบริหารของระบบพัสดุ"
	/>

	<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each pages as card (card.href)}
			{@render adminPageCard(card.title, card.description, card.href, card.icon)}
		{/each}
	</div>
</PageWrapper>
