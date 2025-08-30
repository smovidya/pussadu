import { betterAuth } from 'better-auth';
import { admin, oneTap } from 'better-auth/plugins';
import { dev } from '$app/environment';
import { getDb } from '../db';
import * as authSchema from '$lib/schema/auth.schema';
import { selectBorrower } from '../models/borrower.model';
import { betterAuthOptions } from './options';
import { withCloudflare } from 'better-auth-cloudflare';
import { drizzle } from 'drizzle-orm/d1';

export const createAuth = (env: Env, cf?: IncomingRequestCfProperties) => {
	const db = getDb({ d1Binding: env.PUSSADU_DB! }); // this is the name of the binding in wrangler.jsonc
	const withCloudflareInstance = withCloudflare(
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
				maxFileSize: 5 * 1024 * 1024, // 5MB
				allowedTypes: ['.jpg', '.jpeg', '.png', '.gif'],
				additionalFields: {
					category: { type: 'string', required: false },
					isPublic: { type: 'boolean', required: false },
					description: { type: 'string', required: false }
				},
				hooks: {
					upload: {
						before: async (file, ctx) => {
							// Only allow authenticated users to upload files
							if (ctx.session === null) {
								return null;
							}
							// Track your analytics (for example)
							console.log('File uploaded:', file);
						}
					},
					download: {
						before: async (file, ctx) => {
							// Only allow user to access their own files (by default all files are public)
							if (file.isPublic === false && file.userId !== ctx.session?.user.id) {
								return null; // Blocks download
							}
							// Allow download
						}
					}
				}
			}
		},
		{
			appName: env.PUBLIC_APP_TITLE,
			baseURL: env.PUBLIC_BETTER_AUTH_URL,
			basePath: '/api/auth',
			trustedOrigins(request) {
				const url = new URL(request.url);
				if (url.origin.endsWith('.vidyachula.org')) {
					return [url.origin, env.PUBLIC_BETTER_AUTH_URL];
				}
				return [env.PUBLIC_BETTER_AUTH_URL];
			},
			secret: env.BETTER_AUTH_SECRET,
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
					// Optional configuration:
					scopes: ['email', 'profile'],
					autoSelect: false,
					cancelOnTapOutside: true,
					context: 'signin',
					hd: 'student.chula.ac.th' // Restrict to Chula domain
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
	);
	const auth = betterAuth({
		...withCloudflareInstance,
		...{
			user: {
				additionalFields: {
					ouid: {
						type: 'string',
						unique: true,
						input: false
					}
				},
				...withCloudflareInstance.user?.additionalFields
			},
			...withCloudflareInstance.user
		}
	});
	return auth;
};
