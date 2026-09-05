import { command, query } from '$app/server';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import * as assetsModel from '$lib/server/models/assets.model';
import { insertNewLog } from '$lib/server/models/audit.model';
import * as assetsValidator from '$lib/validator/asset.validator';
import { error } from '@sveltejs/kit';
import { type } from 'arktype';
import * as inventoryModel from '$lib/server/models/inventory.model';

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

		const asset = assetsModel.selectAssetWithAvailability(Locals.db, data.assetId);

		return asset;
	}
);

export const createAsset = command(assetsValidator.insertAssetSchema, async (data) => {
	const { ouid } = Guard.admin();

	const asset = await assetsModel.insertNewAsset(Locals.db, {
		...data,
		totalAmount: data.totalAmount ?? data.amount
	});
	await insertNewLog(Locals.db, {
		action: 'create-asset',
		actor: ouid,
		target: asset.id,
		detail: asset,
		comment: `สร้างพัสดุใหม่ ${asset.name} (${asset.id})`
	});
	return asset;
});

export const updateAsset = command(assetsValidator.updateAssetSchema, async (data) => {
	const { ouid } = Guard.admin();

	if (!data.id) error(400, 'Missing asset ID');
	const {
		totalAmount: _totalAmount,
		maintenanceAmount: _maintenanceAmount,
		damagedAmount: _damagedAmount,
		lostAmount: _lostAmount,
		catalogState: _catalogState,
		needsInventoryReview: _needsInventoryReview,
		amount: _legacyAmount,
		status: _legacyStatus,
		...metadata
	} = data;

	const asset = await assetsModel.updateAsset(Locals.db, data.id, metadata);
	await insertNewLog(Locals.db, {
		action: 'update-asset',
		actor: ouid,
		target: asset.id,
		detail: data,
		comment: `อัปเดตพัสดุ ${asset.name} (${asset.id})`
	});
	return asset;
});

export const getAssetAvailability = query(
	type({ assetId: 'string', startDate: 'Date', endDate: 'Date' }),
	async (data) => {
		Guard.loggedIn();
		if (data.startDate > data.endDate) error(400, 'วันคืนต้องไม่มาก่อนวันยืม');
		const availability = await inventoryModel.getAvailability(
			Locals.db,
			data.assetId,
			data.startDate,
			data.endDate
		);
		if (!availability) error(404, 'ไม่พบพัสดุนี้');
		return availability;
	}
);

const inventoryAdjustmentSchema = type({
	assetId: 'string',
	operation:
		'"add-stock" | "remove-stock" | "start-maintenance" | "complete-maintenance" | "record-damage" | "recover-damage" | "record-lost" | "recover-lost"',
	amount: 'number.integer>=1',
	reason: 'string>=1'
});

export const adjustInventory = command(inventoryAdjustmentSchema, async (data) => {
	const { ouid } = Guard.admin();
	const asset = await assetsModel.selectAsset(Locals.db, data.assetId);
	if (!asset) error(404, 'ไม่พบพัสดุนี้');
	const next = {
		totalAmount: asset.totalAmount,
		maintenanceAmount: asset.maintenanceAmount,
		damagedAmount: asset.damagedAmount,
		lostAmount: asset.lostAmount
	};
	if (data.operation === 'add-stock') next.totalAmount += data.amount;
	if (data.operation === 'remove-stock') next.totalAmount -= data.amount;
	if (data.operation === 'start-maintenance') next.maintenanceAmount += data.amount;
	if (data.operation === 'complete-maintenance') next.maintenanceAmount -= data.amount;
	if (data.operation === 'record-damage') next.damagedAmount += data.amount;
	if (data.operation === 'recover-damage') next.damagedAmount -= data.amount;
	if (data.operation === 'record-lost') next.lostAmount += data.amount;
	if (data.operation === 'recover-lost') next.lostAmount -= data.amount;
	if (Object.values(next).some((amount) => amount < 0)) {
		error(400, 'จำนวนคงคลังไม่ถูกต้อง');
	}
	const usable = next.totalAmount - next.maintenanceAmount - next.damagedAmount - next.lostAmount;
	const committed = await inventoryModel.getMaximumCommittedAmount(Locals.db, asset.id);
	if (usable < committed) {
		error(409, {
			message: `ปรับไม่ได้ มีพัสดุผูกกับคำขออยู่ ${committed} ${asset.unitTerm}`
		});
	}
	try {
		await assetsModel.updateAsset(Locals.db, asset.id, next);
	} catch (err) {
		if (err instanceof Error && err.message.includes('invalid-inventory-amounts')) {
			error(400, 'จำนวนคงคลังไม่ถูกต้อง');
		}
		throw err;
	}
	await inventoryModel.insertMovement(Locals.db, {
		assetId: asset.id,
		type:
			data.operation === 'add-stock'
				? 'stock-added'
				: data.operation === 'remove-stock'
					? 'stock-removed'
					: data.operation === 'start-maintenance'
						? 'maintenance-started'
						: data.operation === 'complete-maintenance'
							? 'maintenance-completed'
							: data.operation === 'record-damage'
								? 'damaged'
								: data.operation === 'record-lost'
									? 'lost'
									: 'returned-usable',
		amount: data.amount,
		reason: data.reason,
		actorOuid: ouid
	});
	await insertNewLog(Locals.db, {
		action: 'adjust-inventory',
		actor: ouid,
		target: asset.id,
		detail: data,
		comment: `ปรับคลัง ${asset.name}: ${data.operation} ${data.amount} ${asset.unitTerm}`
	});
	return { ...asset, ...next };
});

export const setAssetCatalogState = command(
	type({ assetId: 'string', state: '"active" | "paused" | "retired"', reason: 'string>=1' }),
	async (data) => {
		const { ouid } = Guard.admin();
		const asset = await assetsModel.selectAsset(Locals.db, data.assetId);
		if (!asset) error(404, 'ไม่พบพัสดุนี้');
		if (data.state === 'retired') {
			const committed = await inventoryModel.getMaximumCommittedAmount(Locals.db, asset.id);
			if (committed) error(409, { message: 'เลิกใช้งานไม่ได้ขณะมีคำขอที่ยังไม่สิ้นสุด' });
		}
		await assetsModel.updateAsset(Locals.db, asset.id, { catalogState: data.state });
		await insertNewLog(Locals.db, {
			action: 'set-asset-catalog-state',
			actor: ouid,
			target: asset.id,
			detail: data,
			comment: `เปลี่ยนสถานะคลัง ${asset.name} เป็น ${data.state}`
		});
		return { ...asset, catalogState: data.state };
	}
);

export const confirmInventory = command(
	type({
		assetId: 'string',
		totalAmount: 'number.integer>=0',
		maintenanceAmount: 'number.integer>=0',
		damagedAmount: 'number.integer>=0',
		lostAmount: 'number.integer>=0',
		reason: 'string>=1'
	}),
	async (data) => {
		const { ouid } = Guard.admin();
		const asset = await assetsModel.selectAsset(Locals.db, data.assetId);
		if (!asset) error(404, 'ไม่พบพัสดุนี้');
		const usable = data.totalAmount - data.maintenanceAmount - data.damagedAmount - data.lostAmount;
		if (usable < 0) error(400, 'จำนวนแยกตามสภาพมากกว่าจำนวนทั้งหมด');
		const committed = await inventoryModel.getMaximumCommittedAmount(Locals.db, asset.id);
		if (usable < committed) error(409, { message: `ต้องมีพัสดุพร้อมใช้ไม่น้อยกว่า ${committed}` });
		await assetsModel.updateAsset(Locals.db, asset.id, {
			totalAmount: data.totalAmount,
			maintenanceAmount: data.maintenanceAmount,
			damagedAmount: data.damagedAmount,
			lostAmount: data.lostAmount,
			needsInventoryReview: false
		});
		await insertNewLog(Locals.db, {
			action: 'confirm-inventory',
			actor: ouid,
			target: asset.id,
			detail: data,
			comment: `ยืนยันยอดคลัง ${asset.name}`
		});
		return { ok: true };
	}
);

export const removeAsset = command(type({ assetId: 'string' }), async (data) => {
	const { ouid } = Guard.admin();

	if (!data.assetId) error(400, 'Missing asset ID');

	const asset = await assetsModel.selectAsset(Locals.db, data.assetId);

	if (!asset) error(404, 'Asset not found');

	await assetsModel.removeAsset(Locals.db, data.assetId);
	await insertNewLog(Locals.db, {
		action: 'remove-asset',
		actor: ouid,
		target: asset.id,
		detail: asset,
		comment: `ลบพัสดุ ${asset.name} (${asset.id})`
	});
	return asset;
});
