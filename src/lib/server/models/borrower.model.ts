import { tables } from '../db';
import {
	deleteFromTable,
	getFromTable,
	insertToTable,
	purgeDeletedFromTable,
	updateToTable
} from './helper';

const borrowerTable = tables.borrower;

export const insertNewBorrower = insertToTable(borrowerTable);
export const updateBorrower = updateToTable(borrowerTable, borrowerTable.ouid);
export const getBorrower = getFromTable(borrowerTable, borrowerTable.ouid);
export const deleteBorrower = deleteFromTable(borrowerTable, borrowerTable.ouid);
export const purgeBorrower = purgeDeletedFromTable(borrowerTable);
