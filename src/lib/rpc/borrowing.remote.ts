import { command, query } from '$app/server';
import { error } from '@sveltejs/kit';
import { type } from 'arktype';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals, Platform } from '$lib/server/helpers/facades/request-event';
import * as borrowingModel from '$lib/server/models/borrowing.model';
import * as borrowingValidators from '$lib/validator/borrowing.validator';
import * as assetModel from '$lib/server/models/assets.model';
import * as inventoryModel from '$lib/server/models/inventory.model';
import * as projectModel from '$lib/server/models/project.model';
import { selectBorrower } from '$lib/server/models/borrower.model';
import { insertBorrowingEvent } from '$lib/server/models/borrowing-event.model';
import { insertNewLog } from '$lib/server/models/audit.model';
import { insertNotification } from '$lib/server/models/notification.model';
import { sendNotificationEmail, emailBadge, emailButton } from '$lib/server/helpers/email';
import { tables } from '$lib/server/db';

const STATUS_LABEL: Record<string, string> = {
	pending: 'รอการอนุมัติ',
	approved: 'อนุมัติแล้ว',
	rejected: 'ถูกปฏิเสธ',
	inuse: 'กำลังใช้งาน',
	returned: 'ส่งคืนแล้ว',
	cancelled: 'ถูกยกเลิก'
};

const STATUS_TONE: Record<string, 'info' | 'success' | 'warn' | 'danger'> = {
	pending: 'warn',
	approved: 'success',
	rejected: 'danger',
	inuse: 'info',
	returned: 'success',
	cancelled: 'danger'
};

async function requireBorrowingAccess(ouid: string, projectId: string) {
	const borrower = await selectBorrower(Locals.db, ouid);
	if (!borrower) error(403, { message: 'ยังไม่มีข้อมูลผู้ยืม โปรดติดต่อผู้ดูแลระบบ' });
	if (borrower.borrowingEligibility !== 'eligible') {
		error(403, {
			message: borrower.eligibilityReason || 'สิทธิ์การยืมถูกระงับ โปรดติดต่อผู้ดูแลระบบ'
		});
	}

	const project = await projectModel.getProject(Locals.db, projectId);
	if (!project) error(404, { message: 'ไม่พบโครงการนี้' });
	if (!['notstarted', 'inprogress'].includes(project.status)) {
		error(400, { message: 'โครงการนี้ไม่เปิดให้ยืมพัสดุแล้ว' });
	}
	const membership = await projectModel.getProjectMembership(Locals.db, projectId, ouid);
	if (!membership) error(403, { message: 'เฉพาะสมาชิกโครงการเท่านั้นที่ส่งคำขอยืมได้' });
	return { borrower, project };
}

async function notifyBorrower(
	request: typeof tables.assetToProject.$inferSelect,
	asset: typeof tables.asset.$inferSelect,
	status: typeof tables.assetToProject.$inferSelect.status
) {
	const statusLabel = STATUS_LABEL[status] ?? status;
	const detailPath = `/my-borrowing/${request.id}`;
	await insertNotification(Locals.db, {
		borrowerId: request.borrowerId,
		title: `คำขอยืม "${asset.name}" อัปเดตสถานะ`,
		message: `สถานะเปลี่ยนเป็น "${statusLabel}"`,
		link: detailPath
	});

	const borrower = await selectBorrower(Locals.db, request.borrowerId);
	if (!borrower?.email || !borrower.emailNotificationsEnabled) return;
	const project = await projectModel.getProject(Locals.db, request.projectId);
	const detailUrl = `${Platform.env.PUBLIC_BETTER_AUTH_URL}${detailPath}`;
	await sendNotificationEmail(Platform.env.EMAIL, {
		to: borrower.email,
		subject: `คำขอยืม "${asset.name}" อัปเดตสถานะเป็น "${statusLabel}"`,
		html: `
			<p style="margin:0 0 16px;">สวัสดีคุณ ${borrower.name}</p>
			<p style="margin:0 0 8px;">คำขอยืมของคุณมีการอัปเดตสถานะ</p>
			<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e4e4e7;border-radius:8px;margin:12px 0;">
				<tr><td style="padding:16px;">
					<div style="font-size:15px;font-weight:600;color:#18181b;">${asset.name}</div>
					<div style="font-size:13px;color:#71717a;margin-top:2px;">โครงการ: ${project?.title ?? '-'}</div>
					<div style="margin-top:10px;">${emailBadge(statusLabel, STATUS_TONE[status] ?? 'info')}</div>
				</td></tr>
			</table>
			${emailButton(detailUrl, 'ดูรายละเอียดคำขอยืม')}
		`,
		text: `สวัสดีคุณ ${borrower.name}\n\nคำขอยืม "${asset.name}" (โครงการ ${project?.title ?? '-'}) เปลี่ยนสถานะเป็น "${statusLabel}"\n\nดูรายละเอียด: ${detailUrl}`
	});
}

function capacityError(err: unknown): never {
	if (err instanceof Error && err.message.includes('insufficient-availability')) {
		error(409, { message: 'จำนวนพัสดุไม่เพียงพอในช่วงวันที่เลือก โปรดเลือกจำนวนหรือวันใหม่' });
	}
	throw err;
}

export const requestToBorrow = command(
	borrowingValidators.BorrowingRequest.omit('borrowerId'),
	async (data) => {
		const { ouid } = Guard.loggedIn();
		if (data.startDate > data.endDate) error(400, { message: 'วันคืนต้องไม่มาก่อนวันยืม' });
		const { project } = await requireBorrowingAccess(ouid, data.projectId);
		const asset = await assetModel.selectAsset(Locals.db, data.assetId);
		if (!asset) error(404, { message: 'ไม่พบพัสดุนี้' });
		if (project.isPinned && asset.type !== 'key') {
			error(400, { message: 'โครงการประเภทนี้ยืมได้เฉพาะกุญแจ' });
		}
		if (asset.catalogState !== 'active' || asset.needsInventoryReview) {
			error(400, { message: 'พัสดุนี้งดให้ยืมชั่วคราว' });
		}
		const availability = await inventoryModel.getAvailability(
			Locals.db,
			data.assetId,
			data.startDate,
			data.endDate
		);
		if (!availability || data.amount > availability.availableAmount) {
			error(409, { message: 'จำนวนพัสดุไม่เพียงพอในช่วงวันที่เลือก โปรดเลือกจำนวนหรือวันใหม่' });
		}

		try {
			const request = await borrowingModel.requestToBorrow(Locals.db, {
				...data,
				borrowerId: ouid
			});
			try {
				await insertNewLog(Locals.db, {
					action: 'request-borrow',
					actor: ouid,
					target: request.id,
					detail: request,
					comment: `บันทึกขอยืม ${asset.name} (${asset.id})`
				});
			} catch (auditError) {
				console.error('Borrowing request audit failed', auditError);
			}
			return request;
		} catch (err) {
			capacityError(err);
		}
	}
);

export const listBorrowed = query(async () => {
	const { ouid } = Guard.loggedIn();
	return borrowingModel.listBorrowedByUser(Locals.db, ouid);
});

export const listBorrowingRequests = query(
	borrowingValidators.borrowingFilterSchema,
	async (data) => {
		await Guard.allows({ permission: { borrowing: ['manage'] } });
		return borrowingModel.listBorrowingRequests(Locals.db, data);
	}
);

export const listProjectBorrowingRequests = query(
	type({ projectId: 'string' }),
	async ({ projectId }) => {
		const user = Guard.loggedIn();
		const isAdmin = (user as typeof user & { role?: string }).role?.split(',').includes('admin');
		if (!isAdmin) {
			const membership = await projectModel.getProjectMembership(Locals.db, projectId, user.ouid);
			if (membership?.role !== 'coordinator') {
				error(403, { message: 'เฉพาะผู้ประสานงานโครงการหรือผู้ดูแลระบบเท่านั้น' });
			}
		}
		return borrowingModel.listBorrowingRequests(Locals.db, {
			searchTerm: '',
			statuses: ['pending', 'approved', 'rejected', 'inuse', 'returned', 'cancelled'],
			projectIds: [projectId],
			projectStatus: []
		});
	}
);

async function requireRequest(id: string) {
	const request = await borrowingModel.getBorrowingRequest(Locals.db, id);
	if (!request) error(404, { message: 'ไม่พบคำขอนี้' });
	const asset = await assetModel.selectAsset(Locals.db, request.assetId);
	if (!asset) error(404, { message: 'ไม่พบพัสดุนี้' });
	return { request, asset };
}

async function adminTransition(
	id: string,
	from: (typeof tables.assetToProject.$inferSelect.status)[],
	to: typeof tables.assetToProject.$inferSelect.status,
	eventType: typeof tables.borrowingEvent.$inferInsert.type,
	note?: string
) {
	const { ouid } = Guard.loggedIn();
	await Guard.allows({ permission: { borrowing: ['manage'] } });
	const { request, asset } = await requireRequest(id);
	if (!from.includes(request.status)) {
		error(409, { message: 'สถานะคำขอเปลี่ยนไปแล้ว โปรดรีเฟรชหน้า' });
	}
	const updated = await Locals.db
		.update(tables.assetToProject)
		.set({ status: to, adminNote: note })
		.where(and(eq(tables.assetToProject.id, id), inArray(tables.assetToProject.status, from)))
		.returning({ id: tables.assetToProject.id });
	if (!updated.length) error(409, { message: 'สถานะคำขอเปลี่ยนไปแล้ว โปรดรีเฟรชหน้า' });
	await insertBorrowingEvent(Locals.db, {
		borrowingRequestId: id,
		type: eventType,
		actorOuid: ouid,
		detail: note ? { note } : undefined
	});
	if (to === 'rejected') {
		await inventoryModel.insertMovement(Locals.db, {
			assetId: request.assetId,
			borrowingRequestId: id,
			type: 'released',
			amount: request.amount,
			actorOuid: ouid,
			reason: note || 'Borrowing request rejected'
		});
	}
	if (to === 'inuse') {
		await inventoryModel.insertMovement(Locals.db, {
			assetId: request.assetId,
			borrowingRequestId: id,
			type: 'checked-out',
			amount: request.amount,
			actorOuid: ouid,
			reason: 'Borrower picked up asset'
		});
	}
	await insertNewLog(Locals.db, {
		action: 'update-borrowing-request',
		actor: ouid,
		target: id,
		detail: { from: request.status, to, note },
		comment: `อัปเดตคำขอยืม ${id}: ${request.status} เป็น ${to}`
	});
	try {
		await notifyBorrower(request, asset, to);
	} catch (notificationError) {
		console.error('Borrowing notification failed', notificationError);
	}
	return { ...request, status: to };
}

export const approveBorrowingRequest = command(borrowingValidators.borrowingActionSchema, (data) =>
	adminTransition(data.id, ['pending'], 'approved', 'approved', data.note)
);

export const rejectBorrowingRequest = command(borrowingValidators.borrowingActionSchema, (data) =>
	adminTransition(data.id, ['pending'], 'rejected', 'rejected', data.note)
);

export const markBorrowingPickedUp = command(borrowingValidators.borrowingActionSchema, (data) =>
	adminTransition(data.id, ['approved'], 'inuse', 'picked-up', data.note)
);

export const updateMyBorrowingRequest = command(
	borrowingValidators.updateMyBorrowingSchema,
	async (data) => {
		const { ouid } = Guard.loggedIn();
		const { request, asset } = await requireRequest(data.id);
		if (request.borrowerId !== ouid) error(403, { message: 'คุณไม่มีสิทธิ์แก้ไขคำขอนี้' });
		if (request.status !== 'pending') error(409, { message: 'แก้ไขได้เฉพาะคำขอที่รออนุมัติ' });
		if (data.startDate > data.endDate) error(400, { message: 'วันคืนต้องไม่มาก่อนวันยืม' });
		const { project } = await requireBorrowingAccess(ouid, data.projectId);
		if (project.isPinned && asset.type !== 'key') {
			error(400, { message: 'โครงการประเภทนี้ยืมได้เฉพาะกุญแจ' });
		}
		const availability = await inventoryModel.getAvailability(
			Locals.db,
			request.assetId,
			data.startDate,
			data.endDate,
			request.id
		);
		if (!availability || data.amount > availability.availableAmount) {
			error(409, { message: 'จำนวนพัสดุไม่เพียงพอในช่วงวันที่เลือก' });
		}
		try {
			await Locals.db
				.update(tables.assetToProject)
				.set({
					projectId: data.projectId,
					amount: data.amount,
					startDate: data.startDate,
					endDate: data.endDate,
					note: data.note
				})
				.where(eq(tables.assetToProject.id, data.id));
		} catch (err) {
			capacityError(err);
		}
		await insertBorrowingEvent(Locals.db, {
			borrowingRequestId: data.id,
			type: 'edited',
			actorOuid: ouid,
			detail: { amount: data.amount, startDate: data.startDate, endDate: data.endDate }
		});
		return borrowingModel.getBorrowingRequestDetail(Locals.db, data.id);
	}
);

export const cancelMyBorrowingRequest = command(
	borrowingValidators.cancelMyBorrowingSchema,
	async (data) => {
		const { ouid } = Guard.loggedIn();
		const { request } = await requireRequest(data.id);
		if (request.borrowerId !== ouid) error(403, { message: 'คุณไม่มีสิทธิ์ยกเลิกคำขอนี้' });
		if (!['pending', 'approved'].includes(request.status)) {
			error(409, { message: 'ยกเลิกได้เฉพาะคำขอที่รออนุมัติหรืออนุมัติแล้ว' });
		}
		await Locals.db
			.update(tables.assetToProject)
			.set({ status: 'cancelled' })
			.where(eq(tables.assetToProject.id, data.id));
		await insertBorrowingEvent(Locals.db, {
			borrowingRequestId: data.id,
			type: 'cancelled',
			actorOuid: ouid,
			detail: data.reason ? { reason: data.reason } : undefined
		});
		await inventoryModel.insertMovement(Locals.db, {
			assetId: request.assetId,
			borrowingRequestId: data.id,
			type: 'released',
			amount: request.amount,
			actorOuid: ouid,
			reason: data.reason || 'Borrower cancelled request'
		});
		return { ...request, status: 'cancelled' as const };
	}
);

export const processBorrowingReturn = command(
	borrowingValidators.processBorrowingReturnSchema,
	async (data) => {
		const { ouid } = Guard.loggedIn();
		await Guard.allows({ permission: { borrowing: ['manage'] } });
		const { request, asset } = await requireRequest(data.id);
		if (request.status !== 'inuse') error(409, { message: 'รับคืนได้เฉพาะรายการที่กำลังใช้งาน' });
		const current = await borrowingModel.getResolvedAmounts(Locals.db, data.id);
		const alreadyResolved = current.returnedAmount + current.damagedAmount + current.lostAmount;
		const resolving = data.returnedAmount + data.damagedAmount + data.lostAmount;
		if (resolving < 1) error(400, { message: 'โปรดระบุจำนวนที่รับคืนอย่างน้อย 1 รายการ' });
		if (alreadyResolved + resolving > request.amount) {
			error(400, {
				message: `จำนวนรับคืนเกินยอดคงค้าง ${request.amount - alreadyResolved} ${asset.unitTerm}`
			});
		}
		if (!('batch' in Locals.db)) error(500, { message: 'ฐานข้อมูลไม่รองรับการรับคืนแบบอะตอม' });
		const movementQueries = [
			{ type: 'returned-usable' as const, amount: data.returnedAmount },
			{ type: 'damaged' as const, amount: data.damagedAmount },
			{ type: 'lost' as const, amount: data.lostAmount }
		]
			.filter((movement) => movement.amount > 0)
			.map((movement) =>
				Locals.db.insert(tables.inventoryMovement).values({
					assetId: request.assetId,
					borrowingRequestId: data.id,
					...movement,
					actorOuid: ouid,
					reason: data.note
				})
			);
		const assetUpdate = Locals.db
			.update(tables.asset)
			.set({
				damagedAmount: sql`${tables.asset.damagedAmount} + ${data.damagedAmount}`,
				lostAmount: sql`${tables.asset.lostAmount} + ${data.lostAmount}`
			})
			.where(eq(tables.asset.id, asset.id));
		const completionUpdate = Locals.db
			.update(tables.assetToProject)
			.set({ status: 'returned' })
			.where(
				and(
					eq(tables.assetToProject.id, data.id),
					eq(tables.assetToProject.status, 'inuse'),
					sql`(SELECT COALESCE(SUM(${tables.inventoryMovement.amount}), 0) FROM ${tables.inventoryMovement} WHERE ${tables.inventoryMovement.borrowingRequestId} = ${data.id} AND ${tables.inventoryMovement.type} IN ('returned-usable', 'damaged', 'lost')) >= ${tables.assetToProject.amount}`
				)
			)
			.returning({ id: tables.assetToProject.id });
		const batchQueries = [assetUpdate, ...movementQueries, completionUpdate] as [
			typeof assetUpdate,
			...typeof movementQueries,
			typeof completionUpdate
		];
		const batchResult = await Locals.db.batch(batchQueries);
		const completedRows = batchResult.at(-1) as { id: string }[];
		const completed = completedRows.length > 0;
		await insertBorrowingEvent(Locals.db, {
			borrowingRequestId: data.id,
			type: completed ? 'completed' : 'partial-return',
			actorOuid: ouid,
			detail: {
				returnedAmount: data.returnedAmount,
				damagedAmount: data.damagedAmount,
				lostAmount: data.lostAmount,
				note: data.note
			}
		});
		if (completed) {
			try {
				await notifyBorrower(request, asset, 'returned');
			} catch (notificationError) {
				console.error('Borrowing return notification failed', notificationError);
			}
		}
		const resolved = await borrowingModel.getResolvedAmounts(Locals.db, data.id);
		return {
			completed,
			outstandingAmount:
				request.amount - resolved.returnedAmount - resolved.damagedAmount - resolved.lostAmount
		};
	}
);

// Temporary adapter for route-local approval UI. It rejects arbitrary transitions.
export const updateBorrowingRequest = command(
	borrowingValidators.borrowingUpdateSchema,
	async (data) => {
		if (data.status === 'approved') {
			return adminTransition(
				data.id,
				['pending'],
				'approved',
				'approved',
				data.adminNote ?? undefined
			);
		}
		if (data.status === 'rejected') {
			return adminTransition(
				data.id,
				['pending'],
				'rejected',
				'rejected',
				data.adminNote ?? undefined
			);
		}
		if (data.status === 'inuse') {
			return adminTransition(
				data.id,
				['approved'],
				'inuse',
				'picked-up',
				data.adminNote ?? undefined
			);
		}
		error(400, { message: 'โปรดใช้ขั้นตอนรับคืนหรือยกเลิกที่กำหนดไว้' });
	}
);

export const getMyBorrowingRequestInfo = query(type({ id: 'string' }), async (data) => {
	const { ouid } = Guard.loggedIn();
	const request = await borrowingModel.getBorrowingRequestDetail(Locals.db, data.id);
	if (!request) error(404, { message: 'ไม่พบคำขอนี้' });
	if (request.borrowerId !== ouid) error(403, { message: 'คุณไม่มีสิทธิ์เข้าถึงคำขอนี้' });
	return request;
});
