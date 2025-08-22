import { tables, type DrizzleClient } from '../db';
import {
	deleteFromTable,
	getOneFromTable,
	insertToTable,
	purgeDeletedFromTable,
	updateToTable
} from './helper';

const projectTable = tables.project;

export const insertNewProject = insertToTable(projectTable);
export const updateProject = updateToTable(projectTable, projectTable.id);
export const getProject = getOneFromTable(projectTable, projectTable.id);
export const deleteProject = deleteFromTable(projectTable, projectTable.id);
export const purgeProject = purgeDeletedFromTable(projectTable);

export const selectAllProjects = async (db: DrizzleClient) => {
	return await db.query.project.findMany({
		where: (projects, { isNull }) => isNull(projects.deletedAt)
	});
};

export const selectAllMyProjects = async (db: DrizzleClient, userId: string) => {
	return await db.query.projectToBorrower.findMany({
		where: (projectToBorrower, { eq, and }) => and(eq(projectToBorrower.borrowerId, userId)),
		with: {
			project: true
		},
		orderBy: (projectToBorrower) => projectToBorrower.projectId
	});
};
