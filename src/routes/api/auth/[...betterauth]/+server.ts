// https://medium.com/@dasfacc/sveltekit-better-auth-using-cloudflare-d1-and-drizzle-91d9d9a6d0b4

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	return event.locals.auth.handler(event.request);
};
export const POST: RequestHandler = async (event) => {
	return event.locals.auth.handler(event.request);
};
export const PUT: RequestHandler = async (event) => {
	return event.locals.auth.handler(event.request);
};
export const DELETE: RequestHandler = async (event) => {
	return event.locals.auth.handler(event.request);
};
