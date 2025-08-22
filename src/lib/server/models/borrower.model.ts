import { tables, type DrizzleClient } from '../db';
import {
	deleteFromTable,
	getOneFromTable,
	insertToTable,
	purgeDeletedFromTable,
	updateToTable
} from './helper';

const borrowerTable = tables.borrower;

export const insertNewBorrower = insertToTable(borrowerTable);
export const updateBorrower = updateToTable(borrowerTable, borrowerTable.ouid);
export const selectBorrower = getOneFromTable(borrowerTable, borrowerTable.ouid);
export const deleteBorrower = deleteFromTable(borrowerTable, borrowerTable.ouid);
export const purgeBorrower = purgeDeletedFromTable(borrowerTable);

export const selectAllBorrowers = async (
	db: DrizzleClient,
	{
		limit,
		offset
	}: {
		limit: number;
		offset: number;
	}
) => {
	return db.query.borrower.findMany({
		offset: offset,
		limit: limit
	});
};
