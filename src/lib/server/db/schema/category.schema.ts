import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamps, id } from './helper';

export const category = sqliteTable('category', {
  ...id,
  name: text('name').notNull().unique(),
  description: text('description').notNull().default(''),
  icon: text('icon').notNull().default(''),
  color: text('color').notNull().default('#000000'),
  ...timestamps
});
