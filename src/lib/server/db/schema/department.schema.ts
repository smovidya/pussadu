import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { id, timestamps } from './helper';

export const department = sqliteTable('department', {
  ...id,
  name: text('name').notNull().unique(),
  shortName: text('short_name').notNull().unique(),
  ...timestamps
});
