import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamps, id } from './helper';
import { project } from './project.schema';
import { borrower } from './borrower.schema';

export const projectToBorrower = sqliteTable('project_to_borrower', {
  ...id,
  projectId: text('project_id').notNull().references(() => project.id),
  borrowerId: text('borrower_id').notNull().references(() => borrower.ouid),
  ...timestamps
});
