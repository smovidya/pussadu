import { afterEach, beforeEach, expect, test } from 'bun:test';
import { Database } from 'bun:sqlite';
import { drizzle as drizzleSqlite } from 'drizzle-orm/bun-sqlite';
import { drizzle } from 'drizzle-orm/d1';
import { getTableColumns } from 'drizzle-orm';
import * as schema from '../src/lib/schema';
import { listAssetsWithAvailability } from '../src/lib/server/models/inventory.model';

let sqlite: Database;
let seedDb: ReturnType<typeof drizzleSqlite<typeof schema>>;
let db: ReturnType<typeof drizzle<typeof schema>>;
let parameterCounts: number[];

beforeEach(() => {
	sqlite = new Database(':memory:');
	for (const [name, table] of [
		['asset', schema.asset],
		['asset_to_project', schema.assetToProject],
		['inventory_movement', schema.inventoryMovement]
	] as const) {
		const columns = Object.values(getTableColumns(table)).map(
			(column) => `"${column.name}" ${column.getSQLType()}`
		);
		sqlite.exec(`CREATE TABLE "${name}" (${columns.join(',')})`);
	}
	seedDb = drizzleSqlite(sqlite, { schema });
	parameterCounts = [];
	// Execute the real D1 adapter's SQL against SQLite, enforcing the remote
	// parameter limit that local SQLite alone does not enforce.
	const binding = {
		prepare(sql: string) {
			return {
				bind(...params: (string | number | null)[]) {
					parameterCounts.push(params.length);
					if (params.length > 100) throw new Error('D1 parameter limit exceeded');
					return { raw: async () => sqlite.query(sql).values(...params) };
				}
			};
		}
	};
	db = drizzle(binding as unknown as D1Database, { schema });
});

afterEach(() => sqlite.close());

test.each([0, 97, 98, 315])(
	'lists %i assets within the D1 parameter limit',
	async (count: number) => {
		if (count) {
			await seedDb.insert(schema.asset).values(
				Array.from({ length: count }, (_, index) => ({
					id: `asset-${index}`,
					name: `Asset ${index}`,
					type: 'normal' as const,
					totalAmount: 10
				}))
			);
		}
		const assets = await seedDb.select().from(schema.asset);
		const now = Date.now();
		// Cover requests and return movements on both sides of batch boundaries.
		for (const index of [0, 97, 194, 314].filter((index) => index < count)) {
			for (const [status, amount] of [
				['pending', 2],
				['inuse', 3],
				['returned', 9]
			] as const) {
				await seedDb.insert(schema.assetToProject).values({
					id: `${index}-${status}`,
					assetId: `asset-${index}`,
					projectId: 'project',
					borrowerId: 'borrower',
					status,
					amount,
					startDate: new Date(now - 86_400_000),
					endDate: new Date(now + 86_400_000)
				});
			}
			await seedDb.insert(schema.inventoryMovement).values({
				assetId: `asset-${index}`,
				borrowingRequestId: `${index}-inuse`,
				type: 'returned-usable',
				amount: 1,
				actorOuid: 'admin'
			});
		}

		const result = await listAssetsWithAvailability(db, assets);
		expect(result.map((asset) => asset.id)).toEqual(assets.map((asset) => asset.id));
		for (const [index, asset] of result.entries()) {
			const hasRequests = [0, 97, 194, 314].includes(index);
			expect(asset).toMatchObject({
				reservedAmount: hasRequests ? 2 : 0,
				inUseAmount: hasRequests ? 2 : 0,
				availableAmount: hasRequests ? 6 : 10
			});
		}
		expect(parameterCounts.every((count) => count <= 100)).toBe(true);
		if (!count) expect(parameterCounts).toEqual([]);
	}
);
