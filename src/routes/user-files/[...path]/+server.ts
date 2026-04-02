import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	const userId = event.locals.user?.id;
	if (!userId) {
		const limit = await event.platform?.env.ANON_IMAGE_ACCESS_RATE_LIMIT.limit({
			key: event.url.pathname
		});

		if (limit && !limit?.success) {
			error(429, 'Too many requests');
		}
	}

	// user-files/Ol4PHuC05vdP6l7acsEoHUyW4li96W39/utxjDBKgmB5k90JWJUzd7xiM0gSi9ifD-Frame_1__1_.png
	const filePath = `user-files/${event.params.path}`;
	const file = await event.platform?.env.PUSSADU_R2.get(filePath);

	if (!file) {
		error(404, 'File not found');
	}

	return new Response(file.body);
};
