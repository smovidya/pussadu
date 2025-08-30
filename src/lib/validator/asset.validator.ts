import { createInsertSchema } from 'drizzle-arktype';
import { asset } from '$lib/schema';

export const insertAssetSchema = createInsertSchema(asset);
