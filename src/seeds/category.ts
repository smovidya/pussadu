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
	await seed(
		db,
		{
			category: schema.category
		},
		{
			count: 5
		}
	).refine((f) => ({
		category: {
			columns: {
				name: f.string({
					isUnique: true
				}),
				description: f.loremIpsum(),
				deletedAt: deletedAtGenerator(f)
			}
		}
	}));
}

main();
