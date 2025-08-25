import { project, projectToBorrower } from '$lib/schema';
import { createInsertSchema, createUpdateSchema } from 'drizzle-arktype';

export const createProjectSchema = createInsertSchema(project, {
	title: (schema) => schema.atLeastLength(5)
});

export const assignBorrowerToProjectSchema = createInsertSchema(projectToBorrower);

export const updateProjectSchema = createUpdateSchema(project);
