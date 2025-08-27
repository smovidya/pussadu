<script lang="ts">
	import * as Breadcrumb from '$stories/shadcnui/breadcrumb';
	import * as Sidebar from '$stories/shadcnui/sidebar';
	import { Separator } from '$stories/shadcnui/separator';
	import type { Snippet } from 'svelte';

	interface Props {
		groupTitle: string;
		groupUrl: string;
		pageTitle: string;
		children?: Snippet;
	}
	const { children, groupTitle, pageTitle, groupUrl }: Props = $props();
</script>

<svelte:head>
	<title>{pageTitle} | พัสดุวิทยา</title>
</svelte:head>

<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
	<Sidebar.Trigger class="-ml-1" />
	<Separator orientation="vertical" class="mr-2 h-4" />
	<Breadcrumb.Root>
		<Breadcrumb.List>
			<Breadcrumb.Item class="hidden md:block">
				<Breadcrumb.Link href={groupUrl}>
					{groupTitle}
				</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator class="hidden md:block" />
			<Breadcrumb.Item>
				<Breadcrumb.Page>
					{pageTitle}
				</Breadcrumb.Page>
			</Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>
</header>
<div class="container flex flex-1 flex-col gap-4 p-4 mx-auto">
	{@render children?.()}
</div>
