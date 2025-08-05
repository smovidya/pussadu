import { betterAuth } from 'better-auth';
import { admin, oneTap } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDb } from '../db';

const db = getDb({ libsqlBinding: 'file:local.db' });

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'sqlite'
	}),
	plugins: [admin(), oneTap()]
});
