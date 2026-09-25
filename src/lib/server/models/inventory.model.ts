import { tables, type DrizzleClient } from '../db';
import { inArray } from 'drizzle-orm';

export type InventoryMovementType = typeof tables.inventoryMovement.$inferInsert.type;

type RequestWithMovements = typeof tables.assetToProject.$inferSelect & {
	movements: (typeof tables.inventoryMovement.$inferSelect)[];
};

function calculateAvailability(
	item: typeof tables.asset.$inferSelect,
	requests: RequestWithMovements[],
	startDate: Date,
	endDate: Date
) {
	const usableAmount = Math.max(
		0,
		item.totalAmount - item.maintenanceAmount - item.damagedAmount - item.lostAmount
	);
	let reservedAmount = 0;
	let inUseAmount = 0;
	for (const request of requests) {
		if (request.status === 'inuse') {
			const resolved = request.movements
				.filter((movement) => ['returned-usable', 'damaged', 'lost'].includes(movement.type))
				.reduce((sum, movement) => sum + movement.amount, 0);
			inUseAmount += Math.max(0, request.amount - resolved);
		} else if (request.startDate <= endDate && request.endDate >= startDate) {
			reservedAmount += request.amount;
		}
	}
	const availableAmount =
		item.catalogState === 'active' && !item.needsInventoryReview
			? Math.max(0, usableAmount - reservedAmount - inUseAmount)
			: 0;

	return {
		catalogState: item.catalogState,
		needsInventoryReview: item.needsInventoryReview,
		totalAmount: item.totalAmount,
		usableAmount,
		reservedAmount,
		inUseAmount,
		availableAmount,
		maintenanceAmount: item.maintenanceAmount,
		damagedAmount: item.damagedAmount,
		lostAmount: item.lostAmount
	};
}

export async function getAvailability(
	db: DrizzleClient,
	assetId: string,
	startDate: Date,
	endDate: Date,
	excludeRequestId?: string
) {
	const item = await db.query.asset.findFirst({
		where: (asset, { eq }) => eq(asset.id, assetId)
	});
	if (!item) return null;

	const requests = await db.query.assetToProject.findMany({
		where: (request, { and, eq, inArray, ne }) =>
			and(
				eq(request.assetId, assetId),
				inArray(request.status, ['pending', 'approved', 'inuse']),
				excludeRequestId ? ne(request.id, excludeRequestId) : undefined
			),
		with: { movements: true }
	});

	return calculateAvailability(item, requests, startDate, endDate);
}

export async function listAssetsWithAvailability(
	db: DrizzleClient,
	assets: (typeof tables.asset.$inferSelect)[]
) {
	if (!assets.length) return [];
	const now = new Date();
	const statuses = ['pending', 'approved', 'inuse'] as const;
	// D1 allows 100 bound parameters per query, including the status filters.
	const batchSize = 100 - statuses.length;
	const requestsByAsset = new Map<string, RequestWithMovements[]>();
	for (let offset = 0; offset < assets.length; offset += batchSize) {
		const assetIds = assets.slice(offset, offset + batchSize).map((asset) => asset.id);
		const requests = await db.query.assetToProject.findMany({
			where: (request, { and, inArray: inStatuses }) =>
				and(inArray(request.assetId, assetIds), inStatuses(request.status, [...statuses])),
			with: { movements: true }
		});
		for (const request of requests) {
			const grouped = requestsByAsset.get(request.assetId) ?? [];
			grouped.push(request);
			requestsByAsset.set(request.assetId, grouped);
		}
	}
	return assets.map((asset) => ({
		...asset,
		...calculateAvailability(asset, requestsByAsset.get(asset.id) ?? [], now, now)
	}));
}

export async function insertMovement(
	db: DrizzleClient,
	data: typeof tables.inventoryMovement.$inferInsert
) {
	const [movement] = await db.insert(tables.inventoryMovement).values(data).returning();
	return movement;
}

export async function listMovements(db: DrizzleClient, assetId: string, limit = 50, offset = 0) {
	return db.query.inventoryMovement.findMany({
		where: (movement, { eq }) => eq(movement.assetId, assetId),
		orderBy: (movement, { desc }) => desc(movement.createdAt),
		limit,
		offset
	});
}

export async function getMaximumCommittedAmount(db: DrizzleClient, assetId: string) {
	const requests = await db.query.assetToProject.findMany({
		where: (request, { and, eq, inArray }) =>
			and(eq(request.assetId, assetId), inArray(request.status, ['pending', 'approved', 'inuse'])),
		with: { movements: true }
	});
	let inUse = 0;
	const points: { time: number; delta: number }[] = [];
	for (const request of requests) {
		if (request.status === 'inuse') {
			const resolved = request.movements
				.filter((movement) => ['returned-usable', 'damaged', 'lost'].includes(movement.type))
				.reduce((sum, movement) => sum + movement.amount, 0);
			inUse += Math.max(0, request.amount - resolved);
			continue;
		}
		points.push({ time: request.startDate.getTime(), delta: request.amount });
		points.push({ time: request.endDate.getTime() + 1, delta: -request.amount });
	}
	points.sort((a, b) => a.time - b.time || b.delta - a.delta);
	let reserved = 0;
	let maximum = inUse;
	for (const point of points) {
		reserved += point.delta;
		maximum = Math.max(maximum, inUse + reserved);
	}
	return maximum;
}
