import { query, command } from '$app/server';
import { insertNewLog } from '$lib/server/models/audit.model';
import {
	assignBorrower,
	deleteProject,
	getProject,
	getProjectMembership,
	insertNewProject,
	isBorrowerAlreadyAssignedToProject,
	selectAllMyProjects,
	selectAllProjects,
	unassignBorrower,
	updateProject
} from '$lib/server/models/project.model';
import {
	assignBorrowerToProjectSchema,
	createProjectSchema,
	updateProjectSchema
} from '$lib/validator/project.validator';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import { error } from '@sveltejs/kit';
import { type } from 'arktype';
import * as borrowerModel from '$lib/server/models/borrower.model';
import { and, eq, inArray } from 'drizzle-orm';
import { tables } from '$lib/server/db';

function isAdminRole(role: string | null | undefined) {
	return role?.split(',').includes('admin') ?? false;
}

async function requireMemberManagement(projectId: string) {
	const user = Guard.loggedIn();
	if (isAdminRole((user as typeof user & { role?: string }).role)) return { user, isAdmin: true };
	const membership = await getProjectMembership(Locals.db, projectId, user.ouid);
	if (membership?.role !== 'coordinator') {
		error(403, { message: 'เฉพาะผู้ประสานงานโครงการหรือผู้ดูแลระบบเท่านั้น' });
	}
	return { user, isAdmin: false };
}

export const getAllProjects = query(async () => {
	await Guard.allows({ permission: { project: ['list'] } });
	return await selectAllProjects(Locals.db);
});

export const getAllMyProjects = query(async () => {
	const { ouid } = Guard.loggedIn();
	return selectAllMyProjects(Locals.db, ouid);
});

export const adminGetProjectInfo = query(type({ id: 'string' }), async (data) => {
	await Guard.allows({ permission: { project: ['list'] } });
	return await getProject(Locals.db, data.id);
});

export const getProjectInfo = query(type({ id: 'string' }), async (data) => {
	const { ouid } = Guard.loggedIn();
	const isAllowed = await isBorrowerAlreadyAssignedToProject(Locals.db, data.id, ouid);
	if (!isAllowed)
		error(403, {
			message: 'คุณไม่มีสิทธิ์เข้าถึงโครงการนี้'
		});
	return await getProject(Locals.db, data.id);
});

export const getMyProjectMembership = query(type({ id: 'string' }), async (data) => {
	const { ouid } = Guard.loggedIn();
	const membership = await getProjectMembership(Locals.db, data.id, ouid);
	if (!membership) error(403, { message: 'คุณไม่ได้เป็นสมาชิกโครงการนี้' });
	return membership;
});

export const listAllStaffsForProject = query(
	type({
		projectId: 'string'
	}),
	async (data) => {
		const user = Guard.loggedIn();
		if (!isAdminRole((user as typeof user & { role?: string }).role)) {
			const membership = await getProjectMembership(Locals.db, data.projectId, user.ouid);
			if (!membership) error(403, { message: 'คุณไม่มีสิทธิ์ดูสมาชิกโครงการนี้' });
		}

		const staffs = await Locals.db.query.projectToBorrower.findMany({
			where: (projectToBorrower, { eq }) => eq(projectToBorrower.projectId, data.projectId),
			with: {
				borrower: true
			}
		});

		return staffs;
	}
);

export const createProject = command(createProjectSchema, async (data) => {
	const { ouid } = Guard.loggedIn();
	await Guard.allows({ permission: { project: ['create'] } });

	const project = await insertNewProject(Locals.db, data);

	await insertNewLog(Locals.db, {
		action: 'create-project',
		actor: ouid,
		target: project.id,
		detail: project,
		comment: `สร้างโครงการ "${project.title}"`
	});

	await getAllProjects().refresh();

	return project;
});

export const assignBorrowerToProject = command(assignBorrowerToProjectSchema, async (data) => {
	const { user, isAdmin } = await requireMemberManagement(data.relations.projectId);
	const { ouid } = user;
	if (!isAdmin && data.relations.role === 'coordinator') {
		error(403, { message: 'เฉพาะผู้ดูแลระบบเท่านั้นที่แต่งตั้งผู้ประสานงานได้' });
	}

	const isAlreadyAssigned = await isBorrowerAlreadyAssignedToProject(
		Locals.db,
		data.relations.projectId,
		data.relations.borrowerId
	);

	if (isAlreadyAssigned) {
		error(400, 'โครงการนี้มีสตาฟนี้อยู่แล้ว');
	}

	const borrower = await borrowerModel.selectBorrower(Locals.db, data.relations.borrowerId);

	if (!borrower) {
		if (!isAdmin) error(404, { message: 'ไม่พบผู้ยืม โปรดให้ผู้ดูแลระบบเพิ่มข้อมูลก่อน' });
		await borrowerModel.insertNewBorrower(Locals.db, data.borrowerData);
	} else if (isAdmin) {
		await borrowerModel.updateBorrower(Locals.db, borrower.ouid, data.borrowerData);
	}

	const project = await assignBorrower(
		Locals.db,
		data.relations.projectId,
		data.relations.borrowerId,
		data.relations.role ?? 'member'
	);

	await insertNewLog(Locals.db, {
		action: 'assign-borrower-to-project',
		actor: ouid,
		target: project.projectId,
		detail: data,
		comment: `Assigned borrower "${data.relations.borrowerId}" to project "${data.relations.projectId}"`
	});

	await getAllMyProjects().refresh();

	return project;
});

export const removeBorrowerFromProject = command(
	type({
		projectId: 'string',
		borrowerId: 'string',
		'force?': 'boolean'
	}),
	async (data) => {
		const { user, isAdmin } = await requireMemberManagement(data.projectId);
		const { ouid } = user;
		const targetMembership = await getProjectMembership(Locals.db, data.projectId, data.borrowerId);
		if (!targetMembership) error(404, { message: 'บุคคลนี้ไม่ได้เป็นสมาชิกโครงการ' });
		if (!isAdmin && targetMembership.role === 'coordinator') {
			error(403, { message: 'ผู้ประสานงานไม่สามารถนำผู้ประสานงานคนอื่นออกได้' });
		}
		if (targetMembership.role === 'coordinator') {
			const coordinators = await Locals.db.query.projectToBorrower.findMany({
				where: (membership, { and, eq }) =>
					and(eq(membership.projectId, data.projectId), eq(membership.role, 'coordinator'))
			});
			if (coordinators.length <= 1) {
				error(409, { message: 'ต้องแต่งตั้งผู้ประสานงานคนใหม่ก่อนนำคนสุดท้ายออก' });
			}
		}
		const activeRequests = await Locals.db
			.select({ id: tables.assetToProject.id })
			.from(tables.assetToProject)
			.where(
				and(
					eq(tables.assetToProject.projectId, data.projectId),
					eq(tables.assetToProject.borrowerId, data.borrowerId),
					inArray(tables.assetToProject.status, ['pending', 'approved', 'inuse'])
				)
			);
		if (activeRequests.length && !(isAdmin && data.force)) {
			error(409, {
				message: `สมาชิกมีคำขอที่ยังไม่สิ้นสุด ${activeRequests.length} รายการ ผู้ดูแลระบบสามารถยืนยันข้ามข้อจำกัดได้`
			});
		}

		const project = await unassignBorrower(Locals.db, data.projectId, data.borrowerId);

		await insertNewLog(Locals.db, {
			action: 'unassign-borrower',
			actor: ouid,
			target: project.projectId,
			detail: data,
			comment: `Unassigned borrower "${data.borrowerId}" from project "${data.projectId}"`
		});

		await getAllMyProjects().refresh();

		return project;
	}
);

export const setProjectMemberRole = command(
	type({
		projectId: 'string',
		borrowerId: 'string',
		role: '"member" | "coordinator"'
	}),
	async (data) => {
		const { ouid } = Guard.admin();
		const membership = await getProjectMembership(Locals.db, data.projectId, data.borrowerId);
		if (!membership) error(404, { message: 'บุคคลนี้ไม่ได้เป็นสมาชิกโครงการ' });
		if (membership.role === 'coordinator' && data.role === 'member') {
			const coordinators = await Locals.db.query.projectToBorrower.findMany({
				where: (row, { and, eq }) =>
					and(eq(row.projectId, data.projectId), eq(row.role, 'coordinator'))
			});
			if (coordinators.length <= 1) {
				error(409, { message: 'ต้องมีผู้ประสานงานอย่างน้อย 1 คน' });
			}
		}
		await Locals.db
			.update(tables.projectToBorrower)
			.set({ role: data.role })
			.where(
				and(
					eq(tables.projectToBorrower.projectId, data.projectId),
					eq(tables.projectToBorrower.borrowerId, data.borrowerId)
				)
			);
		await insertNewLog(Locals.db, {
			action: 'update-project-member-role',
			actor: ouid,
			target: data.projectId,
			detail: data,
			comment: `เปลี่ยนบทบาท ${data.borrowerId} เป็น ${data.role}`
		});
		return data;
	}
);

export const setProjectInfo = command(updateProjectSchema, async (data) => {
	const { ouid } = Guard.loggedIn();
	await Guard.allows({ permission: { project: ['update'] } });

	if (!data.id) error(403, 'โปรดระบุ ID ของโครงการ');

	const project = await updateProject(Locals.db, data.id, data);
	await insertNewLog(Locals.db, {
		action: 'update-project',
		actor: ouid,
		detail: data,
		target: project.id,
		comment: `Updated project "${project.id}": ${JSON.stringify(data)}`
	});

	return project;
});

export const removeProject = command(
	type({
		id: 'string'
	}),
	async (data) => {
		const { ouid } = Guard.loggedIn();
		await Guard.allows({ permission: { project: ['delete'] } });

		await deleteProject(Locals.db, data.id);

		await insertNewLog(Locals.db, {
			action: 'remove-project',
			actor: ouid,
			detail: data,
			target: data.id,
			comment: `Removed project "${data.id}"`
		});

		await getAllProjects().refresh();
	}
);
