import { and, Column, eq, isNotNull, isNull, Table } from 'drizzle-orm';
import { type DrizzleClient } from '../db';

/**
 * Inserts a new record into the specified table.
 * @param table The table to insert the record into.
 * @returns A function that takes a database client and the data to insert.
 */
export function insertToTable<T extends Table>(table: T) {
	return async function (db: DrizzleClient, data: T["$inferInsert"]) {
		return db.insert(table).values(data);
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
export function updateToTable<T extends Table>(table: T, idColumn: Column) {
	return async function (db: DrizzleClient, id: string, data: typeof table.$inferInsert) {
		return db.update(table).set(data).where(eq(idColumn, id));
	};
}

/**
 * Retrieves a record from the specified table by ID.
 * @param table The table to retrieve the record from.
 * @param idColumn The column to use as the ID for lookup.
 * @returns A function that takes a database client and the ID of the record to retrieve.
 */
export function getFromTable<T extends Table & { deletedAt: Column }>(table: T, idColumn: Column) {
	return async function (db: DrizzleClient, id: string, options?: { includeDeleted?: boolean }) {
		return db
			.select()
			.from(table)
			.where(
				and(
					eq(idColumn, id),
					options?.includeDeleted ? isNotNull(table.deletedAt) : isNull(table.deletedAt)
				)
			);
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
