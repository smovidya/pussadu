import { query, command } from '$app/server';
import { insertNewLog } from '$lib/server/models/audit.model';
import { selectAllUsers, selectUserDirectory } from '$lib/server/models/user.model';
import {
	bulkBanSchema,
	bulkCreateStudentUsersSchema,
	bulkIdsSchema,
	createStudentUserSchema,
	setRoleSchema
} from '$lib/validator/user.validator';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals, LocalRequest } from '$lib/server/helpers/facades/request-event';

/**
 * `Locals.auth`'s type loses the admin plugin's endpoints through the
 * `betterAuth({ ...withCloudflareInstance })` spread in `src/lib/server/auth/index.ts`
 * (same gap `guard.ts`'s `userHasPermission` call already has). Narrow cast to the
 * subset of the admin plugin API (see `better-auth/plugins/admin/routes.ts`) actually used here.
 */
interface AdminApi {
	createUser(args: {
		headers: Headers;
		body: { email: string; name: string; role?: string };
	}): Promise<{ user: { id: string; email: string; name: string } }>;
	banUser(args: {
		headers: Headers;
		body: { userId: string; banReason?: string };
	}): Promise<{ user: unknown }>;
	unbanUser(args: { headers: Headers; body: { userId: string } }): Promise<{ user: unknown }>;
	removeUser(args: { headers: Headers; body: { userId: string } }): Promise<{ success: boolean }>;
	setRole(args: {
		headers: Headers;
		body: { userId: string; role: string };
	}): Promise<{ user: { id: string; email: string } }>;
}

const adminApi = () => Locals.auth.api as unknown as AdminApi;

export const getAllStudentUsers = query(async () => {
	Guard.admin();
	return await selectAllUsers(Locals.db);
});

/** ouid -> name/email lookup, used by /admin/log to resolve actors to a person. */
export const getUserDirectory = query(async () => {
	Guard.admin();
	return await selectUserDirectory(Locals.db);
});

export const createStudentUser = command(createStudentUserSchema, async (data) => {
	const { ouid } = Guard.admin();
	const { headers } = LocalRequest;

	const { user } = await adminApi().createUser({
		headers,
		body: { email: data.email, name: data.name, role: 'user' }
	});

	await insertNewLog(Locals.db, {
		action: 'create-student-user',
		actor: ouid,
		target: user.id,
		detail: { id: user.id, email: user.email, name: user.name },
		comment: `เพิ่มผู้ใช้ "${data.email}"`
	});

	await getAllStudentUsers().refresh();

	return user;
});

export const bulkCreateStudentUsers = command(bulkCreateStudentUsersSchema, async (data) => {
	const { ouid } = Guard.admin();
	const { headers } = LocalRequest;

	const succeeded: { email: string; id: string }[] = [];
	const failed: { email: string; error: string }[] = [];

	for (const row of data.rows) {
		try {
			const { user } = await adminApi().createUser({
				headers,
				body: { email: row.email, name: row.name, role: 'user' }
			});
			succeeded.push({ email: row.email, id: user.id });
		} catch (e) {
			failed.push({ email: row.email, error: e instanceof Error ? e.message : 'ไม่ทราบสาเหตุ' });
		}
	}

	await insertNewLog(Locals.db, {
		action: 'bulk-create-student-users',
		actor: ouid,
		target: succeeded.map((s) => s.id).join(','),
		detail: { succeeded, failed },
		comment: `เพิ่มผู้ใช้จำนวน ${succeeded.length} คน (ล้มเหลว ${failed.length} คน)`
	});

	await getAllStudentUsers().refresh();

	return { succeeded, failed };
});

export const bulkBanStudentUsers = command(bulkBanSchema, async (data) => {
	const { ouid } = Guard.admin();
	const { headers } = LocalRequest;

	const succeeded: string[] = [];
	const failed: { id: string; error: string }[] = [];

	for (const id of data.ids) {
		try {
			await adminApi().banUser({
				headers,
				body: { userId: id, banReason: data.reason }
			});
			succeeded.push(id);
		} catch (e) {
			failed.push({ id, error: e instanceof Error ? e.message : 'ไม่ทราบสาเหตุ' });
		}
	}

	await insertNewLog(Locals.db, {
		action: 'bulk-ban-student-users',
		actor: ouid,
		target: succeeded.join(','),
		detail: { succeeded, failed, reason: data.reason },
		comment: `แบนผู้ใช้จำนวน ${succeeded.length} คน (ล้มเหลว ${failed.length} คน)`
	});

	await getAllStudentUsers().refresh();

	return { succeeded, failed };
});

export const bulkUnbanStudentUsers = command(bulkIdsSchema, async (data) => {
	const { ouid } = Guard.admin();
	const { headers } = LocalRequest;

	const succeeded: string[] = [];
	const failed: { id: string; error: string }[] = [];

	for (const id of data.ids) {
		try {
			await adminApi().unbanUser({
				headers,
				body: { userId: id }
			});
			succeeded.push(id);
		} catch (e) {
			failed.push({ id, error: e instanceof Error ? e.message : 'ไม่ทราบสาเหตุ' });
		}
	}

	await insertNewLog(Locals.db, {
		action: 'bulk-unban-student-users',
		actor: ouid,
		target: succeeded.join(','),
		detail: { succeeded, failed },
		comment: `ปลดแบนผู้ใช้จำนวน ${succeeded.length} คน (ล้มเหลว ${failed.length} คน)`
	});

	await getAllStudentUsers().refresh();

	return { succeeded, failed };
});

export const bulkRemoveStudentUsers = command(bulkIdsSchema, async (data) => {
	const { ouid } = Guard.admin();
	const { headers } = LocalRequest;

	const succeeded: string[] = [];
	const failed: { id: string; error: string }[] = [];

	for (const id of data.ids) {
		try {
			await adminApi().removeUser({
				headers,
				body: { userId: id }
			});
			succeeded.push(id);
		} catch (e) {
			failed.push({ id, error: e instanceof Error ? e.message : 'ไม่ทราบสาเหตุ' });
		}
	}

	await insertNewLog(Locals.db, {
		action: 'bulk-remove-student-users',
		actor: ouid,
		target: succeeded.join(','),
		detail: { succeeded, failed },
		comment: `ลบผู้ใช้จำนวน ${succeeded.length} คน (ล้มเหลว ${failed.length} คน)`
	});

	await getAllStudentUsers().refresh();

	return { succeeded, failed };
});

export const setStudentUserRole = command(setRoleSchema, async (data) => {
	const { ouid } = Guard.admin();
	const { headers } = LocalRequest;

	// Every account keeps 'user' as its base role regardless of any additional role granted.
	const roles = new Set(
		data.role
			.split(',')
			.map((r) => r.trim())
			.filter(Boolean)
	);
	roles.add('user');
	const role = Array.from(roles).join(',');

	const { user } = await adminApi().setRole({
		headers,
		body: { userId: data.id, role }
	});

	await insertNewLog(Locals.db, {
		action: 'set-student-role',
		actor: ouid,
		target: data.id,
		detail: { role },
		comment: `เปลี่ยนบทบาทของ "${user.email}" เป็น "${role}"`
	});

	await getAllStudentUsers().refresh();

	return user;
});
