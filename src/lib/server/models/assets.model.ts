import { and, eq, getTableColumns, isNotNull, isNull, sql } from 'drizzle-orm';
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

export async function listAssets(db: DrizzleClient, includeDeleted = false) {
	// const { createdAt, deletedAt, updatedAt, ...columns } = getTableColumns(assetTable);

	const assets = await db
		.select()
		.from(tables.asset)
		.where(includeDeleted ? undefined : isNull(tables.asset.deletedAt));

	return assets;
}
