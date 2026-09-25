import { asc, isNotNull, like, or, sql } from 'drizzle-orm';
import { tables, type DrizzleClient } from '../db';

export const selectAllUsers = async (db: DrizzleClient) => {
	return db.query.user.findMany({
		orderBy: (user, { desc }) => desc(user.createdAt)
	});
};

/**
 * Minimal ouid -> name/email lookup for resolving log actors to a person,
 * without pulling the full user list (see admin/log).
 */
export const selectUserDirectory = async (db: DrizzleClient) => {
	return db
		.select({
			id: tables.user.id,
			ouid: tables.user.ouid,
			name: tables.user.name,
			email: tables.user.email
		})
		.from(tables.user)
		.where(isNotNull(tables.user.ouid));
};

export const selectUserById = async (db: DrizzleClient, id: string) => {
	return db.query.user.findFirst({
		where: (user, { eq }) => eq(user.id, id),
		columns: {
			id: true,
			name: true,
			email: true,
			role: true,
			ouid: true,
			banned: true,
			createdAt: true
		}
	});
};

const administratorColumns = {
	id: tables.user.id,
	name: tables.user.name,
	email: tables.user.email,
	ouid: tables.user.ouid,
	role: tables.user.role,
	banned: tables.user.banned
};

export const selectAdministrators = (db: DrizzleClient) =>
	db
		.select(administratorColumns)
		.from(tables.user)
		.where(sql`instr(',' || coalesce(${tables.user.role}, '') || ',', ',admin,') > 0`)
		.orderBy(asc(tables.user.name), asc(tables.user.id));

export const searchAdministratorAccounts = (db: DrizzleClient, search: string) =>
	db
		.select(administratorColumns)
		.from(tables.user)
		.where(
			or(
				like(tables.user.name, `%${search}%`),
				like(tables.user.email, `%${search}%`),
				like(tables.user.ouid, `%${search}%`)
			)
		)
		.orderBy(asc(tables.user.name), asc(tables.user.id))
		.limit(20);
