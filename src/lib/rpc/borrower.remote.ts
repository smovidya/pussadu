import { command, query } from '$app/server';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import {
	selectAllBorrowers,
	selectBorrower,
	updateBorrower
} from '$lib/server/models/borrower.model';
import z4 from 'zod/v4';

export const getMyBorrowerData = query(async () => {
	const { ouid } = Guard.loggedIn();

	return await selectBorrower(Locals.db, ouid);
});

export const listAllBorrowers = query(async () => {
	await Guard.allows({
		permissions: {
			user: ['list']
		},
	});

	return await selectAllBorrowers(Locals.db, { limit: 100, offset: 0 });
});

export const adminUpdateBorrower = command(
	z4.object({
		ouid: z4.string(),
		data: z4.object({
			name: z4.string().optional(),
			email: z4.email().optional(),
			line_id: z4.string().optional(),
			phone: z4.string().optional(),
			departmentId: z4.string().optional()
		})
	}),
	async ({ ouid, data }) => {
		await Guard.allows({
			permissions: {
				user: ['update']
			},
		});

		await updateBorrower(Locals.db, ouid, data);

		// see https://svelte.dev/docs/kit/remote-functions#form-Single-flight-mutations
		// we can also do this client side
		await listAllBorrowers().refresh();
	}
);
