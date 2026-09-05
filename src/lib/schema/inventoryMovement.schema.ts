import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { id } from './helper';
import { asset } from './asset.schema';
import { assetToProject } from './assetToProject.schema';

export const inventoryMovement = sqliteTable('inventory_movement', {
	...id,
	assetId: text('asset_id')
		.notNull()
		.references(() => asset.id),
	borrowingRequestId: text('borrowing_request_id').references(() => assetToProject.id),
	type: text('type', {
		enum: [
			'stock-added',
			'stock-removed',
			'reserved',
			'released',
			'checked-out',
			'returned-usable',
			'maintenance-started',
			'maintenance-completed',
			'damaged',
			'lost',
			'retired'
		]
	}).notNull(),
	amount: integer('amount').notNull(),
	reason: text('reason'),
	actorOuid: text('actor_ouid').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const inventoryMovementRelations = relations(inventoryMovement, ({ one }) => ({
	asset: one(asset, {
		fields: [inventoryMovement.assetId],
		references: [asset.id]
	}),
	borrowingRequest: one(assetToProject, {
		fields: [inventoryMovement.borrowingRequestId],
		references: [assetToProject.id]
	})
}));
