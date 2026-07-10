import { Platform } from './facades/request-event';

const FROM = { email: 'notify@update.vidyachula.org', name: 'ระบบยืมพัสดุ สโมสรนิสิตวิทยาศาสตร์' };

/**
 * Best-effort email send - failures are logged, not thrown, so a notification
 * hiccup never blocks the request flow that triggered it.
 */
export async function sendNotificationEmail(options: {
	to: string;
	subject: string;
	html: string;
	text: string;
}) {
	try {
		await Platform.env.EMAIL.send({
			to: options.to,
			from: FROM,
			subject: options.subject,
			html: options.html,
			text: options.text
		});
	} catch (err) {
		console.error(`[email] Failed to send "${options.subject}" to ${options.to}: ${err}`);
	}
}
