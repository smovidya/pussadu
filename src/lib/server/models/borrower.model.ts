import { tables, type DrizzleClient } from '../db';
import * as helper from './helper';

const borrowerTable = tables.borrower;

export const insertNewBorrower = helper.insertToTable(borrowerTable);
export const updateBorrower = helper.updateToTable(borrowerTable, borrowerTable.ouid);
export const selectBorrower = helper.getOneFromTable(borrowerTable, borrowerTable.ouid);
export const deleteBorrower = helper.deleteFromTable(borrowerTable, borrowerTable.ouid);
export const purgeBorrower = helper.purgeDeletedFromTable(borrowerTable);

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
