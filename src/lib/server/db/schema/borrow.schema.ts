import { sqliteTable } from 'drizzle-orm/sqlite-core';
import { id, timestamps } from './helper';

export const borrow = sqliteTable('borrow', {
	...id,
	...timestamps
});
