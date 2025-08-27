import { query } from '$app/server';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import * as department from '$lib/server/models/department.model';

export const listDepartment = query(async () => {
	Guard.loggedIn();
	return await department.listDepartments(Locals.db);
});
