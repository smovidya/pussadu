import type { Handle } from '@sveltejs/kit';

import { getDb } from '$lib/server/db';
import { createAuth } from '$lib/server/auth';
import { building } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
	// prerendered routes throw an error during building because the build runtime can't access platform.env
	if (building) return resolve(event);

	const { PUSSADU_DB } = event.platform!.env;

	event.locals.db = getDb({ d1Binding: PUSSADU_DB! });

	const auth = createAuth(event.platform!.env);

	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	event.locals.auth = auth;

	if (session) {
		event.locals.session = session;
		event.locals.user = session.user;
	} else {
		event.locals.user = null;
		event.locals.session = null;
	}

	return resolve(event);
};
