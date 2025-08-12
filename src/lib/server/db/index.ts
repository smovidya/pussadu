import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import * as schema from './schema';
import type { DrizzleConfig } from 'drizzle-orm';

interface GetDbParams {
	d1Binding?: D1Database;
	libsqlBinding?: string;
}

const options = {
	schema,
	logger: {
		logQuery(query, params) {
			console.debug(
				`\x1b[32m[drizzle]\x1b[0m Executing query: ${query} with params: ${JSON.stringify(params)}`
			);
		}
	}
} satisfies DrizzleConfig<typeof schema>;

export const getDb = ({ d1Binding, libsqlBinding }: GetDbParams) => {
	if (d1Binding) {
		return drizzleD1(d1Binding, options);
	}
	if (libsqlBinding) {
		return drizzleLibsql(libsqlBinding, options);
	}
	throw new Error(`No database binding provided ${JSON.stringify({ d1Binding, libsqlBinding })}`);
};

export type DrizzleClient = ReturnType<typeof getDb>;
export const tables = schema;
