<script>
	import { authClient } from '$lib/auth-client';
	import LoginOld from '$stories/pages/login/login-old.svelte';
</script>

<svelte:head>
	<title>ระบบพัสดุ | SMO Vidya Chula</title>
</svelte:head>

<LoginOld {authClient} />
