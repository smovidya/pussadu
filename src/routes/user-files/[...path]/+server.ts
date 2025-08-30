import { error } from '@sveltejs/kit';

export const GET = async (event) => {
	const userId = event.locals.user?.id;
	if (!userId) {
		return new Response('Unauthorized', { status: 401 });
	}

	// user-files/Ol4PHuC05vdP6l7acsEoHUyW4li96W39/utxjDBKgmB5k90JWJUzd7xiM0gSi9ifD-Frame_1__1_.png
	const filePath = `user-files/${event.params.path}`;
	const file = await event.platform?.env.PUSSADU_R2.get(filePath);

	if (!file) {
		error(404, 'File not found');
	}

	return new Response(file.body);
};
