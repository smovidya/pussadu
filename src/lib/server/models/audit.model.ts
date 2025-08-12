import { eq } from 'drizzle-orm';
import { tables, type DrizzleClient } from '../db';
import {
	deleteFromTable,
	getFromTable,
	insertToTable,
	purgeDeletedFromTable,
	updateToTable
} from './helper';

const logTable = tables.log;

export const insertNewLog = insertToTable(logTable);
export const updateLog = updateToTable(logTable, logTable.id);
export const getLog = getFromTable(logTable, logTable.id);
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
		includeDeleted = false
	}: {
		orderBy?: { field: keyof typeof logTable.$inferSelect; direction: 'asc' | 'desc' }[];
		fieldEq?: Record<keyof typeof logTable.$inferSelect, unknown>;
		fieldIsNull?: Record<keyof typeof logTable.$inferSelect, boolean>;
		fieldDateRange?: Record<'createAt' | 'updatedAt' | 'deleteAt', { from?: Date; to?: Date }>;
		fieldsSeach?: Record<keyof typeof logTable.$inferSelect, unknown>;
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
		where: (logs, { eq, and, isNull, lte, gte, ilike }) => {
			return and(
				...Object.entries(fieldEq || {}).map(([field, value]) =>
					eq(logs[field as keyof typeof logTable.$inferSelect], value)
				),
				includeDeleted ? undefined : isNull(logs.deletedAt),
				...Object.entries(fieldIsNull || {}).map(([field, _value]) =>
					isNull(logs[field as keyof typeof logTable.$inferSelect])
				),
				...Object.entries(fieldDateRange || {}).flatMap(([field, range]) => {
					const fieldKey = field as keyof typeof logTable.$inferSelect;
					return [
						range.from ? gte(logs[fieldKey], range.from) : undefined,
						range.to ? lte(logs[fieldKey], range.to) : undefined
					].filter(Boolean);
				}),
				...Object.entries(fieldsSeach || {})
					.map(([field, value]) => {
						if (typeof value === 'string' && value.trim() !== '') {
							return ilike(logs[field as keyof typeof logTable.$inferSelect], value);
						}
						return undefined;
					})
					.filter(Boolean)
			);
		}
	});
};

export const countLogsByActor = async (db: DrizzleClient, actorId: string) => {
	return await db.$count(logTable, eq(logTable.actor, actorId));
};
