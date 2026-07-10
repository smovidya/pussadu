// @sveltejs/adapter-cloudflare owns whatever path wrangler.jsonc's `main` points to - it
// regenerates that exact file on every build (see its index.js: `worker_dest =
// wrangler_config.main`), so a hand-written custom Worker entry placed there gets
// overwritten rather than imported from. There's no supported hook in the adapter for
// adding a scheduled()/queue() handler.
//
// Instead, this runs after `vite build` (see package.json's `deploy` script) and appends
// a `scheduled` handler directly onto the adapter's generated `_worker.js`, reusing the
// `worker_default` object it already defines. wrangler bundles `main` with esbuild at
// deploy time, which is what actually resolves the appended imports (including `$lib`,
// aliased in wrangler.jsonc) - Vite never sees this appended code since it isn't part of
// the SvelteKit route/lib graph.
import { readFileSync, writeFileSync } from 'node:fs';

const WORKER_PATH = '.svelte-kit/cloudflare/_worker.js';

const injected = `
import { getDb } from '../../src/lib/server/db';
import { runReturnReminders } from '../../src/lib/server/scheduled/return-reminders';

worker_default.scheduled = async (controller, env, ctx) => {
	const db = getDb({ d1Binding: env.PUSSADU_DB });
	ctx.waitUntil(runReturnReminders(db, env.EMAIL, env.PUBLIC_BETTER_AUTH_URL));
};
`;

const content = readFileSync(WORKER_PATH, 'utf-8');

if (content.includes('worker_default.scheduled')) {
	console.log('[attach-scheduled-handler] already present, skipping');
} else {
	writeFileSync(WORKER_PATH, `${content}\n${injected}`);
	console.log(`[attach-scheduled-handler] appended scheduled() handler to ${WORKER_PATH}`);
}
