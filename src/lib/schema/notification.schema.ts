import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { id, timestamps } from './helper';
import { relations } from 'drizzle-orm';
import { borrower } from './borrower.schema';

export const notification = sqliteTable('notification', {
	...id,
	borrowerId: text('borrower_id')
		.notNull()
		.references(() => borrower.ouid),
	title: text('title').notNull(),
	message: text('message').notNull(),
	link: text('link'),
	read: integer('read', { mode: 'boolean' }).notNull().default(false),
	...timestamps
});

export const notificationRelations = relations(notification, ({ one }) => ({
	borrower: one(borrower, {
		fields: [notification.borrowerId],
		references: [borrower.ouid]
	})
}));
