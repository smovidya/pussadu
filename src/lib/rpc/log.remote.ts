import { query } from '$app/server';
import { getAllLogs } from '$lib/server/models/audit.model';
import { Locals } from '$lib/server/helpers/facades/request-event';
import { Guard } from '$lib/server/helpers/facades/guard';
import { type } from 'arktype';

export const getLogsByTarget = query(
	type({
		targetId: 'string'
	}),
	async ({ targetId }) => {
		Guard.admin();
		return await getAllLogs(Locals.db, {
			fieldEq: { target: targetId },
			orderBy: [{ field: 'createdAt', direction: 'desc' }]
		});
	}
);

export const getAllSystemLogs = query(
	type({
		'search?': 'string',
		'action?': 'string',
		'sortBy?': 'string',
		'sortDirection?': '"asc" | "desc"'
	}),
	async ({ search, action, sortBy, sortDirection }) => {
		Guard.admin();
		return await getAllLogs(Locals.db, {
			fieldEq: action && action !== 'all' ? { action } : undefined,
			textSearch: search,
			orderBy: [
				{
					field: (sortBy as any) || 'createdAt',
					direction: sortDirection || 'desc'
				}
			]
		});
	}
);
