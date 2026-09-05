import { command, query } from '$app/server';
import { error } from '@sveltejs/kit';
import { type } from 'arktype';
import { eq } from 'drizzle-orm';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import { tables } from '$lib/server/db';
import * as personModel from '$lib/server/models/person.model';
import * as projectModel from '$lib/server/models/project.model';
import { insertNewLog } from '$lib/server/models/audit.model';

const peopleFilterSchema = type({
	'query?': 'string',
	'departmentId?': 'string',
	'eligibility?': '"eligible" | "suspended"',
	'projectId?': 'string',
	'role?': '"admin" | "staff" | "user"',
	page: 'number.integer>=1',
	pageSize: 'number.integer>=10'
});

export const listPeople = query(peopleFilterSchema, async (filters) => {
	Guard.admin();
	return personModel.listPeople(Locals.db, filters);
});

export const searchProjectMemberCandidates = query(
	type({ projectId: 'string', 'query?': 'string' }),
	async ({ projectId, query: search }) => {
		const user = Guard.loggedIn();
		const isAdmin = (user as typeof user & { role?: string }).role?.split(',').includes('admin');
		if (!isAdmin) {
			const membership = await projectModel.getProjectMembership(Locals.db, projectId, user.ouid);
			if (membership?.role !== 'coordinator') {
				error(403, { message: 'เฉพาะผู้ประสานงานโครงการหรือผู้ดูแลระบบเท่านั้น' });
			}
		}
		const result = await personModel.listPeople(Locals.db, {
			query: search,
			eligibility: 'eligible',
			page: 1,
			pageSize: 50
		});
		return result.items.filter((person) => person.ouid && !person.projectIds.includes(projectId));
	}
);

export const setBorrowingEligibility = command(
	type({
		ouid: 'string',
		eligibility: '"eligible" | "suspended"',
		'reason?': 'string'
	}),
	async (data) => {
		const { ouid: actorOuid } = Guard.admin();
		const borrower = await Locals.db.query.borrower.findFirst({
			where: (row, { eq }) => eq(row.ouid, data.ouid)
		});
		if (!borrower) error(404, { message: 'ไม่พบข้อมูลผู้ยืม' });
		if (data.eligibility === 'suspended' && !data.reason?.trim()) {
			error(400, { message: 'โปรดระบุเหตุผลที่ระงับสิทธิ์' });
		}
		await Locals.db
			.update(tables.borrower)
			.set({
				borrowingEligibility: data.eligibility,
				eligibilityReason: data.eligibility === 'suspended' ? data.reason?.trim() : null,
				eligibilityUpdatedAt: new Date(),
				eligibilityUpdatedBy: actorOuid
			})
			.where(eq(tables.borrower.ouid, data.ouid));
		await insertNewLog(Locals.db, {
			action: 'set-borrowing-eligibility',
			actor: actorOuid,
			target: data.ouid,
			detail: data,
			comment: `${data.eligibility === 'eligible' ? 'คืน' : 'ระงับ'}สิทธิ์ยืมของ ${data.ouid}`
		});
		return { ...borrower, borrowingEligibility: data.eligibility };
	}
);

export const updateMyContact = command(
	type({ phone: 'string>=1', lineId: 'string>=1' }),
	async (data) => {
		const { ouid } = Guard.loggedIn();
		const borrower = await Locals.db.query.borrower.findFirst({
			where: (row, { eq }) => eq(row.ouid, ouid)
		});
		if (!borrower) error(404, { message: 'ยังไม่มีข้อมูลผู้ยืม โปรดติดต่อผู้ดูแลระบบ' });
		await Locals.db
			.update(tables.borrower)
			.set({ phone: data.phone.trim(), line_id: data.lineId.trim() })
			.where(eq(tables.borrower.ouid, ouid));
		return { phone: data.phone.trim(), lineId: data.lineId.trim() };
	}
);
