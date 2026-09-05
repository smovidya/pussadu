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

export const borrowingFilterSchema = type({
	searchTerm: 'string',
	statuses: '("cancelled" | "pending" | "approved" | "rejected" | "inuse" | "returned")[]',
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
	status: '"cancelled" | "pending" | "approved" | "rejected" | "inuse" | "returned"',
	'+': 'delete'
});

export const updateMyBorrowingSchema = type({
	id: 'string',
	projectId: 'string',
	amount: 'number.integer>=1',
	startDate: 'Date',
	endDate: 'Date',
	'note?': 'string | null'
});

export const cancelMyBorrowingSchema = type({
	id: 'string',
	'reason?': 'string'
});

export const borrowingActionSchema = type({
	id: 'string',
	'note?': 'string'
});

export const processBorrowingReturnSchema = type({
	id: 'string',
	returnedAmount: 'number.integer>=0',
	damagedAmount: 'number.integer>=0',
	lostAmount: 'number.integer>=0',
	'note?': 'string'
});
