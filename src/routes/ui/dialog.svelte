<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { createDraggable } from './draggable.svelte';

	let { open = $bindable(false) } = $props();

	const draggable = createDraggable();
	const { onpointermove, onpointerup } = draggable.root;

	$effect(() => {
		if (open) {
			draggable.resetPosition();
		}
	});
</script>

<svelte:window {onpointerup} />
<svelte:body {onpointermove} />

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay
			class="fixed inset-0 bg-black/20 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
		/>

		<Dialog.Content
			class="win7 fixed top-[50%] left-[50%] w-72 translate-x-[-50%] translate-y-[-50%]"
		>
			<div class="window glass active pointer-events-auto w-full" {...draggable.container}>
				<div class="title-bar select-none" {...draggable.handle}>
					<div class="title-bar-text">A glass window frame</div>
					<div class="title-bar-controls">
						<button aria-label="Minimize" disabled></button>
						<Dialog.Close aria-label="Close"></Dialog.Close>
					</div>
				</div>
				<div class="window-body has-space">
					<p>The background behind is blurred.</p>
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
