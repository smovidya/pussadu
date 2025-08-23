import { project, projectToBorrower } from '$lib/schema';
import { createInsertSchema } from 'drizzle-arktype';

export const createProjectSchema = createInsertSchema(project, {
	title: (schema) => schema.atLeastLength(5)
});

export const assignBorrowerToProjectSchema = createInsertSchema(projectToBorrower);
