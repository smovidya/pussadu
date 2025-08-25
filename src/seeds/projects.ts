import { getLocalD1DB } from '../../drizzle.config';
import { drizzle } from 'drizzle-orm/libsql';
import { seed } from 'drizzle-seed';
import * as schema from '$lib/schema';
import { deletedAtGenerator } from './helper';
import { projectOwnerOptions, projectStatusOptions } from '../lib/constants';

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
			project: schema.project,
			projectRelations: schema.projectRelations
		},
		{
			count: 25
		}
	).refine((f) => ({
		project: {
			columns: {
				name: f.string(),
				owner: f.valuesFromArray({
					values: projectOwnerOptions.map((owner) => owner.value)
				}),
				status: f.valuesFromArray({
					values: projectStatusOptions.map((status) => status.value)
				}),
				deletedAt: deletedAtGenerator(f)
			}
		}
	}));

	console.log('Still need to setup borrwer to project relation manually');
}
main();
