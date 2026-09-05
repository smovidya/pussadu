import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamps } from './helper';
import { department } from './department.schema';
import { relations } from 'drizzle-orm';
import { projectToBorrower } from './projectToBorrower.schema';
import { assetToBorrower } from './assetToBorrower.schema';
import { assetToProject } from './assetToProject.schema';
import { user } from './auth.schema';

export const borrower = sqliteTable('borrower', {
	ouid: text('ouid').primaryKey().notNull(),
	name: text('name').notNull().default(''),
	email: text('email').notNull().unique(),
	line_id: text('line_id').notNull(),
	phone: text('phone').notNull(),
	departmentId: text('department_id')
		.notNull()
		.references(() => department.id),
	oldIsAdmin: integer('old_is_admin', { mode: 'boolean' }).default(false).notNull(),
	emailNotificationsEnabled: integer('email_notifications_enabled', { mode: 'boolean' })
		.default(true)
		.notNull(),
	userId: text('user_id')
		.unique()
		.references(() => user.id, { onDelete: 'set null' }),
	borrowingEligibility: text('borrowing_eligibility', {
		enum: ['eligible', 'suspended']
	})
		.notNull()
		.default('eligible'),
	eligibilityReason: text('eligibility_reason'),
	eligibilityUpdatedAt: integer('eligibility_updated_at', { mode: 'timestamp' }),
	eligibilityUpdatedBy: text('eligibility_updated_by'),
	...timestamps
});

export const borrowerRelations = relations(borrower, ({ many, one }) => ({
	assetsForProject: many(assetToProject),
	borrowedAssets: many(assetToBorrower),
	projects: many(projectToBorrower),
	department: one(department, {
		fields: [borrower.departmentId],
		references: [department.id]
	}),
	user: one(user, {
		fields: [borrower.userId],
		references: [user.id]
	})
}));
