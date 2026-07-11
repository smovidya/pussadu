import { query } from '$app/server';
import { countLogs, getAllLogs } from '$lib/server/models/audit.model';
import { Locals } from '$lib/server/helpers/facades/request-event';
import { Guard } from '$lib/server/helpers/facades/guard';
import { type } from 'arktype';

export const getLogsByTarget = query(
	type({
		targetId: 'string'
	}),
	async ({ targetId }) => {
		await Guard.allows({ permission: { log: ['list'] } });
		return await getAllLogs(Locals.db, {
			fieldEq: { target: targetId },
			orderBy: [{ field: 'createdAt', direction: 'desc' }]
		});
	}
);

const DEFAULT_PAGE_SIZE = 25;

export const getAllSystemLogs = query(
	type({
		'search?': 'string',
		'action?': 'string',
		'sortBy?': 'string',
		'sortDirection?': '"asc" | "desc"',
		'page?': 'number',
		'pageSize?': 'number'
	}),
	async ({ search, action, sortBy, sortDirection, page = 0, pageSize = DEFAULT_PAGE_SIZE }) => {
		await Guard.allows({ permission: { log: ['list'] } });
		const filter = {
			fieldEq: action && action !== 'all' ? { action } : undefined,
			textSearch: search
		};
		const [logs, total] = await Promise.all([
			getAllLogs(Locals.db, {
				...filter,
				orderBy: [
					{
						field: (sortBy as any) || 'createdAt',
						direction: sortDirection || 'desc'
					}
				],
				limit: pageSize,
				offset: page * pageSize
			}),
			countLogs(Locals.db, filter)
		]);
		return { logs, total, page, pageSize };
	}
);
