import { and, eq, isNull } from 'drizzle-orm';
import { tables, type DrizzleClient } from '../db';
import {
	deleteFromTable,
	getOneFromTable,
	insertToTable,
	purgeDeletedFromTable,
	updateToTable
} from './helper';
import * as projectModel from '$lib/server/models/project.model';
import * as inventoryModel from './inventory.model';

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

	return inventoryModel.listAssetsWithAvailability(db, assets);
}

export async function listAssetsForProject(
	db: DrizzleClient,
	projectId: string,
	includeDeleted = false
) {
	const project = await projectModel.getProject(db, projectId);
	const assets = await db
		.select()
		.from(tables.asset)
		.where(
			and(
				!includeDeleted ? isNull(tables.asset.deletedAt) : undefined,
				project?.isPinned ? eq(tables.asset.type, 'key') : undefined
			)
		);
	return inventoryModel.listAssetsWithAvailability(db, assets);
}

export async function selectAssetWithAvailability(db: DrizzleClient, assetId: string) {
	const item = await selectAsset(db, assetId);
	if (!item) return undefined;
	const now = new Date();
	return { ...item, ...(await inventoryModel.getAvailability(db, assetId, now, now)) };
}

export async function removeAsset(db: DrizzleClient, assetId: string) {
	await db.delete(tables.asset).where(eq(tables.asset.id, assetId));
}
