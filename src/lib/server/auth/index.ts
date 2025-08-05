import { betterAuth } from 'better-auth';
import { admin, oneTap } from 'better-auth/plugins';
import { drizzleAdapter as drizzleAdapterForBetterAuth } from 'better-auth/adapters/drizzle';

import { BETTER_AUTH_SECRET } from '$env/static/private';
import { dev } from '$app/environment';
import { PUBLIC_APP_TITLE, PUBLIC_BETTER_AUTH_URL } from '$env/static/public';

import { getDb } from '../db';
import * as authSchema from '../db/schema/auth.schema';
import { getBorrowerByOuid } from '../models/borrower.model';
import { betterAuthOptions } from './options';

export const createAuth = (env: Env) => {
	const db = getDb({ d1Binding: env.PUSSADU_DB! }); // this is the name of the binding in wrangler.jsonc
	const auth = betterAuth({
		appName: PUBLIC_APP_TITLE,
		baseURL: PUBLIC_BETTER_AUTH_URL,
		basePath: '/api/auth',
		secret: BETTER_AUTH_SECRET,
		logger: {
			level: dev ? 'debug' : 'info'
		},

		user: {
			additionalFields: {
				ouid: {
					type: 'string',
					unique: true,
					input: false
				}
			}
		},

		databaseHooks: {
			user: {
				create: {
					async before(user, context) {
						if (
							user.email.endsWith('@chula.ac.th') ||
							user.email.endsWith('@student.chula.ac.th')
						) {
							console.log(`[auth] Creating user: ${JSON.stringify(user)}`);
							const ouid = user.email.split('@')[0];
							try {
								const studentInfo = await getBorrowerByOuid(db, ouid);
								return {
									data: {
										...user,
										name: studentInfo?.name || user.name,
										ouid
									}
								};
							} catch (err) {
								console.error(`[auth] Error fetching student info: ${err}`);
								return {
									data: {
										...user,
										ouid
									}
								};
							}
						}

						console.error(`[auth] Error: invalid-email ${JSON.stringify(user)}`);
						throw context?.error('FORBIDDEN', {
							code: 'invalid-email',
							message: 'โปรดเลือกอีเมลที่ถูกต้อง (@student.chula.ac.th หรือ @chula.ac.th เท่านั้น)'
						});
					}
				}
			}
		},

		database: drizzleAdapterForBetterAuth(db, {
			provider: 'sqlite',
			schema: authSchema
		}),

		...betterAuthOptions(env),

		// Keep ./better-auth.config.ts in sync with this!!!
		// run auth:generate to update the schema
		plugins: [admin(), oneTap()]
	});
	return auth;
};
