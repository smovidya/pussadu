import { query, command } from '$app/server';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import {
	deleteBorrower,
	insertNewBorrower,
	selectAllBorrowers,
	selectBorrower,
	updateBorrower
} from '$lib/server/models/borrower.model';
import { insertNewLog } from '$lib/server/models/audit.model';
import { createBorrowerSchema, updateBorrowerSchema } from '$lib/validator/borrower.validator';
import { type } from 'arktype';
import { error } from '@sveltejs/kit';

export const getMyBorrowerData = query(async () => {
	const { ouid } = Guard.loggedIn();

	return await selectBorrower(Locals.db, ouid);
});

export const getBorrowerInfo = query(type({ ouid: 'string' }), async (data) => {
	await Guard.allows({ permission: { borrower: ['list'] } });

	const borrower = await selectBorrower(Locals.db, data.ouid);
	if (!borrower) error(404);
	return borrower;
});

export const listAllBorrowers = query(async () => {
	await Guard.allows({
		permission: {
			borrower: ['list']
		}
	});

	return await selectAllBorrowers(Locals.db, { limit: 100, offset: 0 });
});

export const createBorrower = command(createBorrowerSchema, async (data) => {
	const { ouid: actorOuid } = Guard.loggedIn();
	await Guard.allows({ permission: { borrower: ['create'] } });

	const existing = await selectBorrower(Locals.db, data.ouid);
	if (existing) error(400, 'มีเลขนิสิตนี้อยู่ในระบบแล้ว');

	const borrower = await insertNewBorrower(Locals.db, data);

	await insertNewLog(Locals.db, {
		action: 'create-borrower',
		actor: actorOuid,
		target: borrower.ouid,
		detail: borrower,
		comment: `เพิ่มผู้มีสิทธิ์ยืม "${borrower.name}" (${borrower.ouid})`
	});

	await listAllBorrowers().refresh();

	return borrower;
});

export const updateBorrowerInfo = command(updateBorrowerSchema, async (data) => {
	const { ouid: actorOuid } = Guard.loggedIn();
	await Guard.allows({ permission: { borrower: ['update'] } });

	if (!data.ouid) error(400, 'โปรดระบุเลขนิสิต');

	const borrower = await updateBorrower(Locals.db, data.ouid, data);

	await insertNewLog(Locals.db, {
		action: 'update-borrower',
		actor: actorOuid,
		target: data.ouid,
		detail: data,
		comment: `แก้ไขข้อมูลผู้มีสิทธิ์ยืม "${data.ouid}"`
	});

	await listAllBorrowers().refresh();

	return borrower;
});

export const removeBorrower = command(type({ ouid: 'string' }), async (data) => {
	const { ouid: actorOuid } = Guard.loggedIn();
	await Guard.allows({ permission: { borrower: ['delete'] } });

	await deleteBorrower(Locals.db, data.ouid);

	await insertNewLog(Locals.db, {
		action: 'remove-borrower',
		actor: actorOuid,
		target: data.ouid,
		detail: { ouid: data.ouid },
		comment: `ลบผู้มีสิทธิ์ยืม "${data.ouid}"`
	});

	await listAllBorrowers().refresh();
});
