import { betterAuth } from 'better-auth';
import { admin, oneTap } from 'better-auth/plugins';

import { BETTER_AUTH_SECRET } from '$env/static/private';
import { dev } from '$app/environment';
import { PUBLIC_APP_TITLE, PUBLIC_BETTER_AUTH_URL } from '$env/static/public';

import { getDb } from '../db';
import * as authSchema from '$lib/schema/auth.schema';
import { selectBorrower } from '../models/borrower.model';
import { betterAuthOptions } from './options';
import { withCloudflare } from 'better-auth-cloudflare';
import { drizzle } from 'drizzle-orm/d1';

export const createAuth = (env: Env, cf?: IncomingRequestCfProperties) => {
	const db = getDb({ d1Binding: env.PUSSADU_DB! }); // this is the name of the binding in wrangler.jsonc
	const auth = betterAuth({
		...withCloudflare(
			{
				autoDetectIpAddress: true,
				geolocationTracking: true,
				cf: cf || {},
				d1: env
					? {
							db: drizzle(env.PUSSADU_DB),
							options: {
								schema: authSchema,
								usePlural: false
								// debugLogs: true
							}
						}
					: undefined,
				kv: env?.PUSSADU_KV,
				// Optional: Enable R2 file storage
				r2: {
					bucket: env?.PUSSADU_R2,
					maxFileSize: 10 * 1024 * 1024, // 10MB
					allowedTypes: ['.jpg', '.jpeg', '.png', '.gif'],
					additionalFields: {
						category: { type: 'string', required: false },
						isPublic: { type: 'boolean', required: false },
						description: { type: 'string', required: false }
					}
				}
			},
			{}
		),
		...{
			appName: PUBLIC_APP_TITLE,
			baseURL: PUBLIC_BETTER_AUTH_URL,
			basePath: '/api/auth',
			trustedOrigins(request) {
				const url = new URL(request.url);
				if (url.origin.endsWith('.vidyachula.org')) {
					return [url.origin, PUBLIC_BETTER_AUTH_URL];
				}
				return [PUBLIC_BETTER_AUTH_URL];
			},
			secret: BETTER_AUTH_SECRET,
			logger: {
				level: dev ? 'debug' : 'info',
				log: (level, message, ...args) => {
					// Custom logging implementation
					console.log(`[${level}] ${message}`, ...args);
				}
			},

			socialProviders: {
				google: {
					clientId: env.PUBLIC_GOOGLE_CLIENT_ID,
					clientSecret: env.GOOGLE_CLIENT_SECRET,
					scopes: ['email', 'profile'],
					// Optional configuration:
					autoSelect: false,
					cancelOnTapOutside: true,
					context: 'signin',
					additionalOptions: {
						hd: '*' // Restrict to Chula domain
					}
				}
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
									const studentInfo = await selectBorrower(db, ouid);
									return {
										data: {
											...user,
											role: studentInfo?.oldIsAdmin ? 'admin' : 'user',
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
								message:
									'โปรดเลือกอีเมลที่ถูกต้อง (@student.chula.ac.th หรือ @chula.ac.th เท่านั้น)'
							});
						}
					}
				}
			},

			...betterAuthOptions(env),

			// Keep ./better-auth.config.ts in sync with this!!!
			// run auth:generate to update the schema
			plugins: [admin(), oneTap()],

			advanced: {
				ipAddress: {
					ipAddressHeaders: ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip']
				}
			}
		}
	});
	return auth;
};
