import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import * as child_process from 'node:child_process';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		experimental: {
			remoteFunctions: true
		},
		alias: {
			$stories: 'src/stories',
			'$stories/*': 'src/stories'
		},
		version: {
			name: child_process.execSync('git rev-parse HEAD').toString().trim(),
			pollInterval: 30_000 // 30 seconds
		}
	}
};

export default config;
