import { getRequestEvent, query } from '$app/server';
import { selectAllMyProjects, selectAllProjects } from '$lib/server/models/project.model';
import { error } from '@sveltejs/kit';

export const getAllProjects = query(async () => {
	const { locals } = getRequestEvent();
	if (!locals.user) error(401, 'Unauthorized');
	if (!locals.user.role?.includes('admin')) {
		return error(403, 'Forbidden');
	}
	return await selectAllProjects(locals.db);
});

export const getAllMyProjects = query(async () => {
	const { locals } = getRequestEvent();
	if (!locals.user) error(401, 'Unauthorized');

	return selectAllMyProjects(locals.db, locals.user.id);
});
