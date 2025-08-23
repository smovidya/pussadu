import { query, command } from '$app/server';
import { insertNewLog } from '$lib/server/models/audit.model';
import {
	assignBorrower,
	insertNewProject,
	selectAllMyProjects,
	selectAllProjects
} from '$lib/server/models/project.model';
import {
	assignBorrowerToProjectSchema,
	createProjectSchema
} from '$lib/validator/project.validator';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';

export const getAllProjects = query(async () => {
	Guard.admin();
	return await selectAllProjects(Locals.db);
});

export const getAllMyProjects = query(async () => {
	const { id } = Guard.loggedIn();
	return selectAllMyProjects(Locals.db, id);
});

export const createProject = command(createProjectSchema, async (data) => {
	Guard.admin();
	const { id } = Guard.loggedIn();

	const project = await insertNewProject(Locals.db, data);

	await insertNewLog(Locals.db, {
		action: 'create-project',
		actor: id,
		target: project.id
	});

	await getAllProjects().refresh();

	return project;
});

export const assignBorrowerToProject = command(assignBorrowerToProjectSchema, async (data) => {
	Guard.admin();
	const { id } = Guard.loggedIn();

	const project = await assignBorrower(Locals.db, data.projectId, data.borrowerId);

	await insertNewLog(Locals.db, {
		action: 'assign-borrower-to-project',
		actor: id,
		target: project.projectId,
		comment: `Assigned borrower "${data.borrowerId}" to project "${data.projectId}"`
	});

	await getAllMyProjects().refresh();

	return project;
});
