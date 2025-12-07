<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import BorrowersPage from './borrowers-page.svelte';
</script>

<BorrowersPage {authClient} />
