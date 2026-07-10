import type { DrizzleClient } from '../db';
import { listDueSoonOrOverdueBorrowings } from '../models/borrowing.model';
import { insertNotification } from '../models/notification.model';
import { insertNewLog } from '../models/audit.model';
import { sendNotificationEmail } from '../helpers/email';

/**
 * Reminds borrowers to return items that are due within 24h or already
 * overdue - meant to be called once a day from the Worker's scheduled()
 * handler (see scripts/attach-scheduled-handler.mjs). Runs outside any
 * request context, so it takes its dependencies explicitly instead of going
 * through the request-scoped Locals/Platform facades used elsewhere in the app.
 *
 * One notification is created per item (each links to its own detail page),
 * but each borrower gets a single digest email listing every due/overdue item
 * rather than one email per item.
 */
export async function runReturnReminders(db: DrizzleClient, email: SendEmail, appUrl: string) {
	const borrowings = await listDueSoonOrOverdueBorrowings(db);

	const byBorrower = new Map<string, typeof borrowings>();
	for (const borrowing of borrowings) {
		if (!borrowing.borrower || !borrowing.asset) continue;
		const group = byBorrower.get(borrowing.borrowerId) ?? [];
		group.push(borrowing);
		byBorrower.set(borrowing.borrowerId, group);
	}

	let sent = 0;
	for (const [, items] of byBorrower) {
		const borrower = items[0].borrower!;

		for (const item of items) {
			const isOverdue = item.endDate.getTime() < Date.now();
			await insertNotification(db, {
				borrowerId: item.borrowerId,
				title: `${isOverdue ? 'เลยกำหนดคืนแล้ว' : 'ใกล้ถึงกำหนดคืน'}: "${item.asset!.name}"`,
				message: isOverdue
					? `คุณเลยกำหนดคืน "${item.asset!.name}" (โครงการ ${item.project?.title ?? '-'}) แล้ว โปรดรีบคืนโดยเร็ว`
					: `"${item.asset!.name}" (โครงการ ${item.project?.title ?? '-'}) ครบกำหนดคืนภายใน 24 ชั่วโมง`,
				link: `/my-borrowing/${item.id}`
			});
		}

		if (borrower.email && borrower.emailNotificationsEnabled) {
			const rows = items
				.map((item) => {
					const isOverdue = item.endDate.getTime() < Date.now();
					const detailUrl = `${appUrl}/my-borrowing/${item.id}`;
					return {
						isOverdue,
						html: `<li><strong>${item.asset!.name}</strong> (โครงการ ${item.project?.title ?? '-'}) - ${isOverdue ? 'เลยกำหนดคืนแล้ว' : 'ครบกำหนดคืนภายใน 24 ชั่วโมง'} - <a href="${detailUrl}">ดูรายละเอียด</a></li>`,
						text: `- ${item.asset!.name} (โครงการ ${item.project?.title ?? '-'}) - ${isOverdue ? 'เลยกำหนดคืนแล้ว' : 'ครบกำหนดคืนภายใน 24 ชั่วโมง'}: ${detailUrl}`
					};
				})
				.sort((a, b) => Number(b.isOverdue) - Number(a.isOverdue));

			const overdueCount = rows.filter((r) => r.isOverdue).length;
			const subject =
				overdueCount > 0
					? `คุณมีพัสดุเลยกำหนดคืน ${overdueCount} รายการ`
					: `คุณมีพัสดุใกล้ถึงกำหนดคืน ${rows.length} รายการ`;

			await sendNotificationEmail(email, {
				to: borrower.email,
				subject,
				html: `<p>สวัสดีคุณ ${borrower.name}</p><p>รายการพัสดุที่ต้องคืน:</p><ul>${rows.map((r) => r.html).join('')}</ul>`,
				text: `สวัสดีคุณ ${borrower.name}\n\nรายการพัสดุที่ต้องคืน:\n${rows.map((r) => r.text).join('\n')}`
			});
		}

		sent += items.length;
	}

	await insertNewLog(db, {
		action: 'send-return-reminders',
		actor: 'system',
		target: 'cron',
		detail: { count: sent },
		comment: `ส่งการแจ้งเตือนคืนพัสดุ ${sent} รายการ (${byBorrower.size} คน)`
	});

	return sent;
}
