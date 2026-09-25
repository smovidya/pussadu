import { Guard } from '$lib/server/helpers/facades/guard';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	Guard.admin();
};
