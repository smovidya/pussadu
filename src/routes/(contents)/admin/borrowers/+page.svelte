<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import BorrowersPage from './borrowers-page.svelte';
</script>

<svelte:head>
	<title>จัดการผู้ใช้</title>
</svelte:head>

<BorrowersPage {authClient} />
