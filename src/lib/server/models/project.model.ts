import { tables } from '../db';
import {
	deleteFromTable,
	getFromTable,
	insertToTable,
	purgeDeletedFromTable,
	updateToTable
} from './helper';

const projectTable = tables.project;

export const insertNewProject = insertToTable(projectTable);
export const updateProject = updateToTable(projectTable, projectTable.id);
export const getProject = getFromTable(projectTable, projectTable.id);
export const deleteProject = deleteFromTable(projectTable, projectTable.id);
export const purgeProject = purgeDeletedFromTable(projectTable);
