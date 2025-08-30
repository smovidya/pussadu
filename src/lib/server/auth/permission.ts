// In-progress
import { createAccessControl } from 'better-auth/plugins/access';
// import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access';

export const statement = {
	asset: ['create', 'update', 'delete', 'list', 'permanent-delete'],
	category: ['create', 'update', 'delete', 'list'],
	log: ['list', 'delete'],
	project: ['create', 'update', 'delete', 'list'],
	file: ['list', 'delete', 'upload'],
	department: ['create', 'update', 'delete', 'list'],
	borrower: ['create', 'update', 'delete', 'list']
} as const;

export const ac = createAccessControl(statement);
