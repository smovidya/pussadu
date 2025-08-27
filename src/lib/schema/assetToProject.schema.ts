import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { id, timestamps } from './helper';
import { asset } from './asset.schema';
import { project } from './project.schema';
import { relations } from 'drizzle-orm';
import { borrower } from './borrower.schema';

export const assetToProject = sqliteTable('asset_to_project', {
	...id,
	assetId: text('asset_id')
		.notNull()
		.references(() => asset.id),
	projectId: text('project_id')
		.notNull()
		.references(() => project.id),
	borrowerId: text('borrower_id')
		.notNull()
		.references(() => borrower.ouid),
	amount: integer('amount').notNull().default(1),
	note: text('note'),
	status: text('status', {
		enum: ['pending', 'approved', 'rejected', 'inuse', 'returned', 'lost', 'damaged', 'cancelled']
	}).notNull(),
	startDate: integer('start_date', {
		mode: 'timestamp'
	}).notNull(),
	endDate: integer('end_date', {
		mode: 'timestamp'
	}).notNull(),
	...timestamps
});

export const assetToProjectRelations = relations(assetToProject, ({ one }) => ({
	asset: one(asset, {
		fields: [assetToProject.assetId],
		references: [asset.id]
	}),
	project: one(project, {
		fields: [assetToProject.projectId],
		references: [project.id]
	}),
	borrower: one(borrower, {
		fields: [assetToProject.borrowerId],
		references: [borrower.ouid]
	})
}));
