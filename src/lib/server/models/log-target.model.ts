import { eq, inArray } from 'drizzle-orm';
import { tables, type DrizzleClient } from '../db';
import type { LogTargetKind, ResolvedLogTarget } from '$lib/schema/log-details';

// Which entity a log's `target` id points to, per action (see insertNewLog call sites).
const ACTION_TARGET_KIND: Record<string, LogTargetKind> = {
	'create-asset': 'asset',
	'update-asset': 'asset',
	'remove-asset': 'asset',
	'request-borrow': 'asset',
	'add-to-stock': 'asset',
	'remove-from-stock': 'asset',
	'update-borrowing-request': 'borrow-request',
	'create-project': 'project',
	'assign-borrower-to-project': 'project',
	'unassign-borrower': 'project',
	'update-project': 'project',
	'remove-project': 'project',
	'create-student-user': 'user',
	'bulk-create-student-users': 'user',
	'bulk-ban-student-users': 'user',
	'bulk-unban-student-users': 'user',
	'bulk-remove-student-users': 'user',
	'set-student-role': 'user',
	'create-borrower': 'borrower',
	'update-borrower': 'borrower',
	'remove-borrower': 'borrower',
	'send-return-reminders': 'cron'
};

/**
 * Resolve the `target` ids of a page of logs to display names, batched per
 * entity kind (at most one query each). Bulk user actions store comma-joined
 * ids; each id is resolved individually. Deleted/unknown ids are simply
 * absent from the result and callers fall back to the raw id.
 */
export const resolveLogTargets = async (
	db: DrizzleClient,
	logs: { action: string; target: string }[]
): Promise<Record<string, ResolvedLogTarget>> => {
	const idsByKind = new Map<LogTargetKind, Set<string>>();
	for (const { action, target } of logs) {
		const kind = ACTION_TARGET_KIND[action];
		if (!kind) continue;
		for (const raw of target.split(',')) {
			const id = raw.trim();
			if (!id) continue;
			const set = idsByKind.get(kind) ?? new Set<string>();
			set.add(id);
			idsByKind.set(kind, set);
		}
	}

	const resolved: Record<string, ResolvedLogTarget> = {};
	const ids = (kind: LogTargetKind) => [...(idsByKind.get(kind) ?? [])];

	const lookups: Promise<void>[] = [];

	if (idsByKind.has('asset')) {
		lookups.push(
			db
				.select({ id: tables.asset.id, name: tables.asset.name })
				.from(tables.asset)
				.where(inArray(tables.asset.id, ids('asset')))
				.then((rows) => {
					for (const row of rows) resolved[row.id] = { kind: 'asset', name: row.name };
				})
		);
	}
	if (idsByKind.has('project')) {
		lookups.push(
			db
				.select({ id: tables.project.id, name: tables.project.title })
				.from(tables.project)
				.where(inArray(tables.project.id, ids('project')))
				.then((rows) => {
					for (const row of rows) resolved[row.id] = { kind: 'project', name: row.name };
				})
		);
	}
	if (idsByKind.has('user')) {
		lookups.push(
			db
				.select({ id: tables.user.id, name: tables.user.name })
				.from(tables.user)
				.where(inArray(tables.user.id, ids('user')))
				.then((rows) => {
					for (const row of rows) resolved[row.id] = { kind: 'user', name: row.name };
				})
		);
	}
	if (idsByKind.has('borrower')) {
		lookups.push(
			db
				.select({ id: tables.borrower.ouid, name: tables.borrower.name })
				.from(tables.borrower)
				.where(inArray(tables.borrower.ouid, ids('borrower')))
				.then((rows) => {
					for (const row of rows) resolved[row.id] = { kind: 'borrower', name: row.name };
				})
		);
	}
	if (idsByKind.has('borrow-request')) {
		lookups.push(
			db
				.select({
					id: tables.assetToProject.id,
					name: tables.asset.name,
					assetId: tables.asset.id
				})
				.from(tables.assetToProject)
				.innerJoin(tables.asset, eq(tables.assetToProject.assetId, tables.asset.id))
				.where(inArray(tables.assetToProject.id, ids('borrow-request')))
				.then((rows) => {
					for (const row of rows)
						resolved[row.id] = { kind: 'borrow-request', name: row.name, refId: row.assetId };
				})
		);
	}
	for (const id of ids('cron')) {
		resolved[id] = { kind: 'cron', name: 'ระบบ (cron)' };
	}

	await Promise.all(lookups);
	return resolved;
};
