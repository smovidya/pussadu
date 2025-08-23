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
	const departmentIds = (await db.query.department.findMany()).map((d) => d.id);
	await seed(db, {
		borrower: schema.borrower
	}).refine((f) => ({
		borrower: {
			columns: {
				// hack for generate proper ouid
				ouid: f.phoneNumber({
					template: '003#####23' // mock number start with 00
				}),
				name: f.fullName(),
				phone: f.phoneNumber({
					template: '00########' // mock number
				}),
				email: f.email(),
				line_id: f.string(),
				oldIsAdmin: f.boolean(),
				departmentId: f.valuesFromArray({
					values: departmentIds
				}),
				createdAt: f.date({
					minDate: new Date(2020, 0, 1),
					maxDate: new Date()
				}),
				updatedAt: f.date({
					minDate: new Date(2020, 0, 1),
					maxDate: new Date()
				}),
				deletedAt: deletedAtGenerator(f)
			},
			count: 10
		}
	}));
}

main();
