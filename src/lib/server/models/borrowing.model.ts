/**
 * @see {@link file://./../../../../docs/borrowing-status.png}
 */

import { tables, type DrizzleClient } from '../db';
import { eq, sql } from 'drizzle-orm';
import type {
	BorrowingRequest,
	BorrowingStatus,
	ReturnStatus
} from '$lib/validator/borrowing.validator';
import { assetToBorrower } from '$lib/schema';

export async function requestToBorrow(db: DrizzleClient, request: BorrowingRequest) {
	const { amount, assetId, startDate, endDate, projectId, note, borrowerId } = request;
	// NOTE: temp fix idk why transaction didn't work -- PTSGRN
	// await db.transaction(async (tx) => {
	// 	await tx.insert(tables.assetToProject).values(request);

	// 	// updateAsset(tx, assetId, { amount: sql`${tables.asset.amount} - 1  })
	// 	await tx
	// 		.update(tables.asset)
	// 		.set({
	// 			amount: sql`${tables.asset.amount} - ${amount}`
	// 		})
	// 		.where(eq(tables.asset.id, assetId));
	// });

	// TODO: delete this record when it's returned???
	await db.insert(assetToBorrower).values(request);
	await db
		.update(tables.asset)
		.set({
			amount: sql`${tables.asset.amount} - ${amount}`
		})
		.where(eq(tables.asset.id, assetId));
	await db.insert(tables.assetToProject).values({
		amount,
		assetId,
		startDate,
		endDate,
		projectId,
		note,
		borrowerId,
		status: 'pending'
	});
}

/**
 * Factory to create a status-updating function that transitions from allowed 'from' statuses to 'to'.
 */
function updateStatusIf(from: BorrowingStatus[], to: BorrowingStatus) {
	return async (db: DrizzleClient, id: string) => {
		// return db.transaction(async db => {
		const borrowings = await db
			.select({ status: tables.assetToProject.status })
			.from(tables.assetToProject)
			.where(eq(tables.assetToProject.id, id));

		if (borrowings.length !== 1) {
			return 'not-found';
		}

		const { status } = borrowings[0];
		if (!from.includes(status)) {
			return 'invalid-state';
		}

		await db
			.update(tables.assetToProject)
			.set({ status: to })
			.where(eq(tables.assetToProject.id, id));

		return 'ok';
		// });
	};
}

// used by admin
export const approveRequest = updateStatusIf(['pending'], 'approved');

// used by admin
export const rejectRequest = updateStatusIf(['pending'], 'rejected');

// used by requester
export const cancelRequest = updateStatusIf(['pending', 'approved'], 'cancelled');

// used by admin
export async function returnBorrowing(db: DrizzleClient, id: string, status: ReturnStatus) {
	return updateStatusIf(['pending', 'approved'], status)(db, id);
}

export async function listBorrowedByUser(db: DrizzleClient, ouid: string) {
	const { asset: _, assetToProject } = tables;

	// const { createdAt, deletedAt, ...columns } = getTableColumns(asset);
	const items = await db.query.assetToProject.findMany({
		where: (_asset, { eq }) => eq(assetToProject.borrowerId, ouid),
		with: {
			asset: true,
			project: true
		}
	});
	return items;
}
