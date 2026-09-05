import { tables, type DrizzleClient } from '../db';

export async function insertBorrowingEvent(
	db: DrizzleClient,
	data: typeof tables.borrowingEvent.$inferInsert
) {
	const [event] = await db.insert(tables.borrowingEvent).values(data).returning();
	return event;
}

export async function listBorrowingEvents(db: DrizzleClient, borrowingRequestId: string) {
	return db.query.borrowingEvent.findMany({
		where: (event, { eq }) => eq(event.borrowingRequestId, borrowingRequestId),
		orderBy: (event, { asc }) => asc(event.createdAt)
	});
}
