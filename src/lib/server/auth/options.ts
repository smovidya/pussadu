import type { BetterAuthOptions } from 'better-auth';

export const betterAuthOptions = (env: Env) =>
	({
		/* RATE LIMITING and SECONDARY STORAGE */
		// rate limiting works in memory by default, so we need to use a secondary storage bc our app is serverless
		// https://www.better-auth.com/docs/concepts/rate-limit
		rateLimit: {
			enabled: true,
			window: 60, // the window is 60 seconds
			max: 100, // number of requests allowed in that window
			storage: 'database'
		},
		secondaryStorage: {
			get: async (key) => {
				const value = await env.PUSSADU_KV.get(`_auth:${key}`);
				return value ? value : null;
			},
			set: async (key, value, expiresIn) => {
				await env.PUSSADU_KV.put(`_auth:${key}`, value, {
					expirationTtl: expiresIn ? expiresIn / 1000 : 60 * 60
				}); // BA.expiresIn is in ms, KV.expirationTtl needs seconds
			},
			delete: async (key) => {
				await env.PUSSADU_KV.delete(`_auth:${key}`);
			}
		}
	}) satisfies BetterAuthOptions;
