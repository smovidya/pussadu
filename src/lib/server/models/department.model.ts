import { tables } from '../db';
import {
	deleteFromTable,
	getFromTable,
	insertToTable,
	purgeDeletedFromTable,
	updateToTable
} from './helper';

const departmentTable = tables.department;

export const insertNewDepartment = insertToTable(departmentTable);
export const updateDepartment = updateToTable(departmentTable, departmentTable.id);
export const getDepartment = getFromTable(departmentTable, departmentTable.id);
export const deleteDepartment = deleteFromTable(departmentTable, departmentTable.id);
export const purgeDepartment = purgeDeletedFromTable(departmentTable);
