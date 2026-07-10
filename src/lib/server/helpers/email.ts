const FROM = { email: 'notify@update.vidyachula.org', name: 'ระบบยืมพัสดุ สโมสรนิสิตวิทยาศาสตร์' };

/**
 * Best-effort email send - failures are logged, not thrown, so a notification
 * hiccup never blocks the flow that triggered it. Takes the SendEmail binding
 * explicitly rather than pulling it from request context, since this is also
 * called from the scheduled() handler, which has no request to attach to.
 */
export async function sendNotificationEmail(
	email: SendEmail,
	options: {
		to: string;
		subject: string;
		html: string;
		text: string;
	}
) {
	try {
		await email.send({
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
