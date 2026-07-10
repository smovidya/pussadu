import { and, eq } from 'drizzle-orm';
import { tables, type DrizzleClient } from '../db';
import * as helper from './helper';

const notificationTable = tables.notification;

export const insertNotification = helper.insertToTable(notificationTable);

export const listNotificationsForBorrower = async (
	db: DrizzleClient,
	borrowerId: string,
	limit = 20
) => {
	return db.query.notification.findMany({
		where: (n, { eq }) => eq(n.borrowerId, borrowerId),
		orderBy: (n, { desc }) => desc(n.createdAt),
		limit
	});
};

export const countUnreadNotifications = async (db: DrizzleClient, borrowerId: string) => {
	return db.$count(
		notificationTable,
		and(eq(notificationTable.borrowerId, borrowerId), eq(notificationTable.read, false))
	);
};

export const markNotificationRead = async (db: DrizzleClient, id: string, borrowerId: string) => {
	return db
		.update(notificationTable)
		.set({ read: true })
		.where(and(eq(notificationTable.id, id), eq(notificationTable.borrowerId, borrowerId)));
};

export const markAllNotificationsRead = async (db: DrizzleClient, borrowerId: string) => {
	return db
		.update(notificationTable)
		.set({ read: true })
		.where(eq(notificationTable.borrowerId, borrowerId));
};
