/**
 * @see {@link file://./../../../../docs/borrowing-status.png}
 */

import { type } from 'arktype';
import { tables, type DrizzleClient } from '../db';
import { and, eq, isNotNull, sql } from 'drizzle-orm';
import type { BorrowingRequest, ReturnStatus } from '$lib/validator/borrowing.validator';

export async function requestToBorrow(db: DrizzleClient, request: BorrowingRequest) {
	const { amount, assetId, startDate, endDate, projectId, note, borrowerId } = request;
	await db.transaction(async (tx) => {
		await tx.insert(tables.assetToProject).values(request);

		// updateAsset(tx, assetId, { amount: sql`${tables.asset.amount} - 1  })
		await tx
			.update(tables.asset)
			.set({
				amount: sql`${tables.asset.amount} - 1`
			})
			.where(eq(tables.asset.id, assetId));
	});
}

export async function approveRequest(db: DrizzleClient, id: string) {}

// used by admin
export async function rejectRequest(db: DrizzleClient, id: string, reason?: string) {}

// used by requester
export async function cancelRequest(db: DrizzleClient, id: string) {}

// used by admin
export async function returnBorrowing(db: DrizzleClient, id: string, status: ReturnStatus) {}

export async function listBorrowedByUser(db: DrizzleClient, ouid: string) {
	const { asset, assetToProject } = tables;

	// const { createdAt, deletedAt, ...columns } = getTableColumns(asset);
	const items = await db
		.select()
		.from(asset)
		.where(
			and(
				eq(asset.id, db.select().from(assetToProject).where(eq(assetToProject.borrowerId, ouid))),
				isNotNull(asset.deletedAt)
			)
		);

	return items;
}
