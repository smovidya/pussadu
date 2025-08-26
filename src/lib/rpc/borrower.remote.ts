import { query } from '$app/server';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import { selectAllBorrowers, selectBorrower } from '$lib/server/models/borrower.model';
import { type } from 'arktype';
import { error } from '@sveltejs/kit';

export const getMyBorrowerData = query(async () => {
	const { ouid } = Guard.loggedIn();

	return await selectBorrower(Locals.db, ouid);
});

export const getBorrowerInfo = query(type({ ouid: 'string' }), async (data) => {
	Guard.admin();

	const borrower = await selectBorrower(Locals.db, data.ouid);
	if (!borrower) error(404);
	return borrower;
});

export const listAllBorrowers = query(async () => {
	await Guard.allows({
		permissions: {
			user: ['list']
		}
	});

	return await selectAllBorrowers(Locals.db, { limit: 100, offset: 0 });
});
