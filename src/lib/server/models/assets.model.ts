import { and, eq, getTableColumns, isNotNull, sql } from 'drizzle-orm';
import { tables, type DrizzleClient } from '../db';
import {
	deleteFromTable,
	getOneFromTable,
	insertToTable,
	purgeDeletedFromTable,
	updateToTable
} from './helper';
import { type } from 'arktype';

const assetTable = tables.asset;

export const insertNewAsset = insertToTable(assetTable);
export const updateAsset = updateToTable(assetTable, assetTable.id);
export const selectAsset = getOneFromTable(assetTable, assetTable.id);
export const deleteAsset = deleteFromTable(assetTable, assetTable.id);
export const purgeAsset = purgeDeletedFromTable(assetTable);

export const BorrowingRequest = type({
  projectId: "string",
  assetId: "string",
  amount: "number",
  ouid: "string",
  startDate: "string.date.iso.parse",
  endDate: "string.date.iso.parse",
  "note?": "string",
});

export type BorrowingRequest = typeof BorrowingRequest["infer"];

export async function requestToBorrow(db: DrizzleClient, request: BorrowingRequest) {
  const { amount, assetId, ouid, startDate, endDate, projectId, note } = request;
  await db.transaction(async tx => {
    await tx.insert(tables.assetToProject).values({
      assetId,
      borrowerId: ouid,
      startDate,
      endDate,
      amount,
      projectId,
      note,
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
  const { asset, assetToProject } = tables;

  // const { createdAt, deletedAt, ...columns } = getTableColumns(asset);
  const items = await db.select()
    .from(asset)
    .where(
      and(
        eq(asset.id, db.select()
          .from(assetToProject)
          .where(
            eq(assetToProject.borrowerId, ouid),
          )
        ),
        isNotNull(asset.deletedAt)
      ),
    );

	return items;
}

export async function listAssets(db: DrizzleClient, includedDeleted = false) {
  // const { createdAt, deletedAt, updatedAt, ...columns } = getTableColumns(assetTable);

  const assets = await db
    .select()
    .from(assetTable)
    .where(
      includedDeleted ? undefined : isNotNull(assetTable.deletedAt)
    );

  return assets;
}