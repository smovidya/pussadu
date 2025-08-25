import { query, command } from '$app/server';
import { insertNewLog } from '$lib/server/models/audit.model';
import {
	assignBorrower,
	deleteProject,
	insertNewProject,
	selectAllMyProjects,
	selectAllProjects,
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

export const getAllProjects = query(async () => {
	Guard.admin();
	return await selectAllProjects(Locals.db);
});

export const getAllMyProjects = query(async () => {
	const { ouid } = Guard.loggedIn();
	return selectAllMyProjects(Locals.db, ouid);
});

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

	const project = await assignBorrower(Locals.db, data.projectId, data.borrowerId);

	await insertNewLog(Locals.db, {
		action: 'assign-borrower-to-project',
		actor: ouid,
		target: project.projectId,
		comment: `Assigned borrower "${data.borrowerId}" to project "${data.projectId}"`
	});

	await getAllMyProjects().refresh();

	return project;
});

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
