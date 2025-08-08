import { betterAuth } from 'better-auth';
import { admin, oneTap } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDb } from '../db';

const db = getDb({ libsqlBinding: 'file:local.db' });

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'sqlite'
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
});
