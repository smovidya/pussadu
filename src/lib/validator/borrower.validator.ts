import { createInsertSchema, createUpdateSchema } from 'drizzle-arktype';
import { borrower } from '$lib/schema';

export const createBorrowerSchema = createInsertSchema(borrower, {
	ouid: (schema) => schema.atLeastLength(1)
});

export const updateBorrowerSchema = createUpdateSchema(borrower);
