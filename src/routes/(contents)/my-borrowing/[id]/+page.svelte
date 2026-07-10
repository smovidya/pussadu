<script lang="ts">
	import { page } from '$app/state';
	import MyBorrowingDetail from './my-borrowing-detail.svelte';

	const id = page.params.id ?? '';
</script>

<MyBorrowingDetail {id} />
