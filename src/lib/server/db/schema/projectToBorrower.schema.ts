import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { project } from './project.schema';
import { borrower } from './borrower.schema';
import { relations } from 'drizzle-orm';

export const projectToBorrower = sqliteTable(
	'project_to_borrower',
	{
		projectId: text('project_id')
			.notNull()
			.references(() => project.id),
		borrowerId: text('borrower_id')
			.notNull()
			.references(() => borrower.ouid)
	},
	(t) => [primaryKey({ columns: [t.projectId, t.borrowerId] })]
);

export const projectToBorrowerRelations = relations(projectToBorrower, ({ one }) => ({
	project: one(project, {
		fields: [projectToBorrower.projectId],
		references: [project.id]
	}),
	borrower: one(borrower, {
		fields: [projectToBorrower.borrowerId],
		references: [borrower.ouid]
	})
}));
