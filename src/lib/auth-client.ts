import { env } from '$env/dynamic/public';
import { adminClient, inferAdditionalFields, oneTapClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';
import type { createAuth } from './server/auth';
import { cloudflareClient } from 'better-auth-cloudflare/client';
import * as perm from './permission';

export const authClient = createAuthClient({
	plugins: [
		adminClient({
			ac: perm.ac,
			roles: {
				admin: perm.admin,
				user: perm.user,
				staff: perm.staff
			}
		}),
		oneTapClient({
			clientId: env.PUBLIC_GOOGLE_CLIENT_ID,
			// Optional client configuration:
			autoSelect: false,
			cancelOnTapOutside: true,
			context: 'signin',
			additionalOptions: {
				hd: 'student.chula.ac.th' // Restrict to Chula domain
			},
			// Configure prompt behavior and exponential backoff:
			promptOptions: {
				baseDelay: 1000, // Base delay in ms (default: 1000)
				maxAttempts: 5 // Maximum number of attempts before triggering onPromptNotification (default: 5)
			}
		}),
		inferAdditionalFields<ReturnType<typeof createAuth>>(),
		cloudflareClient()
	]
});

export const hasPerm = authClient.admin.hasPermission;

export type AuthClient = typeof authClient;
