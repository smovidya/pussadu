import { command, query } from '$app/server';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import * as borrowing from '$lib/server/models/borrowing.model';
import { BorrowingRequest, ReturnStatus } from '$lib/validator/borrowing.validator';
import { type } from 'arktype';

export const requestToBorrow = command(BorrowingRequest.omit('borrowerId'), async (request) => {
	const { ouid } = Guard.loggedIn();

	await borrowing.requestToBorrow(Locals.db, {
		...request,
		borrowerId: ouid
	});
});

export const listBorrowed = query(async () => {
	const { ouid } = Guard.loggedIn();
	return await borrowing.listBorrowedByUser(Locals.db, ouid);
});

export const approveRequest = command(type({ id: 'string' }), async ({ id }) => {
	const { ouid } = Guard.admin();
});

export const rejectRequest = command(type({ id: 'string' }), async ({ id }) => {
	const { ouid } = Guard.admin();
});

export const cancelRequest = command(type({ id: 'string' }), async ({ id }) => {
	const { ouid } = Guard.loggedIn();
});

export const returnBorrowing = command(
	type({ id: 'string', status: ReturnStatus }),
	async ({ id, status }) => {
		const { ouid } = Guard.admin();
	}
);
