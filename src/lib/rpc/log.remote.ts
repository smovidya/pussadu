import { query } from '$app/server';
import { countLogs, getAllLogs } from '$lib/server/models/audit.model';
import { resolveLogTargets } from '$lib/server/models/log-target.model';
import { Locals } from '$lib/server/helpers/facades/request-event';
import { Guard } from '$lib/server/helpers/facades/guard';
import { type } from 'arktype';

const DEFAULT_PAGE_SIZE = 25;

export const getAllSystemLogs = query(
	type({
		'search?': 'string',
		'action?': 'string',
		'target?': 'string',
		'targetContains?': 'string',
		'actor?': 'string',
		'sortBy?': 'string',
		'sortDirection?': '"asc" | "desc"',
		'page?': 'number',
		'pageSize?': 'number'
	}),
	async ({
		search,
		action,
		target,
		targetContains,
		actor,
		sortBy,
		sortDirection,
		page = 0,
		pageSize = DEFAULT_PAGE_SIZE
	}) => {
		await Guard.allows({ permission: { log: ['list'] } });
		const SORTABLE_FIELDS = ['createdAt', 'action', 'actor', 'target', 'comment'] as const;
		type SortField = (typeof SORTABLE_FIELDS)[number];
		const sortField = SORTABLE_FIELDS.includes(sortBy as SortField)
			? (sortBy as SortField)
			: 'createdAt';
		const fieldEq = {
			...(action && action !== 'all' ? { action } : {}),
			...(target ? { target } : {}),
			...(actor ? { actor } : {})
		};
		const filter = {
			fieldEq: Object.keys(fieldEq).length > 0 ? fieldEq : undefined,
			targetContains,
			textSearch: search
		};
		const [logs, total] = await Promise.all([
			getAllLogs(Locals.db, {
				...filter,
				orderBy: [
					{
						field: sortField,
						direction: sortDirection || 'desc'
					}
				],
				limit: pageSize,
				offset: page * pageSize
			}),
			countLogs(Locals.db, filter)
		]);
		const targets = await resolveLogTargets(Locals.db, logs);
		return { logs, total, page, pageSize, targets };
	}
);
