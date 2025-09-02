/**
 * @see {@link file://./../../../../docs/borrowing-status.png}
 */

import { tables, type DrizzleClient } from '../db';
import { and, eq, gte, inArray, isNull, like, lte, or, sql } from 'drizzle-orm';
import type {
	borrowingFilterSchema,
	BorrowingRequest,
	BorrowingStatus,
	ReturnStatus,
	borrowingUpdateSchema
} from '$lib/validator/borrowing.validator';
import { asset, assetToBorrower, assetToProject, borrower, project } from '$lib/schema';
import * as helper from './helper';

export async function requestToBorrow(db: DrizzleClient, request: BorrowingRequest) {
	const { amount, assetId, startDate, endDate, projectId, note, borrowerId } = request;
	// NOTE: temp fix idk why transaction didn't work -- PTSGRN
	// await db.transaction(async (tx) => {
	// 	await tx.insert(tables.assetToProject).values(request);

	// 	// updateAsset(tx, assetId, { amount: sql`${tables.asset.amount} - 1  })
	// 	await tx
	// 		.update(tables.asset)
	// 		.set({
	// 			amount: sql`${tables.asset.amount} - ${amount}`
	// 		})
	// 		.where(eq(tables.asset.id, assetId));
	// });

	// TODO: delete this record when it's returned???
	await db.insert(assetToBorrower).values(request);
	await db
		.update(tables.asset)
		.set({
			amount: sql`${tables.asset.amount} - ${amount}`
		})
		.where(eq(tables.asset.id, assetId));
	await db.insert(tables.assetToProject).values({
		amount,
		assetId,
		startDate,
		endDate,
		projectId,
		note,
		borrowerId,
		status: 'pending'
	});
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
export async function returnBorrowing(db: DrizzleClient, id: string, status: ReturnStatus) {
	return updateStatusIf(['pending', 'approved'], status)(db, id);
}

export async function listBorrowedByUser(db: DrizzleClient, ouid: string) {
	const { asset: _, assetToProject } = tables;

	// const { createdAt, deletedAt, ...columns } = getTableColumns(asset);
	const items = await db.query.assetToProject.findMany({
		where: (_asset, { eq }) => eq(assetToProject.borrowerId, ouid),
		with: {
			asset: true,
			project: true
		}
	});
	return items;
}

export const getBorrowingRequest = helper.getOneFromTable(
	tables.assetToProject,
	tables.assetToProject.id
);

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
		)
		.limit(50);
	return borrowings;
}

export async function updateBorrowingRequest(
	db: DrizzleClient,
	id: string,
	data: typeof borrowingUpdateSchema.infer
) {
	return await db.update(tables.assetToProject).set(data).where(eq(assetToProject.id, id));
}
