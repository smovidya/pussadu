// In-progress
import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access';

const statement = {
	...defaultStatements,
	asset: ['create', 'update', 'delete', 'list', 'permanent-delete'],
	category: ['create', 'update', 'delete', 'list'],
	log: ['list', 'delete'],
	project: ['create', 'update', 'delete', 'list'],
	file: ['list', 'delete', 'upload', 'download'],
	department: ['create', 'update', 'delete', 'list'],
	borrower: ['create', 'update', 'delete', 'list'],
	borrowing: ['create', 'manage']
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
	asset: ['create', 'update', 'delete', 'list', 'permanent-delete'],
	category: ['create', 'update', 'delete', 'list'],
	log: ['list', 'delete'],
	project: ['create', 'update', 'delete', 'list'],
	file: ['list', 'delete', 'upload', 'download'],
	department: ['create', 'update', 'delete', 'list'],
	borrower: ['create', 'update', 'delete', 'list'],
	borrowing: ['create', 'manage'],
	...adminAc.statements
});

export const staff = ac.newRole({
	asset: ['create', 'update', 'delete', 'list'],
	category: ['create', 'update', 'delete', 'list'],
	log: ['list'],
	project: ['create', 'update', 'delete', 'list'],
	file: ['list', 'delete', 'upload', 'download'],
	department: ['create', 'update', 'delete', 'list'],
	borrower: ['create', 'update', 'delete', 'list'],
	borrowing: ['create', 'manage']
});

export const user = ac.newRole({
	asset: ['list'],
	category: ['list'],
	log: [],
	project: ['list'],
	file: ['download'],
	department: ['list'],
	borrower: [],
	borrowing: ['create']
});
