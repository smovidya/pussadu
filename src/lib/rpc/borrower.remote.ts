import { getRequestEvent, query } from '$app/server';
import {
	selectAllBorrowers,
	selectBorrower,
	updateBorrower
} from '$lib/server/models/borrower.model';
import { error } from '@sveltejs/kit';
import z4 from 'zod/v4';

export const getMyBorrowerData = query(async () => {
	const { locals } = getRequestEvent();
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	return await selectBorrower(locals.db, locals.user.ouid);
});

export const listAllBorrowers = query(async () => {
	const {
		locals,
		request: { headers }
	} = getRequestEvent();
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	if (
		!locals.auth.api.userHasPermission({
			headers: headers,
			body: {
				permissions: {
					user: ['list']
				}
			}
		})
	) {
		error(403, 'Forbidden');
	}

	return await selectAllBorrowers(locals.db, { limit: 100, offset: 0 });
});

export const adminUpdateBorrower = query(
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
		const {
			locals,
			request: { headers }
		} = getRequestEvent();
		if (!locals.user) {
			error(401, 'Unauthorized');
		}

		if (
			!locals.auth.api.userHasPermission({
				headers: headers,
				body: {
					permissions: {
						user: ['update']
					}
				}
			})
		) {
			error(403, 'Forbidden');
		}

		return await updateBorrower(locals.db, ouid, data);
	}
);
