import { type } from 'arktype';

export const createStudentUserSchema = type({
	email: 'string',
	name: 'string'
});

export const bulkCreateStudentUsersSchema = type({
	rows: createStudentUserSchema.array()
});

export const bulkIdsSchema = type({
	ids: 'string[]'
});

export const bulkBanSchema = type({
	ids: 'string[]',
	reason: 'string'
});

export const setRoleSchema = type({
	id: 'string',
	role: 'string'
});
