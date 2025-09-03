import { assetToProject } from '$lib/schema';
import { type } from 'arktype';
import { createInsertSchema } from 'drizzle-arktype';

export const BorrowingRequest = createInsertSchema(assetToProject, {
	startDate: (it) => it.or('string.date.iso.parse'),
	endDate: (it) => it.or('string.date.iso.parse'),
	amount: (it) => it.or('number.integer>=1')
}).omit('createdAt', 'updatedAt', 'deletedAt', 'status', 'id');

export type BorrowingRequest = (typeof BorrowingRequest)['infer'];

export const BorrowingStatus = createInsertSchema(assetToProject)
	.get('status')
	.exclude('null | undefined');
export type BorrowingStatus = (typeof BorrowingStatus)['infer'];

export const ReturnStatus = BorrowingStatus.extract('"lost" | "damaged" | "returned"');
export type ReturnStatus = (typeof ReturnStatus)['infer'];

export const borrowingFilterSchema = type({
	searchTerm: 'string',
	statuses:
		'("lost" | "damaged" | "cancelled" | "pending" | "approved" | "rejected" | "inuse" | "returned")[]',
	'startDate?': 'Date | undefined',
	'endDate?': 'Date | undefined',
	'projectIds?': 'string[]',
	projectStatus: '("inprogress" | "ended")[]'
});

export const borrowingUpdateSchema = type({
	id: 'string',
	adminNote: 'string | null',
	amount: 'number',
	startDate: 'Date',
	endDate: 'Date',
	status:
		'"lost" | "damaged" | "cancelled" | "pending" | "approved" | "rejected" | "inuse" | "returned"',
	'+': 'delete'
});
