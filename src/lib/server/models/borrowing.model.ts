/**
 * @see {@link file://./../../../../docs/borrowing-status.png}
 */

import { tables, type DrizzleClient } from '../db';
import { and, eq, gte, inArray, isNull, like, lte, or } from 'drizzle-orm';
import type {
	borrowingFilterSchema,
	BorrowingRequest,
	BorrowingStatus,
	borrowingUpdateSchema
} from '$lib/validator/borrowing.validator';
import { asset, assetToProject, borrower, project } from '$lib/schema';
import * as helper from './helper';
import { createId } from '@paralleldrive/cuid2';

export async function requestToBorrow(db: DrizzleClient, request: BorrowingRequest) {
	if (!('batch' in db)) throw new Error('Atomic batch is unavailable');
	const id = createId();
	const created = { ...request, id, status: 'pending' as const };
	await db.batch([
		db.insert(tables.assetToProject).values(created),
		db.insert(tables.borrowingEvent).values({
			id: createId(),
			borrowingRequestId: id,
			type: 'submitted',
			actorOuid: request.borrowerId,
			detail: { amount: request.amount, startDate: request.startDate, endDate: request.endDate }
		}),
		db.insert(tables.inventoryMovement).values({
			id: createId(),
			assetId: request.assetId,
			borrowingRequestId: id,
			type: 'reserved',
			amount: request.amount,
			actorOuid: request.borrowerId,
			reason: 'Borrowing request submitted'
		})
	]);
	return created;
}

/**
 * Factory to create a status-updating function that transitions from allowed 'from' statuses to 'to'.
 */
function updateStatusIf(from: BorrowingStatus[], to: BorrowingStatus) {
	return async (db: DrizzleClient, id: string) => {
		// return db.transaction(async db => {
		const borrowings = await db
			.select({ status: tables.assetToProject.status })
			.from(tables.assetToProject)
			.where(eq(tables.assetToProject.id, id));

		if (borrowings.length !== 1) {
			return 'not-found';
		}

		const { status } = borrowings[0];
		if (!from.includes(status)) {
			return 'invalid-state';
		}

		await db
			.update(tables.assetToProject)
			.set({ status: to })
			.where(eq(tables.assetToProject.id, id));

		return 'ok';
		// });
	};
}

// used by admin
export const approveRequest = updateStatusIf(['pending'], 'approved');

// used by admin
export const rejectRequest = updateStatusIf(['pending'], 'rejected');

// used by requester
export const cancelRequest = updateStatusIf(['pending', 'approved'], 'cancelled');

// used by admin
export async function listBorrowedByUser(db: DrizzleClient, ouid: string) {
	const { asset: _, assetToProject } = tables;

	// const { createdAt, deletedAt, ...columns } = getTableColumns(asset);
	const items = await db.query.assetToProject.findMany({
		where: (_asset, { eq }) => eq(assetToProject.borrowerId, ouid),
		with: {
			asset: true,
			project: true,
			events: true,
			movements: true
		}
	});
	return items;
}

export async function getResolvedAmounts(db: DrizzleClient, id: string) {
	const movements = await db.query.inventoryMovement.findMany({
		where: (movement, { eq }) => eq(movement.borrowingRequestId, id)
	});
	return movements.reduce(
		(total, movement) => {
			if (movement.type === 'returned-usable') total.returnedAmount += movement.amount;
			if (movement.type === 'damaged') total.damagedAmount += movement.amount;
			if (movement.type === 'lost') total.lostAmount += movement.amount;
			return total;
		},
		{ returnedAmount: 0, damagedAmount: 0, lostAmount: 0 }
	);
}

export const getBorrowingRequest = helper.getOneFromTable(
	tables.assetToProject,
	tables.assetToProject.id
);

export async function getBorrowingRequestDetail(db: DrizzleClient, id: string) {
	return db.query.assetToProject.findFirst({
		where: (row, { eq }) => eq(row.id, id),
		with: {
			asset: true,
			project: true,
			events: true,
			movements: true
		},
		orderBy: (row, { desc }) => desc(row.createdAt)
	});
}

/** Project statuses that mean the project is no longer active - matches the
 * "ended" grouping used for filtering in listBorrowingRequests. */
const CLOSED_PROJECT_STATUSES = ['completed', 'evaluated', 'cancelled'] as const;

/**
 * Borrowings that are either due within the next 24h or already overdue and
 * still not returned - used by the daily return-reminder cron. Excludes items
 * overdue by more than a month (treated as lost/stale, not something a daily
 * nag will fix) and items whose project has already closed.
 */
export async function listDueSoonOrOverdueBorrowings(db: DrizzleClient) {
	const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
	const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

	const borrowings = await db.query.assetToProject.findMany({
		where: (row, { and, inArray, lte, gte, isNull }) =>
			and(
				inArray(row.status, ['approved', 'inuse']),
				isNull(row.deletedAt),
				lte(row.endDate, in24h),
				gte(row.endDate, oneMonthAgo)
			),
		with: {
			asset: true,
			borrower: true,
			project: true
		}
	});

	return borrowings.filter(
		(b) =>
			!CLOSED_PROJECT_STATUSES.includes(
				b.project?.status as (typeof CLOSED_PROJECT_STATUSES)[number]
			)
	);
}

export async function listBorrowingRequests(
	db: DrizzleClient,
	{
		searchTerm,
		statuses,
		startDate,
		endDate,
		projectIds,
		projectStatus
	}: typeof borrowingFilterSchema.infer
) {
	const projectProgress = {
		inprogress: ['notstarted', 'inprogress'],
		ended: ['completed', 'evaluated', 'cancelled']
	} as const;
	const selectedProjectStatus = (projectStatus || [])
		.map((status) => projectProgress[status])
		.flat();
	const borrowings = await db
		.select()
		.from(assetToProject)
		.leftJoin(asset, eq(assetToProject.assetId, asset.id))
		.leftJoin(borrower, eq(assetToProject.borrowerId, borrower.ouid))
		.leftJoin(project, eq(assetToProject.projectId, project.id))
		.where(
			and(
				searchTerm
					? or(
							like(assetToProject.note, `%${searchTerm}%`),
							like(asset.name, `%${searchTerm}%`),
							like(asset.description, `%${searchTerm}%`),
							like(borrower.name, `%${searchTerm}%`),
							like(borrower.ouid, `%${searchTerm}%`)
						)
					: undefined,
				projectStatus?.length ? inArray(project.status, selectedProjectStatus) : undefined,
				projectIds?.length ? inArray(assetToProject.projectId, projectIds) : undefined,
				statuses?.length ? inArray(assetToProject.status, statuses) : undefined,
				startDate ? gte(assetToProject.startDate, startDate) : undefined,
				endDate ? lte(assetToProject.endDate, endDate) : undefined,
				isNull(assetToProject.deletedAt)
			)
		);
	return Promise.all(
		borrowings.map(async (borrowing) => ({
			...borrowing,
			resolution: await getResolvedAmounts(db, borrowing.asset_to_project.id)
		}))
	);
}

export async function updateBorrowingRequest(
	db: DrizzleClient,
	id: string,
	data: typeof borrowingUpdateSchema.infer
) {
	return await db.update(tables.assetToProject).set(data).where(eq(assetToProject.id, id));
}
