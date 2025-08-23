import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { asset } from './asset.schema';
import { project } from './project.schema';
import { relations } from 'drizzle-orm';
import { borrower } from './borrower.schema';

export const assetToBorrower = sqliteTable('asset_to_borrower', {
	assetId: text('asset_id')
		.references(() => asset.id)
		.notNull(),
	borrowerId: text('borrower_id')
		.references(() => borrower.ouid)
		.notNull(),
	projectId: text('project_id')
		.references(() => project.id)
		.notNull()
});

export const assetToBorrowerRelations = relations(assetToBorrower, ({ one }) => ({
	asset: one(asset, {
		fields: [assetToBorrower.assetId],
		references: [asset.id]
	}),
	borrower: one(borrower, {
		fields: [assetToBorrower.borrowerId],
		references: [borrower.ouid]
	}),
	project: one(project, {
		fields: [assetToBorrower.projectId],
		references: [project.id]
	})
}));
