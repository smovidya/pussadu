import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { id, timestamps } from './helper';

export const log = sqliteTable('log', {
	...id,
	action: text('action').notNull(),
	actor: text('actor').notNull(),
	target: text('target').notNull(),
	comment: text('comment'),
	...timestamps
});
