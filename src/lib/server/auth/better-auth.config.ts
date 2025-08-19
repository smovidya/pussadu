import { betterAuth } from 'better-auth';
import { admin, oneTap } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as authSchema from '../db/schema/auth.schema';
import { getDb } from '../db';
import { withCloudflare } from 'better-auth-cloudflare';

const db = getDb({ libsqlBinding: 'file:local.db' });

export const auth = betterAuth({
	...withCloudflare(
		{
			autoDetectIpAddress: true,
			geolocationTracking: true,
			cf: {},
			d1: {
				db: undefined
			},
			kv: undefined,
			// Optional: Enable R2 file storage
			r2: {
				bucket: undefined,
				maxFileSize: 10 * 1024 * 1024, // 10MB
				allowedTypes: ['.jpg', '.jpeg', '.png', '.gif'],
				additionalFields: {
					category: { type: 'string', required: false },
					isPublic: { type: 'boolean', required: false },
					description: { type: 'string', required: false },
					uploadedBy: { type: 'string', required: false }
				}
			}
		},
		{
			database: drizzleAdapter(db, {
				provider: 'sqlite',
				schema: authSchema
			}),
			socialProviders: {
				google: {
					clientId: '',
					clientSecret: '',
					scopes: ['email', 'profile'],
					// Optional configuration:
					autoSelect: false,
					cancelOnTapOutside: true,
					context: 'signin',
					additionalOptions: {
						hd: 'chula.ac.th' // Restrict to Chula domain
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

			plugins: [admin(), oneTap()]
		}
	)
});
