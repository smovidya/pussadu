import { and, eq, gte, isNull, like, lte, or } from 'drizzle-orm';
import { tables, type DrizzleClient } from '../db';
import {
	deleteFromTable,
	getOneFromTable,
	insertToTable,
	purgeDeletedFromTable,
	updateToTable
} from './helper';

const logTable = tables.log;
type LogSelect = typeof logTable.$inferSelect;

import type { LogEntryInsert } from '$lib/schema/log-details';

export const insertNewLog = async (
	db: DrizzleClient,
	data: LogEntryInsert & { actor: string; target: string; comment?: string }
) => {
	return insertToTable(logTable)(db, data);
};
export const updateLog = updateToTable(logTable, logTable.id);
export const getLog = getOneFromTable(logTable, logTable.id);
export const deleteLog = deleteFromTable(logTable, logTable.id);
export const purgeLog = purgeDeletedFromTable(logTable);

export const getLogsByActor = async (db: DrizzleClient, actorId: string) => {
	return await db.query.log.findMany({
		where: (logs, { eq }) => eq(logTable.actor, actorId)
	});
};

type GetAllLogsFilter = {
	orderBy?: { field: keyof LogSelect; direction: 'asc' | 'desc' }[];
	fieldEq?: { [K in keyof LogSelect]?: unknown };
	fieldIsNull?: { [K in keyof LogSelect]?: boolean };
	fieldDateRange?: Record<'createAt' | 'updatedAt' | 'deleteAt', { from?: Date; to?: Date }>;
	fieldsSeach?: { [K in keyof LogSelect]?: unknown };
	textSearch?: string;
	/** Substring match on `target` — needed for bulk actions that store comma-joined ids. */
	targetContains?: string;
	includeDeleted?: boolean;
};

const buildLogsWhere = ({
	fieldEq,
	fieldIsNull,
	fieldDateRange,
	fieldsSeach,
	textSearch,
	targetContains,
	includeDeleted = false
}: GetAllLogsFilter) => {
	return and(
		targetContains ? like(logTable.target, `%${targetContains}%`) : undefined,
		...Object.entries(fieldEq || {}).map(([field, value]) =>
			eq(logTable[field as keyof LogSelect], value as never)
		),
		includeDeleted ? undefined : isNull(logTable.deletedAt),
		...Object.entries(fieldIsNull || {}).map(([field]) =>
			isNull(logTable[field as keyof LogSelect])
		),
		...Object.entries(fieldDateRange || {}).flatMap(([field, range]) => {
			const fieldKey = field as keyof LogSelect;
			return [
				range.from ? gte(logTable[fieldKey], range.from) : undefined,
				range.to ? lte(logTable[fieldKey], range.to) : undefined
			].filter(Boolean);
		}),
		...Object.entries(fieldsSeach || {})
			.map(([field, value]) => {
				if (typeof value === 'string' && value.trim() !== '') {
					return like(logTable[field as keyof LogSelect], value);
				}
				return undefined;
			})
			.filter(Boolean),
		textSearch
			? or(
					like(logTable.action, `%${textSearch}%`),
					like(logTable.actor, `%${textSearch}%`),
					like(logTable.target, `%${textSearch}%`),
					like(logTable.comment, `%${textSearch}%`)
				)
			: undefined
	);
};

export const getAllLogs = async (
	db: DrizzleClient,
	{ orderBy, limit, offset, ...filter }: GetAllLogsFilter & { limit?: number; offset?: number }
) => {
	return await db.query.log.findMany({
		orderBy: (logs, { asc, desc }) => {
			if (!orderBy) return [];
			return orderBy.map(({ field, direction }) => {
				const order = direction === 'asc' ? asc : desc;
				return order(logs[field]);
			});
		},
		where: () => buildLogsWhere(filter),
		limit,
		offset
	});
};

export const countLogs = async (db: DrizzleClient, filter: GetAllLogsFilter = {}) => {
	return await db.$count(logTable, buildLogsWhere(filter));
};

export const countLogsByActor = async (db: DrizzleClient, actorId: string) => {
	return await db.$count(logTable, eq(logTable.actor, actorId));
};
