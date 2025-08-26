import { and, eq, isNotNull, sql } from 'drizzle-orm';
import { tables, type DrizzleClient } from '../db';
import {
	deleteFromTable,
	getOneFromTable,
	insertToTable,
	purgeDeletedFromTable,
	updateToTable
} from './helper';

const assetTable = tables.asset;

export const insertNewAsset = insertToTable(assetTable);
export const updateAsset = updateToTable(assetTable, assetTable.id);
export const selectAsset = getOneFromTable(assetTable, assetTable.id);
export const deleteAsset = deleteFromTable(assetTable, assetTable.id);
export const purgeAsset = purgeDeletedFromTable(assetTable);

export interface BorrowingRequest {
	projectId: string;
	assetId: string;
	amount: number;
	ouid: string;
	startDate: Date;
	endDate: Date;
	note?: string;
}

export async function requestToBorrow(db: DrizzleClient, request: BorrowingRequest) {
	const { amount, assetId, ouid, startDate, endDate, projectId, note } = request;
	await db.transaction(async (tx) => {
		await tx.insert(tables.assetToProject).values({
			assetId,
			borrowerId: ouid,
			startDate,
			endDate,
			amount,
			projectId,
			note
		});

		// updateAsset(tx, assetId, { amount: sql`${tables.asset.amount} - 1  })
		await tx
			.update(tables.asset)
			.set({
				amount: sql`${tables.asset.amount} - 1`
			})
			.where(eq(tables.asset.id, assetId));
	});
}

export async function listBorrowedByUser(db: DrizzleClient, ouid: string) {
	const { assetToBorrower, asset } = tables;
	// const { createdAt, deletedAt, ...columns } = asset;
	const items = await db
		.select()
		.from(asset)
		.where(
			and(
				eq(asset.id, db.select().from(assetToBorrower).where(eq(assetToBorrower.borrowerId, ouid))),
				isNotNull(asset.deletedAt)
			)
		);

	return items;
}

export async function listAccessibleByUser(db: DrizzleClient, ouid: string) {}
