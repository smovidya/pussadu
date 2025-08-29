import { command, query } from '$app/server';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import * as borrowingModel from '$lib/server/models/borrowing.model';
import * as assetModel from '$lib/server/models/assets.model';
import * as projectModel from '$lib/server/models/project.model';
import { BorrowingRequest } from '$lib/validator/borrowing.validator';
import { error } from '@sveltejs/kit';

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
});

export const listBorrowed = query(async () => {
	const { ouid } = Guard.loggedIn();
	return await borrowingModel.listBorrowedByUser(Locals.db, ouid);
});

// export const approveRequest = command(type({ id: 'string' }), async ({ id }) => {
// 	const { ouid } = Guard.admin();
// });

// export const rejectRequest = command(type({ id: 'string' }), async ({ id }) => {
// 	const { ouid } = Guard.admin();
// });

// export const cancelRequest = command(type({ id: 'string' }), async ({ id }) => {
// 	const { ouid } = Guard.loggedIn();
// });

// export const returnBorrowing = command(
// 	type({ id: 'string', status: ReturnStatus }),
// 	async ({ id, status }) => {
// 		const { ouid } = Guard.admin();
// 	}
// );
