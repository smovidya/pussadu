import { eq } from 'drizzle-orm';
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

export const getAllLogs = async (
	db: DrizzleClient,
	{
		orderBy,
		fieldEq,
		fieldIsNull,
		fieldDateRange,
		fieldsSeach,
		textSearch,
		includeDeleted = false
	}: {
		orderBy?: { field: keyof LogSelect; direction: 'asc' | 'desc' }[];
		fieldEq?: { [K in keyof LogSelect]?: unknown };
		fieldIsNull?: { [K in keyof LogSelect]?: boolean };
		fieldDateRange?: Record<'createAt' | 'updatedAt' | 'deleteAt', { from?: Date; to?: Date }>;
		fieldsSeach?: { [K in keyof LogSelect]?: unknown };
		textSearch?: string;
		includeDeleted?: boolean;
	}
) => {
	return await db.query.log.findMany({
		orderBy: (logs, { asc, desc }) => {
			if (!orderBy) return [];
			return orderBy.map(({ field, direction }) => {
				const order = direction === 'asc' ? asc : desc;
				return order(logs[field]);
			});
		},
		where: (logs, { eq, and, or, isNull, lte, gte, ilike }) => {
			return and(
				...Object.entries(fieldEq || {}).map(([field, value]) =>
					eq(logs[field as keyof LogSelect], value as any)
				),
				includeDeleted ? undefined : isNull(logs.deletedAt),
				...Object.entries(fieldIsNull || {}).map(([field, _value]) =>
					isNull(logs[field as keyof LogSelect])
				),
				...Object.entries(fieldDateRange || {}).flatMap(([field, range]) => {
					const fieldKey = field as keyof LogSelect;
					return [
						range.from ? gte(logs[fieldKey], range.from) : undefined,
						range.to ? lte(logs[fieldKey], range.to) : undefined
					].filter(Boolean);
				}),
				...Object.entries(fieldsSeach || {})
					.map(([field, value]) => {
						if (typeof value === 'string' && value.trim() !== '') {
							return ilike(logs[field as keyof LogSelect], value);
						}
						return undefined;
					})
					.filter(Boolean),
				textSearch
					? or(
							ilike(logs.action, `%${textSearch}%`),
							ilike(logs.actor, `%${textSearch}%`),
							ilike(logs.target, `%${textSearch}%`),
							ilike(logs.comment, `%${textSearch}%`)
						)
					: undefined
			);
		}
	});
};

export const countLogsByActor = async (db: DrizzleClient, actorId: string) => {
	return await db.$count(logTable, eq(logTable.actor, actorId));
};
