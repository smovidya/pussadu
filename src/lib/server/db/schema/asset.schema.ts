import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamps, id } from './helper';
import { relations } from 'drizzle-orm';
import { category } from './category.schema';
import { assetToProject } from './assetToProject.schema';
import { assetToBorrower } from './assetToBorrower.schema';

export const asset = sqliteTable('asset', {
	...id,
	name: text('name').notNull(),
	description: text('description'),
	type: text('type', {
		enum: ['normal', 'durable', 'key']
	}).notNull(),
	status: text('status', {
		enum: ['available', 'borrowed', 'reserved', 'maintenance', 'lost', 'damaged']
	})
		.notNull()
		.default('available'),
	amount: integer('amount').notNull().default(1),
	unitTerm: text('unit_term').notNull().default('ชิ้น'),
	image_url: text('image_url'),
	category: text('category').notNull().default('ทั่วไป'),
	owner: text('owner', {
		enum: [
			'president',
			'vice1',
			'vice2',
			'secretary',
			'treasurer',
			'student_relation',
			'arts',
			'academic',
			'sport',
			'social_development',
			'korkor_club',
			'sciren_club',
			'vata_club',
			'education_club',
			'anurak_club',
			'asa_club',
			'etc'
		]
	})
		.notNull()
		.default('secretary'),
	categoryId: text('category_id').references(() => category.id),
	...timestamps
});

export const assetRelations = relations(asset, ({ many, one }) => ({
	borrowers: many(assetToBorrower),
	category: one(category, {
		fields: [asset.categoryId],
		references: [category.id]
	}),
	projects: many(assetToProject)
}));
