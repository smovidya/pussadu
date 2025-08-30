import { isNull } from 'drizzle-orm';
import { tables, type DrizzleClient } from '../db';

export async function listCategories(db: DrizzleClient, includeDeleted = false) {
	const categories = await db
		.select()
		.from(tables.category)
		.where(includeDeleted ? undefined : isNull(tables.category.deletedAt));

	return categories;
}
