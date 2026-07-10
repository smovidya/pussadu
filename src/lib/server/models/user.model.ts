import type { DrizzleClient } from '../db';

export const selectAllUsers = async (db: DrizzleClient) => {
	return db.query.user.findMany({
		orderBy: (user, { desc }) => desc(user.createdAt)
	});
};
