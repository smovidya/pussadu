import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { id } from './helper';
import { assetToProject } from './assetToProject.schema';

export const borrowingEvent = sqliteTable('borrowing_event', {
	...id,
	borrowingRequestId: text('borrowing_request_id')
		.notNull()
		.references(() => assetToProject.id),
	type: text('type', {
		enum: [
			'submitted',
			'edited',
			'approved',
			'rejected',
			'cancelled',
			'picked-up',
			'partial-return',
			'completed'
		]
	}).notNull(),
	actorOuid: text('actor_ouid').notNull(),
	detail: text('detail', { mode: 'json' }).$type<Record<string, unknown>>(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const borrowingEventRelations = relations(borrowingEvent, ({ one }) => ({
	borrowingRequest: one(assetToProject, {
		fields: [borrowingEvent.borrowingRequestId],
		references: [assetToProject.id]
	})
}));
