import { command, query } from '$app/server';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import * as assetsModel from '$lib/server/models/assets.model';
import { insertNewLog } from '$lib/server/models/audit.model';
import * as assetsValidator from '$lib/validator/asset.validator';
import { error } from '@sveltejs/kit';
import { type } from 'arktype';

export const listAssets = query(
	type({
		'projectId?': 'string'
	}),
	async (data) => {
		Guard.loggedIn();

		if (!data.projectId) return assetsModel.listAssets(Locals.db);
		return assetsModel.listAssetsForProject(Locals.db, data.projectId);
	}
);

export const getAssetInfo = query(
	type({
		assetId: 'string'
	}),
	async (data) => {
		Guard.loggedIn();

		const asset = assetsModel.selectAsset(Locals.db, data.assetId);

		return asset;
	}
);

export const createAsset = command(assetsValidator.insertAssetSchema, async (data) => {
	const { ouid } = Guard.admin();

	const asset = await assetsModel.insertNewAsset(Locals.db, data);
	await insertNewLog(Locals.db, {
		action: 'create-asset',
		actor: ouid,
		target: asset.id,
		comment: `Created asset ${asset.name} (${asset.id})`
	});
	return asset;
});

export const updateAsset = command(assetsValidator.updateAssetSchema, async (data) => {
	const { ouid } = Guard.admin();

	if (!data.id) error(400, 'Missing asset ID');

	const asset = await assetsModel.updateAsset(Locals.db, data.id, data);
	await insertNewLog(Locals.db, {
		action: 'update-asset',
		actor: ouid,
		target: asset.id,
		comment: `Updated asset ${asset.name} (${asset.id})`
	});
	return asset;
});
