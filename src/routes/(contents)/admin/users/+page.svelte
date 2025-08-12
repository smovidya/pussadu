<script lang="ts">
	import UsersPage from './users-page.svelte';
	import { authClient } from '$lib/auth-client';
</script>

<svelte:head>
	<title>จัดการผู้ใช้</title>
</svelte:head>

<UsersPage {authClient} />
