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
