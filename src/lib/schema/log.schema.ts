import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { id, timestamps } from './helper';

export const log = sqliteTable('log', {
	...id,
	action: text('action').notNull(),
	actor: text('actor').notNull(),
	target: text('target').notNull(),
	version: integer('version').default(1),
	detail: text('detail', { mode: 'json' }).$type<Record<string, unknown>>(),
	comment: text('comment'),
	...timestamps
});
