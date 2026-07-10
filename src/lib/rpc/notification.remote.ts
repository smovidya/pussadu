import { query, command } from '$app/server';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import * as notificationModel from '$lib/server/models/notification.model';
import { type } from 'arktype';

export const getMyNotifications = query(async () => {
	const { ouid } = Guard.loggedIn();
	return await notificationModel.listNotificationsForBorrower(Locals.db, ouid);
});

export const getMyUnreadNotificationCount = query(async () => {
	const { ouid } = Guard.loggedIn();
	return await notificationModel.countUnreadNotifications(Locals.db, ouid);
});

export const markNotificationRead = command(type({ id: 'string' }), async (data) => {
	const { ouid } = Guard.loggedIn();
	await notificationModel.markNotificationRead(Locals.db, data.id, ouid);
	await getMyNotifications().refresh();
	await getMyUnreadNotificationCount().refresh();
});

export const markAllNotificationsRead = command(async () => {
	const { ouid } = Guard.loggedIn();
	await notificationModel.markAllNotificationsRead(Locals.db, ouid);
	await getMyNotifications().refresh();
	await getMyUnreadNotificationCount().refresh();
});
