import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { exec } from 'node:child_process';
import { promisify } from 'util';

const pexec = promisify(exec);
let [version, lastmod] = (
	await Promise.allSettled([
		pexec('git describe --tags || git rev-parse --short HEAD'),
		pexec('git log -1 --format=%cd --date=format:"%Y-%m-%d %H:%M"')
	])
).map((v) => JSON.stringify(v.value?.stdout.trim()));

export default defineConfig({
	define: {
		__APP_VERSION__: version ?? '"unknown"',
		__APP_LASTMOD__: lastmod ?? '"unknown"'
	},
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()]
});
