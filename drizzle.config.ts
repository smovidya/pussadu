import { defineConfig } from 'drizzle-kit';
import fs from 'fs';
import path from 'path';

export function getLocalD1DB() {
	try {
		const basePath = path.resolve('.wrangler');
		const dbFile = fs
			.readdirSync(basePath, { encoding: 'utf-8', recursive: true })
			.find((f) => f.endsWith('.sqlite'));

		if (!dbFile) {
			throw new Error(`.sqlite file not found in ${basePath}`);
		}

		const url = path.resolve(basePath, dbFile);
		return `file:${url}`;
	} catch (err) {
		console.log(`Error  ${err.message}`);
	}
}

export default defineConfig({
	schema: './src/lib/server/db/schema/index.ts',
	dialect: 'sqlite',
	dbCredentials: {
		url: getLocalD1DB() as string
	}
});
