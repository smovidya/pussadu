import { and, eq, isNull } from 'drizzle-orm';
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
	const projects = await db.query.project.findMany({
		where: (projects, { isNull }) => isNull(projects.deletedAt),
		with: {
			staffs: true
		}
	});
	return projects;
};

export const selectAllMyProjects = async (db: DrizzleClient, ouid: string) => {
	return db
		.selectDistinct({
			project: tables.project,
			role: tables.projectToBorrower.role
		})
		.from(tables.projectToBorrower)
		.innerJoin(tables.project, eq(tables.project.id, tables.projectToBorrower.projectId))
		.where(and(isNull(tables.project.deletedAt), eq(tables.projectToBorrower.borrowerId, ouid)))
		.orderBy(tables.project.id);
};

export const assignBorrower = async (
	db: DrizzleClient,
	projectId: string,
	borrowerId: string,
	role: 'member' | 'coordinator' = 'member'
) => {
	const result = await db
		.insert(tables.projectToBorrower)
		.values({
			borrowerId,
			projectId,
			role
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
	const result = await getProjectMembership(db, projectId, borrowerId);
	return !!result;
};

export const getProjectMembership = async (
	db: DrizzleClient,
	projectId: string,
	borrowerId: string
) => {
	return db.query.projectToBorrower.findFirst({
		where: (projectToBorrower, { eq }) =>
			and(eq(projectToBorrower.projectId, projectId), eq(projectToBorrower.borrowerId, borrowerId))
	});
};
