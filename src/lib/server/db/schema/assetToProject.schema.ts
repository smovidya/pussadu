import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { id, timestamps } from './helper';
import { asset } from './asset.schema';
import { project } from './project.schema';

export const assetToProject = sqliteTable("asset_to_project", {
  ...id,
  assetId: text("asset_id").notNull().references(() => asset.id),
  projectId: text("project_id").notNull().references(() => project.id),
  borrowerId: text("borrower_id").notNull().references(() => project.owner),
  amount: integer("amount").notNull().default(1),
  note: text("note"),
  status: text("status", {
    enum: ['pending', 'approved', 'rejected', 'inuse', 'returned', 'lost', 'damaged', 'cancelled']
  }),
  startDate: integer("start_date", {
    mode: 'timestamp'
  }).notNull(),
  endDate: integer("end_date", {
    mode: 'timestamp'
  }).notNull(),
  ...timestamps
})
