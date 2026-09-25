<script lang="ts">
	import { isHttpError } from '@sveltejs/kit';
	import { Search, ShieldPlus } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import {
		createAdministrator,
		grantAdministrator,
		searchAdministratorCandidates
	} from '$lib/rpc/administrator.remote';
	import { Button } from '$stories/shadcnui/button';
	import { Input } from '$stories/shadcnui/input';
	import { Skeleton } from '$stories/shadcnui/skeleton';
	import * as Sheet from '$stories/shadcnui/sheet';
	import * as Tabs from '$stories/shadcnui/tabs';
	import * as Field from '$stories/shadcnui/field';
	import * as Alert from '$stories/shadcnui/alert';
	import * as Empty from '$stories/shadcnui/empty';

	type Account = Awaited<ReturnType<typeof searchAdministratorCandidates>>[number];
	let open = $state(false);
	let mode = $state('existing');
	let search = $state('');
	let submittedSearch = $state('');
	let selected = $state<Account | null>(null);
	let email = $state('');
	let name = $state('');
	let saving = $state(false);
	let failure = $state('');
	const candidates = $derived(
		open && mode === 'existing' && submittedSearch.length >= 2
			? searchAdministratorCandidates({ search: submittedSearch })
			: null
	);

	function reset() {
		mode = 'existing';
		search = '';
		submittedSearch = '';
		selected = null;
		email = '';
		name = '';
		failure = '';
	}

	async function save() {
		if (saving || (mode === 'existing' && !selected)) return;
		saving = true;
		failure = '';
		try {
			const account =
				mode === 'existing'
					? await grantAdministrator({ userId: selected!.id })
					: await createAdministrator({ email: email.trim(), name: name.trim() });
			toast.success(`เพิ่ม ${account.email} เป็นผู้ดูแลระบบแล้ว`);
			open = false;
		} catch (err) {
			failure = isHttpError(err) ? err.body.message : 'เพิ่มผู้ดูแลระบบไม่สำเร็จ โปรดลองอีกครั้ง';
		} finally {
			saving = false;
		}
	}
</script>

<Sheet.Root
	bind:open
	onOpenChange={(value) => {
		if (value) reset();
	}}
>
	<Sheet.Trigger>
		{#snippet child({ props })}
			<Button {...props}
				><ShieldPlus data-icon="inline-start" aria-hidden="true" />เพิ่มผู้ดูแลระบบ</Button
			>
		{/snippet}
	</Sheet.Trigger>
	<Sheet.Content
		class="w-full overflow-y-auto sm:max-w-lg"
		onInteractOutside={(event) => {
			if (saving) event.preventDefault();
		}}
		onEscapeKeydown={(event) => {
			if (saving) event.preventDefault();
		}}
	>
		<Sheet.Header>
			<Sheet.Title>เพิ่มผู้ดูแลระบบ</Sheet.Title>
			<Sheet.Description>เลือกบัญชีที่มีอยู่ หรือสร้างบัญชีใหม่ด้วยอีเมลจุฬาฯ</Sheet.Description>
		</Sheet.Header>
		<div class="flex flex-1 flex-col gap-6 px-4 pb-4">
			<Alert.Root>
				<Alert.Title>สิทธิ์ผู้ดูแลระบบ</Alert.Title>
				<Alert.Description
					>จัดการบุคคล พัสดุ โครงการ รายการยืม และเพิ่มผู้ดูแลระบบคนอื่นได้</Alert.Description
				>
			</Alert.Root>
			<Tabs.Root
				value={mode}
				onValueChange={(value) => {
					if (!saving) {
						mode = value;
						failure = '';
					}
				}}
			>
				<Tabs.List class="w-full">
					<Tabs.Trigger value="existing" disabled={saving} class="flex-1"
						>บัญชีที่มีอยู่</Tabs.Trigger
					>
					<Tabs.Trigger value="new" disabled={saving} class="flex-1">บัญชีใหม่</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="existing" class="flex flex-col gap-4 pt-4">
					<form
						onsubmit={(event) => {
							event.preventDefault();
							selected = null;
							failure = '';
							submittedSearch = search.trim();
						}}
					>
						<Field.Group>
							<Field.Field>
								<Field.Label for="admin-account-search">ค้นหาบัญชีผู้ใช้</Field.Label>
								<div class="flex gap-2">
									<Input
										id="admin-account-search"
										type="search"
										bind:value={search}
										minlength={2}
										maxlength={120}
										required
										disabled={saving}
										placeholder="ชื่อ อีเมล หรือเลขนิสิต"
										autocomplete="off"
										class="min-w-0"
									/>
									<Button
										type="submit"
										variant="outline"
										disabled={saving || search.trim().length < 2}
										><Search data-icon="inline-start" aria-hidden="true" />ค้นหา</Button
									>
								</div>
								<Field.Description>พิมพ์อย่างน้อย 2 ตัวอักษร แสดงสูงสุด 20 บัญชี</Field.Description>
							</Field.Field>
						</Field.Group>
					</form>
					{#if candidates}
						{#await candidates.ready ? candidates.current : candidates}
							<Skeleton class="h-40 w-full [animation-duration:700ms] motion-reduce:animate-none" />
						{:then accounts}
							{#if accounts?.length}
								<Field.Set disabled={saving}>
									<Field.Legend class="sr-only">เลือกบัญชีที่จะเพิ่มเป็นผู้ดูแลระบบ</Field.Legend>
									<div class="flex max-h-72 flex-col gap-2 overflow-y-auto">
										{#each accounts as account (account.id)}
											{@const alreadyAdmin = account.role?.split(',').includes('admin')}
											<label
												class="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-checked:border-primary has-checked:bg-accent has-disabled:cursor-default has-disabled:opacity-60"
											>
												<input
													class="mt-1 size-4 shrink-0 accent-primary"
													type="radio"
													name="administrator-account"
													value={account.id}
													checked={selected?.id === account.id}
													onchange={() => {
														selected = account;
														failure = '';
													}}
													disabled={saving || account.banned === true || alreadyAdmin}
												/>
												<span class="flex min-w-0 flex-col gap-1">
													<span class="font-medium">{account.name}</span>
													<span class="text-sm break-all text-muted-foreground"
														>{account.email}</span
													>
													{#if account.banned}<span class="text-sm text-muted-foreground"
															>บัญชีถูกระงับ</span
														>
													{:else if alreadyAdmin}<span class="text-sm text-muted-foreground"
															>เป็นผู้ดูแลระบบอยู่แล้ว</span
														>{/if}
												</span>
											</label>
										{/each}
									</div>
								</Field.Set>
							{:else}
								<Empty.Root
									><Empty.Header
										><Empty.Title>ไม่พบบัญชีผู้ใช้</Empty.Title><Empty.Description
											>ลองค้นหาด้วยอีเมล หรือเลือกแท็บบัญชีใหม่</Empty.Description
										></Empty.Header
									></Empty.Root
								>
							{/if}
						{:catch}
							<Alert.Root variant="destructive"
								><Alert.Title>ค้นหาไม่สำเร็จ</Alert.Title><Alert.Description
									><Button variant="outline" size="sm" onclick={() => candidates?.refresh()}
										>ลองอีกครั้ง</Button
									></Alert.Description
								></Alert.Root
							>
						{/await}
					{/if}
					{#if selected}
						<p class="text-sm break-words">
							กำลังเพิ่มสิทธิ์ให้ <strong>{selected.email}</strong> โดยคงบทบาทเดิมไว้
						</p>
					{/if}
				</Tabs.Content>
				<Tabs.Content value="new" class="pt-4">
					<form
						id="new-administrator-form"
						onsubmit={(event) => {
							event.preventDefault();
							save();
						}}
					>
						<Field.Group>
							<Field.Field>
								<Field.Label for="new-admin-name">ชื่อ-นามสกุล</Field.Label>
								<Input
									id="new-admin-name"
									name="name"
									bind:value={name}
									required
									maxlength={200}
									disabled={saving}
									autocomplete="off"
								/>
							</Field.Field>
							<Field.Field>
								<Field.Label for="new-admin-email">อีเมลจุฬาฯ</Field.Label>
								<Input
									id="new-admin-email"
									name="email"
									type="email"
									bind:value={email}
									required
									maxlength={254}
									disabled={saving}
									autocomplete="off"
									autocapitalize="none"
									spellcheck={false}
									aria-describedby="new-admin-email-help"
								/>
								<Field.Description id="new-admin-email-help"
									>@student.chula.ac.th หรือ @chula.ac.th เท่านั้น เจ้าของบัญชีเข้าสู่ระบบด้วย
									Google โดยใช้อีเมลนี้</Field.Description
								>
							</Field.Field>
						</Field.Group>
					</form>
				</Tabs.Content>
			</Tabs.Root>
			{#if failure}
				<Alert.Root variant="destructive" role="alert"
					><Alert.Title>เพิ่มผู้ดูแลระบบไม่สำเร็จ</Alert.Title><Alert.Description
						>{failure}</Alert.Description
					></Alert.Root
				>
			{/if}
			<p class="text-sm text-muted-foreground">
				หากบัญชีที่ได้รับสิทธิ์กำลังใช้งานอยู่ ให้ออกจากระบบแล้วเข้าสู่ระบบอีกครั้ง
			</p>
			<Sheet.Footer class="mt-auto px-0">
				<Button type="button" variant="outline" disabled={saving} onclick={() => (open = false)}
					>ยกเลิก</Button
				>
				{#if mode === 'new'}
					<Button
						type="submit"
						form="new-administrator-form"
						disabled={saving || !name.trim() || !email.trim()}
						>{saving ? 'กำลังเพิ่ม…' : 'สร้างบัญชีและเพิ่มสิทธิ์'}</Button
					>
				{:else}
					<Button type="button" disabled={saving || !selected} onclick={save}
						>{saving ? 'กำลังเพิ่ม…' : 'ยืนยันเพิ่มผู้ดูแลระบบ'}</Button
					>
				{/if}
			</Sheet.Footer>
		</div>
	</Sheet.Content>
</Sheet.Root>
