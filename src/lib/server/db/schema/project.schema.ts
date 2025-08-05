import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { id, timestamps } from './helper';

export const project = sqliteTable('project', {
	...id,
	title: text('title').notNull().default('title'),
	status: text('status', {
		enum: ['notstarted', 'inprogress', 'completed', 'evaluated', 'cancelled']
	})
		.notNull()
		.default('notstarted'),
	owner: text('owner').notNull().default('etc'),
	isPublished: integer('is_published', { mode: 'boolean' }).default(true),
	...timestamps
});
