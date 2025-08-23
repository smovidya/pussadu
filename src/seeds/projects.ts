import { getLocalD1DB } from '../../drizzle.config';
import { drizzle } from 'drizzle-orm/libsql';
import { seed } from 'drizzle-seed';
import * as schema from '$lib/schema';
import { deletedAtGenerator } from './helper';

async function main() {
	const db = drizzle({
		connection: {
			url: `file:${getLocalD1DB()}` as string
		},
		schema
	});

	await seed(db, {
		project: schema.project,
		projectRelations: schema.projectRelations,
	}).refine((f) => ({
		project: {
			columns: {
				name: f.string(),
				deletedAt: deletedAtGenerator(f)
			}
		}
	}));

	console.log("Still need to setup borrwer to project relation manually")
}
main();
