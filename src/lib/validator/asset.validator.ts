import { createInsertSchema, createUpdateSchema } from 'drizzle-arktype';
import { asset } from '$lib/schema';

export const insertAssetSchema = createInsertSchema(asset);
export const updateAssetSchema = createUpdateSchema(asset);
