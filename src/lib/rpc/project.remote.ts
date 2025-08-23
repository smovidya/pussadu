import { query } from '$app/server';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import { selectAllMyProjects, selectAllProjects } from '$lib/server/models/project.model';

export const getAllProjects = query(async () => {
	Guard.admin();
	return await selectAllProjects(Locals.db);
});

export const getAllMyProjects = query(async () => {
	const { id } = Guard.loggedIn();
	return selectAllMyProjects(Locals.db, id);
});
