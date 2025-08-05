import { getRequestEvent, query } from '$app/server';

export const hello = query(() => {
	const { user } = getRequestEvent().locals;

	return `Hello, ${user?.name ?? 'World'}!`;
});
