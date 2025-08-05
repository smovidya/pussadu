import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
import { adminClient, inferAdditionalFields, oneTapClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';
import type { createAuth } from './server/auth';

export const authClient = createAuthClient({
	plugins: [
		adminClient(),
		oneTapClient({
			clientId: PUBLIC_GOOGLE_CLIENT_ID,
			// Optional client configuration:
			autoSelect: false,
			cancelOnTapOutside: true,
			context: 'signin',
			additionalOptions: {
				hd: 'chula.ac.th' // Restrict to Chula domain
			},
			// Configure prompt behavior and exponential backoff:
			promptOptions: {
				baseDelay: 1000, // Base delay in ms (default: 1000)
				maxAttempts: 5 // Maximum number of attempts before triggering onPromptNotification (default: 5)
			}
		}),
		inferAdditionalFields<ReturnType<typeof createAuth>>()
	]
});
