import { command, query } from '$app/server';
import { error } from '@sveltejs/kit';
import { type } from 'arktype';
import { eq } from 'drizzle-orm';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals, LocalRequest } from '$lib/server/helpers/facades/request-event';
import { tables } from '$lib/server/db';
import {
	selectAdministrators,
	searchAdministratorAccounts,
	selectUserById
} from '$lib/server/models/user.model';
import { insertNewLog } from '$lib/server/models/audit.model';
import type { AdminApi } from './user.remote';

const adminApi = () => Locals.auth.api as unknown as AdminApi;

export const listAdministrators = query(async () => {
	Guard.admin();
	return selectAdministrators(Locals.db);
});

export const searchAdministratorCandidates = query(
	type({ search: 'string<=120' }),
	async ({ search }) => {
		Guard.admin();
		const term = search.trim();
		return term.length < 2 ? [] : searchAdministratorAccounts(Locals.db, term);
	}
);

async function promoteAccount(userId: string, actor: string) {
	const account = await selectUserById(Locals.db, userId);
	if (!account) error(404, 'ไม่พบบัญชีผู้ใช้');
	if (account.banned) error(400, 'บัญชีนี้ถูกระงับ โปรดปลดระงับก่อนเพิ่มเป็นผู้ดูแลระบบ');
	const roles = new Set(
		(account.role ?? 'user')
			.split(',')
			.map((role) => role.trim())
			.filter(Boolean)
	);
	if (roles.has('admin')) return { id: account.id, email: account.email };
	roles.add('user');
	roles.add('admin');
	const { user } = await adminApi().setRole({
		headers: LocalRequest.headers,
		body: { userId, role: Array.from(roles) }
	});
	await insertNewLog(Locals.db, {
		action: 'set-student-role',
		actor,
		target: userId,
		detail: { role: Array.from(roles).join(',') },
		comment: `เพิ่มสิทธิ์ผู้ดูแลระบบให้ "${account.email}"`
	});
	return user;
}

export const grantAdministrator = command(type({ userId: 'string>=1' }), async ({ userId }) => {
	const { ouid } = Guard.admin();
	const account = await promoteAccount(userId, ouid);
	await listAdministrators().refresh();
	return account;
});

export const createAdministrator = command(
	type({ email: 'string<=254', name: 'string<=200' }),
	async (input) => {
		const { ouid } = Guard.admin();
		const email = input.email.trim().toLowerCase();
		const name = input.name.trim();
		if (!name) error(400, 'โปรดระบุชื่อ-นามสกุล');
		const existing = await Locals.db.query.user.findFirst({
			where: eq(tables.user.email, email),
			columns: { id: true }
		});
		if (existing) error(409, 'อีเมลนี้มีบัญชีแล้ว โปรดเลือกจากแท็บบัญชีที่มีอยู่');
		// The existing registration hook assigns the base role and links borrower data.
		// Promote afterwards so that hook cannot overwrite the requested admin role.
		const { user } = await adminApi().createUser({
			headers: LocalRequest.headers,
			body: { email, name, role: 'user' }
		});
		await insertNewLog(Locals.db, {
			action: 'create-student-user',
			actor: ouid,
			target: user.id,
			detail: { id: user.id, email: user.email, name: user.name },
			comment: `สร้างบัญชี "${email}" สำหรับผู้ดูแลระบบ`
		});
		try {
			await promoteAccount(user.id, ouid);
		} catch {
			error(
				500,
				'สร้างบัญชีแล้ว แต่เพิ่มสิทธิ์ผู้ดูแลระบบไม่สำเร็จ โปรดค้นหาอีเมลนี้ในแท็บบัญชีที่มีอยู่แล้วลองอีกครั้ง'
			);
		}
		await listAdministrators().refresh();
		return { id: user.id, email: user.email };
	}
);
