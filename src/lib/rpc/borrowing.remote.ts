import { command, query } from '$app/server';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import * as borrowingModel from '$lib/server/models/borrowing.model';
import * as borrowingValidators from '$lib/validator/borrowing.validator';
import * as assetModel from '$lib/server/models/assets.model';
import * as projectModel from '$lib/server/models/project.model';
import { BorrowingRequest } from '$lib/validator/borrowing.validator';
import { error } from '@sveltejs/kit';
import { insertNewLog } from '$lib/server/models/audit.model';

export const requestToBorrow = command(BorrowingRequest.omit('borrowerId'), async (data) => {
	const { ouid } = Guard.loggedIn();

	const asset = await assetModel.selectAsset(Locals.db, data.assetId);

	if (!asset)
		error(404, {
			message: 'ไม่พบรายการนี้'
		});

	if (data.amount > asset?.amount) {
		error(400, {
			message: `จำนวนที่ยืมมากกว่าจำนวนที่มีอยู่ (${asset?.amount})`
		});
	}

	const project = await projectModel.getProject(Locals.db, data.projectId);

	if (!project) {
		error(404, {
			message: 'ไม่พบโครงการนี้'
		});
	}

	if (project.isPinned && asset.type !== 'key') {
		error(400, {
			message: 'โครงการที่ยืมได้ทุกคนมีเพียงกุญแจเท่านั้นที่ยืมได้'
		});
	}

	await borrowingModel.requestToBorrow(Locals.db, {
		...data,
		borrowerId: ouid
	});

	await insertNewLog(Locals.db, {
		action: 'request-borrow',
		actor: ouid,
		target: asset.id,
		comment: `Requested to borrow ${asset.name} (${asset.id})`
	});
});

export const listBorrowed = query(async () => {
	const { ouid } = Guard.loggedIn();
	return await borrowingModel.listBorrowedByUser(Locals.db, ouid);
});

export const listBorrowingRequests = query(
	borrowingValidators.borrowingFilterSchema,
	async (data) => {
		Guard.admin();
		const requests = await borrowingModel.listBorrowingRequests(Locals.db, data);
		return requests;
	}
);

export const updateBorrowingRequest = command(
	borrowingValidators.borrowingUpdateSchema,
	async (data) => {
		const { ouid } = Guard.admin();
		const request = await borrowingModel.getBorrowingRequest(Locals.db, data.id);
		if (!request) {
			error(404, {
				message: 'ไม่พบคำขอนี้'
			});
		}

		const asset = await assetModel.selectAsset(Locals.db, request.assetId);

		if (!asset) {
			error(404, 'ไม่พบพัสดุนี้');
		}

		if (request.status === data.status) {
			error(400, 'มีการดำเนินการนี้ไปแล้ว โปรดรีเฟรชหน้า');
		}

		console.log({ request, data });

		if (
			(request.status === 'approved' ||
				request.status === 'inuse' ||
				request.status === 'pending') &&
			(data.status === 'returned' ||
				data.status === 'damaged' ||
				data.status === 'lost' ||
				data.status === 'cancelled' ||
				data.status === 'rejected')
		) {
			// คืนของเข้าสต็อก
			await assetModel.updateAsset(Locals.db, asset.id, {
				amount: asset.amount + request.amount
			});
			await insertNewLog(Locals.db, {
				action: 'add-to-stock',
				actor: ouid,
				target: request.assetId,
				comment: `Returned ${request.amount} of ${request.assetId} to stock`
			});
		}

		if (
			(request.status === 'returned' ||
				request.status === 'damaged' ||
				request.status === 'lost' ||
				request.status === 'cancelled' ||
				request.status === 'rejected') &&
			(data.status === 'approved' || data.status === 'inuse' || data.status === 'pending')
		) {
			console.log('get from stock');
			if (asset.amount + request.amount < data.amount) {
				error(400, {
					message: `จำนวนที่ยืมมากกว่าจำนวนที่มีอยู่ (มี ${asset.amount + request.amount} แต่ขอ ${data.amount} ${asset.unitTerm})`
				});
			}
			await assetModel.updateAsset(Locals.db, request.assetId, {
				amount: asset.amount - (request.amount - data.amount)
			});
			await insertNewLog(Locals.db, {
				action: 'remove-from-stock',
				actor: ouid,
				target: request.assetId,
				comment: `Removed ${data.amount} of ${request.assetId} from stock`
			});
		}
		await borrowingModel.updateBorrowingRequest(Locals.db, data.id, data);
		await insertNewLog(Locals.db, {
			action: 'update-borrowing-request',
			actor: ouid,
			target: request.id,
			comment: `Updated borrowing request ${request.id} from ${JSON.stringify(request)} to ${JSON.stringify(data)}`
		});
	}
);
