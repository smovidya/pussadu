import { dev } from '$app/environment';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { makeSignature } from 'better-auth/crypto';
import { tables } from '$lib/server/db';
import type { RequestHandler } from './$types';

/**
 * Dev-only mock-session bootstrap: `GET /dev-login?ouid=6xxxxxxxxx&role=admin`
 * signs the browser in as that user, no Google OAuth needed. Never reachable
 * in production - `dev` is statically inlined to `false` in prod builds, so
 * this whole route becomes dead code there; the runtime check below is
 * cheap, redundant insurance on top of that.
 *
 * Mints a real session directly via better-auth's internal adapter rather
 * than going through any sign-in flow (no password/OAuth involved at all):
 * `internalAdapter.createSession(userId)` returns a session row with a raw
 * `.token`; better-auth's session cookie value is that token plus an HMAC
 * signature (`${token}.${makeSignature(token, secret)}`, from
 * `better-auth/crypto`) - the exact format `auth.api.getSession()` expects,
 * so the untouched session-lookup path in hooks.server.ts validates it with
 * no special-casing.
 */
interface DevAuthContext {
	secret: string;
	authCookies: {
		sessionToken: {
			name: string;
			attributes: {
				path: string;
				httpOnly: boolean;
				sameSite: 'lax' | 'strict' | 'none';
				secure: boolean;
				maxAge?: number;
				domain?: string;
			};
		};
	};
	internalAdapter: {
		findUserByEmail(email: string): Promise<{ user: { id: string; email: string } } | null>;
		createUser(user: {
			email: string;
			name: string;
			emailVerified: boolean;
		}): Promise<{ id: string; email: string }>;
		createSession(userId: string): Promise<{ token: string }>;
	};
}

const VALID_ROLES = ['admin', 'staff', 'user'];

export const GET: RequestHandler = async (event) => {
	if (!dev) error(404);

	const ouid = event.url.searchParams.get('ouid') ?? '';
	const role = event.url.searchParams.get('role') ?? 'user';

	if (!/^\d{6,10}$/.test(ouid)) {
		error(400, 'ouid must be a 6-10 digit string, e.g. ?ouid=6001234567&role=admin');
	}
	if (!VALID_ROLES.includes(role)) {
		error(400, `role must be one of: ${VALID_ROLES.join(', ')}`);
	}

	const email = `${ouid}@student.chula.ac.th`;
	const ctx = await (event.locals.auth as unknown as { $context: Promise<DevAuthContext> })
		.$context;

	const existing = await ctx.internalAdapter.findUserByEmail(email);
	const user =
		existing?.user ??
		(await ctx.internalAdapter.createUser({
			email,
			name: `Dev ${role} (${ouid})`,
			emailVerified: true
		}));

	// The signup hook (databaseHooks.user.create.before) always overrides role based
	// on a matching borrower.oldIsAdmin row, and doesn't know about 'staff' at all -
	// force the requested role directly, bypassing the hook entirely.
	await event.locals.db.update(tables.user).set({ role }).where(eq(tables.user.id, user.id));

	const session = await ctx.internalAdapter.createSession(user.id);
	const signedToken = `${session.token}.${await makeSignature(session.token, ctx.secret)}`;

	event.cookies.set(
		ctx.authCookies.sessionToken.name,
		signedToken,
		ctx.authCookies.sessionToken.attributes
	);

	redirect(303, '/');
};
