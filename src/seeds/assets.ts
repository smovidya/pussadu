import { getLocalD1DB } from '../../drizzle.config';
import { drizzle } from 'drizzle-orm/libsql';
import { seed } from 'drizzle-seed';
import * as schema from '$lib/schema';
import { deletedAtGenerator } from './helper';
import { assetStatusOptions } from '$lib/constants';

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
				// 			{
				// 	label: 'พร้อมใช้งาน',
				// 	value: 'available',
				// 	color: 'bg-green-50 text-green-600'
				// },
				// {
				// 	label: 'ถูกยืม',
				// 	value: 'borrowed',
				// 	color: 'bg-yellow-50 text-yellow-600'
				// },
				// {
				// 	label: 'ถูกจอง',
				// 	value: 'reserved',
				// 	color: 'bg-blue-50 text-blue-600'
				// },
				// {
				// 	label: 'กำลังซ่อมบำรุง',
				// 	value: 'maintenance',
				// 	color: 'bg-orange-50 text-orange-600'
				// },
				// {
				// 	label: 'สูญหาย',
				// 	value: 'lost',
				// 	color: 'bg-red-50 text-red-600'
				// },
				// {
				// 	label: 'ชำรุด',
				// 	value: 'damaged',
				// 	color: 'bg-gray-50 text-gray-600'
				// }
				status: f.weightedRandom([
					{
						value: f.default({
							defaultValue: 'available'
						}),
						weight: 0.7
					},
					{
						value: f.default({
							defaultValue: 'borrowed'
						}),
						weight: 0.2
					},
					{
						value: f.default({
							defaultValue: 'reserved'
						}),
						weight: 0.09
					},
					{
						value: f.default({
							defaultValue: 'maintenance'
						}),
						weight: 0.01
					}
				]),
				deletedAt: deletedAtGenerator(f)
			}
		}
	}));
}
main();
