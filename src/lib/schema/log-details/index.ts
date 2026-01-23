import type { asset } from '../asset.schema';
import type { project } from '../project.schema';
import type { BorrowingRequest, borrowingUpdateSchema } from '../../validator/borrowing.validator';
import type {
	assignBorrowerToProjectSchema,
	updateProjectSchema
} from '../../validator/project.validator';

export type LogAction =
	| 'create-asset'
	| 'update-asset'
	| 'remove-asset'
	| 'request-borrow'
	| 'add-to-stock'
	| 'remove-from-stock'
	| 'update-borrowing-request'
	| 'create-project'
	| 'assign-borrower-to-project'
	| 'unassign-borrower'
	| 'update-project'
	| 'remove-project';

export interface LogDetailBase {
	version?: number;
}

// Asset Actions
export interface LogDetailCreateAsset extends LogDetailBase {
	action: 'create-asset';
	detail: typeof asset.$inferSelect;
}

export interface LogDetailUpdateAsset extends LogDetailBase {
	action: 'update-asset';
	detail: Partial<typeof asset.$inferInsert>;
}

export interface LogDetailRemoveAsset extends LogDetailBase {
	action: 'remove-asset';
	detail: typeof asset.$inferSelect;
}

// Borrowing Actions
export interface LogDetailRequestBorrow extends LogDetailBase {
	action: 'request-borrow';
	detail: typeof BorrowingRequest.infer & { borrowerId: string };
}

export interface LogDetailAddToStock extends LogDetailBase {
	action: 'add-to-stock';
	detail: {
		request: any; // Ideally this should be more specific, but for now 'any' or a partial request type
		amountReturned: number;
	};
}

export interface LogDetailRemoveFromStock extends LogDetailBase {
	action: 'remove-from-stock';
	detail: {
		request: any;
		newAmount: number;
		difference: number;
	};
}

export interface LogDetailUpdateBorrowingRequest extends LogDetailBase {
	action: 'update-borrowing-request';
	detail: {
		from: any;
		to: typeof borrowingUpdateSchema.infer;
	};
}

// Project Actions
export interface LogDetailCreateProject extends LogDetailBase {
	action: 'create-project';
	detail: typeof project.$inferSelect;
}

export interface LogDetailAssignBorrowerToProject extends LogDetailBase {
	action: 'assign-borrower-to-project';
	detail: typeof assignBorrowerToProjectSchema.infer;
}

export interface LogDetailUnassignBorrower extends LogDetailBase {
	action: 'unassign-borrower';
	detail: {
		projectId: string;
		borrowerId: string;
	};
}

export interface LogDetailUpdateProject extends LogDetailBase {
	action: 'update-project';
	detail: typeof updateProjectSchema.infer;
}

export interface LogDetailRemoveProject extends LogDetailBase {
	action: 'remove-project';
	detail: {
		id: string;
	};
}

export type LogEntryInsert =
	| LogDetailCreateAsset
	| LogDetailUpdateAsset
	| LogDetailRemoveAsset
	| LogDetailRequestBorrow
	| LogDetailAddToStock
	| LogDetailRemoveFromStock
	| LogDetailUpdateBorrowingRequest
	| LogDetailCreateProject
	| LogDetailAssignBorrowerToProject
	| LogDetailUnassignBorrower
	| LogDetailUpdateProject
	| LogDetailRemoveProject;
