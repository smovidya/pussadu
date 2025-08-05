import { eq } from 'drizzle-orm';
import { tables, type DrizzleClient } from '../db';

export async function getBorrowerByOuid(db: DrizzleClient, ouid: string) {
	const borrower = await db
		.select()
		.from(tables.borrower)
		.where(eq(tables.borrower.ouid, ouid))
		.limit(1);
	if (borrower.length === 0) {
		return null;
	}
	return borrower[0];
}
