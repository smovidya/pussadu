import { and, eq, or } from 'drizzle-orm';
import { tables, type DrizzleClient } from '../db';
import {
	deleteFromTable,
	getOneFromTable,
	insertToTable,
	purgeDeletedFromTable,
	updateToTable
} from './helper';
import { project } from '$lib/schema';

const projectTable = tables.project;

export const insertNewProject = insertToTable(projectTable);
export const updateProject = updateToTable(projectTable, projectTable.id);
export const getProject = getOneFromTable(projectTable, projectTable.id);
export const deleteProject = deleteFromTable(projectTable, projectTable.id);
export const purgeProject = purgeDeletedFromTable(projectTable);

export const selectAllProjects = async (db: DrizzleClient) => {
	const projects = await db.query.project.findMany({
		where: (projects, { isNull }) => isNull(projects.deletedAt),
		with: {
			staffs: true
		}
	});
	return projects;
};

export const selectAllMyProjects = async (db: DrizzleClient, ouid: string) => {
	const projects = await db
		.select()
		.from(tables.projectToBorrower)
		.fullJoin(tables.project, eq(tables.project.id, tables.projectToBorrower.projectId))
		.where(or(eq(tables.projectToBorrower.borrowerId, ouid), eq(tables.project.isPinned, true)))
		.orderBy(tables.project.id);
	console.log(JSON.stringify({ projects }));
	return projects;
};

export const assignBorrower = async (db: DrizzleClient, projectId: string, borrowerId: string) => {
	const result = await db
		.insert(tables.projectToBorrower)
		.values({
			borrowerId,
			projectId
		})
		.returning();

	if (!result[0]) {
		throw new Error('Failed to assign borrower');
	}

	return result[0];
};

export const unassignBorrower = async (
	db: DrizzleClient,
	projectId: string,
	borrowerId: string
) => {
	const result = await db
		.delete(tables.projectToBorrower)
		.where(
			and(
				eq(tables.projectToBorrower.projectId, projectId),
				eq(tables.projectToBorrower.borrowerId, borrowerId)
			)
		)
		.returning();

	if (!result[0]) {
		throw new Error('Failed to unassign borrower');
	}

	return result[0];
};

export const isBorrowerAlreadyAssignedToProject = async (
	db: DrizzleClient,
	projectId: string,
	borrowerId: string
) => {
	// const result = await db.query.projectToBorrower.findFirst({
	// 	where: (projectToBorrower, { eq, and }) =>
	// 		or(
	// 			and(
	// 				eq(projectToBorrower.projectId, projectId),
	// 				eq(projectToBorrower.borrowerId, borrowerId)
	// 			),
	// 			eq(project.isPinned, true)
	// 		)
	// });
	const result = await db
		.select()
		.from(tables.projectToBorrower)
		.rightJoin(tables.project, eq(tables.project.id, tables.projectToBorrower.projectId))
		.where(
			or(eq(tables.projectToBorrower.borrowerId, borrowerId), eq(tables.project.isPinned, true))
		);
	return !!result;
};
