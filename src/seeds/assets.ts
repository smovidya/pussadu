import { getLocalD1DB } from '../../drizzle.config';
import { drizzle } from 'drizzle-orm/libsql';
import { seed } from 'drizzle-seed';
import * as schema from '../lib/server/db/schema';
import { deletedAtGenerator } from './helper';

async function main() {
	const db = drizzle({
		connection: {
			url: `file:${getLocalD1DB()}` as string
		},
		schema
	});

	const categoryIds = (await db.query.category.findMany()).map((c) => c.id);
	await seed(db, {
		assets: schema.asset,
		assetRelations: schema.assetRelations
	}).refine((f) => ({
		assets: {
			columns: {
				name: f.string(),
				amount: f.int({ minValue: 1, maxValue: 100 }),
				categoryId: f.valuesFromArray({
					values: categoryIds
				}),
				type: f.valuesFromArray({
					values: schema.asset.type.enumValues
				}),
				description: f.loremIpsum(),
				image_url: f.valuesFromArray({
					values: [
						'/placeholder/blue.png',
						'/placeholder/grey.png',
						'/placeholder/white.png',
						'/placeholder/yellow.png'
					]
				}),
				unitTerm: f.valuesFromArray({
					values: ['ชิ้น', 'ตัว', 'กล่อง', 'ชุด', 'ด้าม']
				}),
				deletedAt: deletedAtGenerator(f)
			}
		}
	}));
}
main();
