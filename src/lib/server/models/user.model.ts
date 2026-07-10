import { isNotNull } from 'drizzle-orm';
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
			ouid: tables.user.ouid,
			name: tables.user.name,
			email: tables.user.email
		})
		.from(tables.user)
		.where(isNotNull(tables.user.ouid));
};
