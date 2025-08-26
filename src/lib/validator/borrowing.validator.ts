import { assetToProject } from '$lib/schema';
import { createInsertSchema } from 'drizzle-arktype';

export const BorrowingRequest = createInsertSchema(assetToProject, {
	startDate: (it) => it.or('string.date.iso.parse'),
	endDate: (it) => it.or('string.date.iso.parse')
}).omit('createdAt', 'updatedAt', 'deletedAt', 'status', 'id');

export type BorrowingRequest = (typeof BorrowingRequest)['infer'];

export const BorrowingStatus = createInsertSchema(assetToProject)
	.get('status')
	.exclude('null | undefined');
export type BorrowingStatus = (typeof BorrowingStatus)['infer'];

export const ReturnStatus = BorrowingStatus.extract('"lost" | "damaged" | "returned"');
export type ReturnStatus = (typeof ReturnStatus)['infer'];
