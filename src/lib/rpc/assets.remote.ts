import { command, query } from '$app/server';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import * as asset from '$lib/server/models/assets.model';

export const requestToBorrow = command(asset.BorrowingRequest.omit('ouid'), async (request) => {
	const { ouid } = Guard.loggedIn();

	await asset.requestToBorrow(Locals.db, {
		...request,
		ouid
	});
});

export const listBorrowed = query(async () => {
	const { ouid } = Guard.loggedIn();
	return await asset.listBorrowedByUser(Locals.db, ouid);
});

export const listAssets = query(async () => {
	Guard.loggedIn();

	return await asset.listAssets(Locals.db);
});
