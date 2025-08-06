<script>
	// import Dialog from './dialog.svelte';
	import * as Dialog from '$lib/components/win7/dialog';

	let open = $state(false);
</script>

<button onclick={() => (open = true)}> open </button>

<div>
	<input type="checkbox" id="example1" />
	<label for="example1">This is a checkbox</label>
</div>

<div class="ml-8 max-w-80">
	<!-- TODO: make this draggable lmao -->
	<Dialog.Root bind:open>
		<Dialog.Window>
			<Dialog.Titlebar>Window Title</Dialog.Titlebar>
			<Dialog.Body>
				Bodyyyyyyyyyyyyyyyyyyy
			</Dialog.Body>
		</Dialog.Window>
	</Dialog.Root>
</div>
