import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { id, timestamps } from './helper';
import { relations } from 'drizzle-orm';
import { projectToBorrower } from './projectToBorrower.schema';
import { assetToProject } from './assetToProject.schema';

export const project = sqliteTable('project', {
	...id,
	title: text('title').notNull().default('title'),
	status: text('status', {
		enum: ['notstarted', 'inprogress', 'completed', 'evaluated', 'cancelled']
	})
		.notNull()
		.default('notstarted'),
	owner: text('owner').notNull().default('etc'),
	isPinned: integer('is_pinned', { mode: 'boolean' }).default(false),
	...timestamps
});

export const projectRelations = relations(project, ({ many }) => ({
	assets: many(assetToProject),
	staffs: many(projectToBorrower)
}));
