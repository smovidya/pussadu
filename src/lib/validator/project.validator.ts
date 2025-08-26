import { borrower, project, projectToBorrower } from '$lib/schema';
import { type } from 'arktype';
import { createInsertSchema, createUpdateSchema } from 'drizzle-arktype';

export const createProjectSchema = createInsertSchema(project, {
	title: (schema) => schema.atLeastLength(5)
});

export const assignBorrowerToProjectSchema = type({
	borrowerData: createInsertSchema(borrower),
	relations: createInsertSchema(projectToBorrower)
});

export const updateProjectSchema = createUpdateSchema(project);

export const staffListSchema = type({
	name: 'string',
	ouid: 'string',
	email: 'string',
	line_id: 'string',
	phone: 'string',
	departmentId: 'string',
	isAdmin: 'boolean'
}).array();
