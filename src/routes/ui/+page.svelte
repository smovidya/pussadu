<script>
	import Dialog from '../../stories/dialog';

	let open = $state(false);
</script>

<button onclick={() => (open = true)}> open </button>

<div>
	<input type="checkbox" id="example1" />
	<label for="example1">This is a checkbox</label>
</div>

<div class="ml-8 max-w-80">
	<!-- TODO: make this draggable lmao -->
	<Dialog bind:open title="gay">Bodyyyyyyyyyyyyyyyyyyy</Dialog>
</div>
