import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamps } from './helper';
import { department } from './department.schema';

export const borrower = sqliteTable('borrower', {
	ouid: text('ouid').primaryKey().notNull(),
	name: text('name').notNull().default(''),
	email: text('email').notNull().unique(),
	line_id: text('line_id').notNull(),
	phone: text('phone').notNull(),
	department: text('department').notNull().references(() => department.id),
	oldIsAdmin: integer('old_is_admin', { mode: 'boolean' }).default(false).notNull(),
	...timestamps
});
