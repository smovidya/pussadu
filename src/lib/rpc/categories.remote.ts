import { query } from '$app/server';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import * as categoriesModel from '$lib/server/models/categories.model';

export const listCategories = query(async () => {
	Guard.loggedIn();

	const categories = await categoriesModel.listCategories(Locals.db, false);
	return categories;
});
