import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { id, timestamps } from './helper';
import { relations } from 'drizzle-orm';
import { borrower } from './borrower.schema';

export const department = sqliteTable('department', {
	...id,
	name: text('name').notNull().unique(),
	shortName: text('short_name').notNull().unique(),
	...timestamps
});

export const departmentRelations = relations(department, ({ many }) => ({
	members: many(borrower)
}));
