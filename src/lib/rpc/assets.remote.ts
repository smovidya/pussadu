import { query } from '$app/server';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import * as assets from '$lib/server/models/assets.model';
import { type } from 'arktype';

export const listAssets = query(
	type({
		'projectId?': 'string'
	}),
	async (data) => {
		Guard.loggedIn();

		if (!data.projectId) return assets.listAssets(Locals.db);
		return assets.listAssetsForProject(Locals.db, data.projectId);
	}
);
