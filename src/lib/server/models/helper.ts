import { and, Column, eq, isNotNull, isNull, Table } from 'drizzle-orm';
import { type DrizzleClient } from '../db';
import type { SQLiteSelect } from 'drizzle-orm/sqlite-core';

export function removeStateDateFields<T extends Record<string, unknown>>(
	data: T
): Omit<T, 'createdAt' | 'updatedAt' | 'deletedAt'> {
	const { createdAt: _, updatedAt: __, deletedAt: ___, ...rest } = data;
	return rest;
}

/**
 * Inserts a new record into the specified table.
 * @param table The table to insert the record into.
 * @returns A function that takes a database client and the data to insert.
 */
export function insertToTable<T extends Table>(table: T) {
	/**
	 * Inserts a new record into the specified table.
	 * @param db The database client to use for the insert.
	 * @param data The data to insert into the table.
	 * @param [data.createdAt] Ignored field.
	 * @param [data.updatedAt] Ignored field.
	 * @param [data.deletedAt] Ignored field.
	 * @note This function will remove any state date fields from the data before inserting.
	 *       Eg. createdAt, updatedAt, deletedAt
	 */
	return async function (db: DrizzleClient, data: T['$inferInsert']) {
		if (Array.isArray(data)) {
			data = data.map((v) => removeStateDateFields(v));
		} else {
			data = removeStateDateFields(data);
		}
		const result = await db.insert(table).values(data).returning();
		if (result.length === 0) {
			throw new Error('Insert failed');
		}
		return result[0] as T['$inferSelect'];
	};
}

/**
 * Updates a record in the specified table.
 * @param table The table to update the record in.
 * @param idColumn The column to use as the ID for lookup.
 * @param data The data to update the record with.
 * @description Updates a record in the specified table.
 * @returns A function that takes a database client and the ID and data to update.
 */
export function updateToTable<T extends Table, C extends Column>(table: T, idColumn: C) {
	/**
	 * Updates a record in the specified table.
	 * @param db The database client to use for the update.
	 * @param id The ID of the record to update.
	 * @param data The data to update the record with.
	 * @param [data.createdAt] Ignored field.
	 * @param [data.updatedAt] Ignored field.
	 * @param [data.deletedAt] Ignored field.
	 * @note This function will remove any state date fields from the data before updating.
	 *       Eg. createdAt, updatedAt, deletedAt
	 */
	return async function (db: DrizzleClient, id: string, data: Partial<T["$inferInsert"]>) {
		if (Array.isArray(data)) {
			data = data.map((v) => removeStateDateFields(v));
		} else {
			data = removeStateDateFields(data) as any;
		}
		return db.update(table).set(data).where(eq(idColumn, id)).returning();
	};
}

/**
 * Retrieves a record from the specified table by ID.
 * @param table The table to retrieve the record from.
 * @param idColumn The column to use as the ID for lookup.
 * @returns A function that takes a database client and the ID of the record to retrieve.
 */
export function getOneFromTable<T extends Table & { deletedAt: Column }>(
	table: T,
	idColumn: Column
) {
	return async function (db: DrizzleClient, id: string, options?: { includeDeleted?: boolean }) {
		const result = await db
			.select()
			.from(table)
			.where(
				and(
					eq(idColumn, id),
					options?.includeDeleted ? isNotNull(table.deletedAt) : isNull(table.deletedAt)
				)
			);
		if (result.length === 0) {
			return null;
		}
		return result[0];
	};
}

/**
 * Deletes a record from the specified table by ID.
 * @param table The table to delete the record from.
 * @param idColumn The column to use as the ID for lookup.
 * @returns A function that takes a database client and the ID of the record to delete.
 */
export function deleteFromTable<T extends Table & { deletedAt: Column }>(
	table: T,
	idColumn: Column
) {
	return async function (db: DrizzleClient, id: string, options?: { force?: boolean }) {
		if (options?.force) {
			return db.delete(table).where(eq(idColumn, id));
		}

		const isAlreadyDeleted = await db
			.select()
			.from(table)
			.where(and(eq(idColumn, id), isNotNull(table.deletedAt)));

		if (isAlreadyDeleted.length > 0) {
			throw new Error(`Record with ID ${id} is already deleted.`);
		}

		return db.update(table).set({ deletedAt: new Date() }).where(eq(idColumn, id));
	};
}

/**
 * Purges deleted records from the specified table by ID.
 * @param table The table to purge deleted records from.
 * @param idColumn The column to use as the ID for lookup.
 * @returns A function that takes a database client and the ID of the record to purge.
 */
export function purgeDeletedFromTable<T extends Table & { deletedAt: Column }>(table: T) {
	return async function (db: DrizzleClient) {
		return db.delete(table).where(isNotNull(table.deletedAt));
	};
}

export function withPagination<T extends SQLiteSelect>(db: DrizzleClient, qb: T) {
	return async function (page: number, pageSize: number) {
		if (page < 0 || pageSize <= 0) {
			throw new Error(
				'Page must be a non-negative integer and pageSize must be a positive integer.'
			);
		}
		return qb.limit(pageSize).offset(page * pageSize);
	};
}

export type FilterOrderByField<T extends Table> = {
	field: keyof T & string;
	direction: 'asc' | 'desc';
}[];
