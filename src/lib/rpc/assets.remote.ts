import { query } from '$app/server';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import * as assets from '$lib/server/models/assets.model';

export const listAssets = query(async () => {
	Guard.loggedIn();

	return await assets.listAssets(Locals.db);
});
