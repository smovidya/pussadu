import { isNull } from 'drizzle-orm';
import { tables, type DrizzleClient } from '../db';
import {
	deleteFromTable,
	getOneFromTable,
	insertToTable,
	purgeDeletedFromTable,
	updateToTable
} from './helper';

const departmentTable = tables.department;

export const insertNewDepartment = insertToTable(departmentTable);
export const updateDepartment = updateToTable(departmentTable, departmentTable.id);
export const getDepartment = getOneFromTable(departmentTable, departmentTable.id);
export const deleteDepartment = deleteFromTable(departmentTable, departmentTable.id);
export const purgeDepartment = purgeDeletedFromTable(departmentTable);

export const listDepartments = async (db: DrizzleClient, includeDeleted = false) => {
	const departments = await db
		.select()
		.from(departmentTable)
		.where(includeDeleted ? undefined : isNull(departmentTable.deletedAt));

	return departments;
};
