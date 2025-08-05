import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamps, id } from './helper';
import { relations } from 'drizzle-orm';
import { asset } from './asset.schema';

export const category = sqliteTable('category', {
	...id,
	name: text('name').notNull().unique(),
	description: text('description').notNull().default(''),
	icon: text('icon').notNull().default(''),
	color: text('color').notNull().default('#000000'),
	...timestamps
});

export const categoryRelations = relations(category, ({ many }) => ({
	assets: many(asset)
}));
