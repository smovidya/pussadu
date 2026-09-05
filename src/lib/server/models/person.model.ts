import { tables, type DrizzleClient } from '../db';
import { eq } from 'drizzle-orm';

export interface PeopleFilters {
	query?: string;
	departmentId?: string;
	eligibility?: 'eligible' | 'suspended';
	projectId?: string;
	role?: 'admin' | 'staff' | 'user';
	page: number;
	pageSize: number;
}

export async function listPeople(db: DrizzleClient, filters: PeopleFilters) {
	const [users, borrowers] = await Promise.all([
		db.query.user.findMany(),
		db.query.borrower.findMany({
			where: (borrower, { isNull }) => isNull(borrower.deletedAt),
			with: { department: true, projects: true }
		})
	]);

	const borrowersByUserId = new Map(
		borrowers.filter((borrower) => borrower.userId).map((borrower) => [borrower.userId!, borrower])
	);
	const borrowersByOuid = new Map(borrowers.map((borrower) => [borrower.ouid, borrower]));
	const seenBorrowers = new Set<string>();
	const people = users.map((user) => {
		const borrower =
			borrowersByUserId.get(user.id) ?? (user.ouid ? borrowersByOuid.get(user.ouid) : undefined);
		if (borrower) seenBorrowers.add(borrower.ouid);
		return toPerson(user, borrower);
	});
	for (const borrower of borrowers) {
		if (!seenBorrowers.has(borrower.ouid)) people.push(toPerson(undefined, borrower));
	}

	const query = filters.query?.trim().toLocaleLowerCase('th') ?? '';
	const filtered = people.filter((person) => {
		if (
			query &&
			![person.name, person.email, person.ouid, person.phone]
				.filter(Boolean)
				.some((value) => value!.toLocaleLowerCase('th').includes(query))
		)
			return false;
		if (filters.departmentId && person.departmentId !== filters.departmentId) return false;
		if (filters.eligibility && person.borrowingEligibility !== filters.eligibility) return false;
		if (filters.role && !person.globalRoles.includes(filters.role)) return false;
		if (filters.projectId && !person.projectIds.includes(filters.projectId)) return false;
		return true;
	});
	filtered.sort((a, b) => a.name.localeCompare(b.name, 'th'));
	const page = Math.max(1, filters.page);
	const pageSize = Math.min(100, Math.max(10, filters.pageSize));
	const start = (page - 1) * pageSize;
	return {
		items: filtered.slice(start, start + pageSize),
		total: filtered.length,
		page,
		pageSize,
		pageCount: Math.max(1, Math.ceil(filtered.length / pageSize))
	};
}

function toPerson(
	user: typeof tables.user.$inferSelect | undefined,
	borrower:
		| (typeof tables.borrower.$inferSelect & {
				department: typeof tables.department.$inferSelect | null;
				projects: (typeof tables.projectToBorrower.$inferSelect)[];
		  })
		| undefined
) {
	return {
		id: user?.id ?? `borrower:${borrower!.ouid}`,
		userId: user?.id ?? null,
		ouid: borrower?.ouid ?? user?.ouid ?? null,
		name: borrower?.name || user?.name || '',
		email: borrower?.email || user?.email || '',
		phone: borrower?.phone ?? null,
		lineId: borrower?.line_id ?? null,
		departmentId: borrower?.departmentId ?? null,
		departmentName: borrower?.department?.name ?? null,
		borrowingEligibility: borrower?.borrowingEligibility ?? null,
		eligibilityReason: borrower?.eligibilityReason ?? null,
		globalRoles: (user?.role ?? 'user').split(',').map((role) => role.trim()),
		banned: user?.banned ?? false,
		linked: !!user && !!borrower,
		projectIds: borrower?.projects.map((project) => project.projectId) ?? [],
		createdAt: borrower?.createdAt ?? user?.createdAt ?? null
	};
}

export async function linkBorrowerToUserByOuid(db: DrizzleClient, userId: string, ouid: string) {
	return db.update(tables.borrower).set({ userId }).where(eq(tables.borrower.ouid, ouid));
}
