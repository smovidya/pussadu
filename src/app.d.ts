// See https://svelte.dev/docs/kit/types#app.d.ts

import type { createAuth } from '$lib/server/auth';
import type { DrizzleClient } from '$lib/server/db';

// for information about these interfaces
declare global {
	namespace App {
		interface Platform {
			env: Env;
			cf: CfProperties;
			ctx: ExecutionContext;
		}
		interface Locals {
			db: DrizzleClient;
			auth: ReturnType<typeof createAuth>;
			user: ReturnType<typeof createAuth>['$Infer']['Session']['user'] | null;
			session: ReturnType<typeof createAuth>['$Infer']['Session'] | null;
		}
	}
}

export {};
