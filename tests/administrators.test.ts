import { afterEach, beforeEach, expect, mock, test } from 'bun:test';
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { eq, getTableColumns } from 'drizzle-orm';
import * as schema from '../src/lib/schema';

// Exercise the real RPC handlers, guards, SQL reads, and audit writes. Only the
// Kit request context and Better Auth's external API boundary are substituted.
let event: any;
const remote = (...args: any[]) => {
	const handler = args.at(-1);
	const validator = args.length > 1 ? args[0] : null;
	return (input?: unknown) =>
		Object.assign(
			Promise.resolve().then(() => handler(validator ? validator.assert(input) : input)),
			{ refresh: async () => {} }
		);
};
mock.module('$app/server', () => ({
	query: remote,
	command: remote,
	getRequestEvent: () => event
}));

const {
	listAdministrators,
	searchAdministratorCandidates,
	grantAdministrator,
	createAdministrator
} = await import('../src/lib/rpc/administrator.remote');
const { setStudentUserRole } = await import('../src/lib/rpc/user.remote');
let sqlite: Database;
let db: ReturnType<typeof drizzle<typeof schema>>;
let failPromotion = false;
let nextId = 0;
let roleCalls: string[][];

beforeEach(async () => {
	sqlite = new Database(':memory:');
	for (const [name, table] of [
		['user', schema.user],
		['log', schema.log]
	] as const) {
		const columns = Object.values(getTableColumns(table)).map(
			(column) =>
				`"${column.name}" ${column.getSQLType()}${column.primary ? ' PRIMARY KEY' : ''}${column.notNull ? ' NOT NULL' : ''}`
		);
		sqlite.exec(`CREATE TABLE "${name}" (${columns.join(',')})`);
	}
	sqlite.exec('CREATE UNIQUE INDEX user_email_unique ON user(email)');
	db = drizzle(sqlite, { schema });
	failPromotion = false;
	roleCalls = [];
	nextId = 0;
	await db.insert(schema.user).values([
		{ id: 'admin', name: 'Admin', email: 'admin@chula.ac.th', ouid: 'admin', role: 'user,admin' },
		{
			id: 'staff',
			name: 'Staff Member',
			email: 'staff@chula.ac.th',
			ouid: 'staff',
			role: 'user,staff'
		},
		{
			id: 'blocked',
			name: 'Blocked Member',
			email: 'blocked@chula.ac.th',
			role: 'user',
			banned: true
		},
		{ id: 'other', name: 'Other Role', email: 'other@chula.ac.th', role: 'notadmin' }
	]);
	event = {
		request: { headers: new Headers({ cookie: 'session=test' }) },
		locals: {
			user: { id: 'admin', ouid: 'admin', role: 'user,admin', banned: false },
			db,
			auth: {
				api: {
					async createUser({ body }: any) {
						const user = {
							id: `new-${++nextId}`,
							name: body.name,
							email: body.email,
							role: 'user'
						};
						// Simulate the app's registration hook overriding requested roles.
						await db.insert(schema.user).values(user);
						return { user };
					},
					async setRole({ body, headers }: any) {
						expect(headers.get('cookie')).toBe('session=test');
						expect(Array.isArray(body.role)).toBe(true);
						if (failPromotion) throw new Error('Auth service unavailable');
						roleCalls.push(body.role);
						const [user] = await db
							.update(schema.user)
							.set({ role: body.role.join(',') })
							.where(eq(schema.user.id, body.userId))
							.returning();
						return { user };
					}
				}
			}
		}
	};
});

afterEach(() => sqlite.close());

test('all admin endpoints reject anonymous, staff, and banned administrators', async () => {
	for (const actor of [null, { role: 'user,staff' }, { role: 'admin', banned: true }]) {
		event = { ...event, locals: { ...event.locals, user: actor } };
		const status = actor ? 403 : 401;
		await expect(listAdministrators()).rejects.toMatchObject({ status });
		await expect(searchAdministratorCandidates({ search: 'staff' })).rejects.toMatchObject({
			status
		});
		await expect(grantAdministrator({ userId: 'staff' })).rejects.toMatchObject({ status });
		await expect(
			createAdministrator({ email: 'new@chula.ac.th', name: 'New Admin' })
		).rejects.toMatchObject({ status });
	}
	expect(roleCalls).toHaveLength(0);
});

test('listing matches the exact admin role and candidate search is bounded', async () => {
	expect((await listAdministrators()).map((user) => user.id)).toEqual(['admin']);
	expect(await searchAdministratorCandidates({ search: ' ' })).toEqual([]);
	expect(
		(await searchAdministratorCandidates({ search: 'staff@' })).map((user) => user.id)
	).toEqual(['staff']);
	await db.insert(schema.user).values(
		Array.from({ length: 25 }, (_, n) => ({
			id: `candidate-${n}`,
			name: `Candidate ${n}`,
			email: `candidate${n}@chula.ac.th`,
			role: 'user'
		}))
	);
	expect(await searchAdministratorCandidates({ search: 'Candidate' })).toHaveLength(20);
});

test('promotion preserves existing roles and records the actor and target', async () => {
	await grantAdministrator({ userId: 'staff' });
	expect(roleCalls[0]).toEqual(['user', 'staff', 'admin']);
	const logs = await db.select().from(schema.log);
	expect(logs).toHaveLength(1);
	expect(logs[0]).toMatchObject({
		action: 'set-student-role',
		actor: 'admin',
		target: 'staff',
		detail: { role: 'user,staff,admin' }
	});
	await grantAdministrator({ userId: 'staff' });
	expect(roleCalls).toHaveLength(1);
	await expect(grantAdministrator({ userId: 'blocked' })).rejects.toMatchObject({ status: 400 });
	await expect(grantAdministrator({ userId: 'missing' })).rejects.toMatchObject({ status: 404 });
});

test('new Chula account is normalized, promoted after registration, and audited', async () => {
	const result = await createAdministrator({
		email: ' NEW@STUDENT.CHULA.AC.TH ',
		name: '  New Admin  '
	});
	const account = await db.query.user.findFirst({ where: eq(schema.user.id, result.id) });
	expect(account).toMatchObject({
		name: 'New Admin',
		email: 'new@student.chula.ac.th',
		role: 'user,admin',
		emailVerified: false
	});
	expect((await db.select().from(schema.log)).map((log) => log.action)).toEqual([
		'create-student-user',
		'set-student-role'
	]);
});

test('invalid or duplicate new accounts do not gain admin privileges', async () => {
	for (const email of [
		'user@example.com',
		'user@chula.ac.th.evil.test',
		'bad @chula.ac.th',
		'@chula.ac.th'
	]) {
		await expect(createAdministrator({ email, name: 'User' })).rejects.toMatchObject({
			status: 400
		});
	}
	await expect(createAdministrator({ email: 'new@chula.ac.th', name: ' ' })).rejects.toMatchObject({
		status: 400
	});
	await expect(
		createAdministrator({ email: ' STAFF@CHULA.AC.TH ', name: 'Someone else' })
	).rejects.toMatchObject({ status: 409 });
	expect(roleCalls).toHaveLength(0);
});

test('partial creation failure explains recovery without silently promoting on retry', async () => {
	failPromotion = true;
	await expect(
		createAdministrator({ email: 'retry@chula.ac.th', name: 'Retry' })
	).rejects.toMatchObject({
		status: 500,
		body: { message: expect.stringContaining('สร้างบัญชีแล้ว') }
	});
	const account = await db.query.user.findFirst({
		where: eq(schema.user.email, 'retry@chula.ac.th')
	});
	expect(account?.role).toBe('user');
	failPromotion = false;
	await grantAdministrator({ userId: account!.id });
	expect(roleCalls[0]).toEqual(['user', 'admin']);
});

test('existing person role editor sends multiple roles in the format Better Auth accepts', async () => {
	await setStudentUserRole({ id: 'staff', role: 'admin' });
	expect(roleCalls[0]).toEqual(['admin', 'user']);
});
