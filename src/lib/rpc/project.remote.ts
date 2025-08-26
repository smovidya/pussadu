import { query, command } from '$app/server';
import { insertNewLog } from '$lib/server/models/audit.model';
import {
	assignBorrower,
	deleteProject,
	getProject,
	insertNewProject,
	isBorrowerAlreadyAssignedToProject,
	selectAllMyProjects,
	selectAllProjects,
	unassignBorrower,
	updateProject
} from '$lib/server/models/project.model';
import {
	assignBorrowerToProjectSchema,
	createProjectSchema,
	updateProjectSchema
} from '$lib/validator/project.validator';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import { error } from '@sveltejs/kit';
import { type } from 'arktype';
import { getBorrowerInfo } from './borrower.remote';
import { insertNewBorrower, updateBorrower } from '$lib/server/models/borrower.model';

export const getAllProjects = query(async () => {
	Guard.admin();
	return await selectAllProjects(Locals.db);
});

export const getAllMyProjects = query(async () => {
	const { ouid } = Guard.loggedIn();
	return selectAllMyProjects(Locals.db, ouid);
});

export const adminGetProjectInfo = query(type({ id: 'string' }), async (data) => {
	Guard.admin();
	return await getProject(Locals.db, data.id);
});

export const getProjectInfo = query(type({ id: 'string' }), async (data) => {
	const { ouid } = Guard.loggedIn();
	const isAllowed = await isBorrowerAlreadyAssignedToProject(Locals.db, data.id, ouid);
	if (!isAllowed) error(403, 'คุณไม่มีสิทธิ์เข้าถึงโครงการนี้');
	return await getProject(Locals.db, data.id);
});

export const listAllStaffsForProject = query(
	type({
		projectId: 'string'
	}),
	async (data) => {
		Guard.allows({
			permission: {
				user: ['list']
			}
		});

		const staffs = await Locals.db.query.projectToBorrower.findMany({
			where: (projectToBorrower, { eq }) => eq(projectToBorrower.projectId, data.projectId),
			with: {
				borrower: true
			}
		});

		return staffs;
	}
);

export const createProject = command(createProjectSchema, async (data) => {
	const { ouid } = Guard.admin();

	const project = await insertNewProject(Locals.db, data);

	await insertNewLog(Locals.db, {
		action: 'create-project',
		actor: ouid,
		target: project.id
	});

	await getAllProjects().refresh();

	return project;
});

export const assignBorrowerToProject = command(assignBorrowerToProjectSchema, async (data) => {
	const { ouid } = Guard.admin();

	const isAlreadyAssigned = await isBorrowerAlreadyAssignedToProject(
		Locals.db,
		data.relations.projectId,
		data.relations.borrowerId
	);

	if (isAlreadyAssigned) {
		error(400, 'โครงการนี้มีสตาฟนี้อยู่แล้ว');
	}

	const borrower = await getBorrowerInfo({
		ouid: data.relations.borrowerId
	});

	if (!borrower) {
		await insertNewBorrower(Locals.db, data.borrowerData);
	} else {
		await updateBorrower(Locals.db, borrower.ouid, data.borrowerData);
	}

	const project = await assignBorrower(
		Locals.db,
		data.relations.projectId,
		data.relations.borrowerId
	);

	await insertNewLog(Locals.db, {
		action: 'assign-borrower-to-project',
		actor: ouid,
		target: project.projectId,
		comment: `Assigned borrower "${data.relations.borrowerId}" to project "${data.relations.projectId}"`
	});

	await getAllMyProjects().refresh();

	return project;
});

export const removeBorrowerFromProject = command(
	type({
		projectId: 'string',
		borrowerId: 'string'
	}),
	async (data) => {
		const { ouid } = Guard.admin();

		const project = await unassignBorrower(Locals.db, data.projectId, data.borrowerId);

		await insertNewLog(Locals.db, {
			action: 'unassign-borrower',
			actor: ouid,
			target: project.projectId,
			comment: `Unassigned borrower "${data.borrowerId}" from project "${data.projectId}"`
		});

		await getAllMyProjects().refresh();

		return project;
	}
);

export const setProjectInfo = command(updateProjectSchema, async (data) => {
	const { ouid } = Guard.admin();

	if (!data.id) error(403, 'โปรดระบุ ID ของโครงการ');

	const project = await updateProject(Locals.db, data.id, data);

	await insertNewLog(Locals.db, {
		action: 'update-project',
		actor: ouid,
		target: project[0].id,
		comment: `Updated project "${project[0].id}": ${JSON.stringify(data)}`
	});

	await getAllProjects().refresh();

	return project;
});

export const removeProject = command(
	type({
		id: 'string'
	}),
	async (data) => {
		const { ouid } = Guard.admin();

		await deleteProject(Locals.db, data.id);

		await insertNewLog(Locals.db, {
			action: 'remove-project',
			actor: ouid,
			target: data.id,
			comment: `Removed project "${data.id}"`
		});

		await getAllProjects().refresh();
	}
);
