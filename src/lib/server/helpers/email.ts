const FROM = { email: 'notify@update.vidyachula.org', name: 'ระบบยืมพัสดุ สโมสรนิสิตวิทยาศาสตร์' };
const BRAND_COLOR = '#ca8a04';
const BRAND_NAME = 'ระบบยืมพัสดุ สโมสรนิสิตวิทยาศาสตร์ จุฬาฯ';

/**
 * Wraps body content in a minimal branded HTML email shell. Email clients don't
 * reliably support external/embedded stylesheets, so everything here is inline
 * and table-based for broad compatibility.
 */
export function renderEmailHtml(bodyHtml: string) {
	return `<!doctype html>
<html lang="th">
	<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
		<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
			<tr>
				<td align="center">
					<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
						<tr>
							<td style="background-color:${BRAND_COLOR};padding:20px 28px;">
								<span style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:0.01em;">${BRAND_NAME}</span>
							</td>
						</tr>
						<tr>
							<td style="padding:28px;color:#18181b;font-size:14px;line-height:1.7;">
								${bodyHtml}
							</td>
						</tr>
						<tr>
							<td style="padding:16px 28px;background-color:#fafafa;border-top:1px solid #e4e4e7;color:#a1a1aa;font-size:12px;line-height:1.6;">
								อีเมลนี้ส่งโดยระบบอัตโนมัติ ปรับการรับอีเมลแจ้งเตือนได้ที่ไอคอนกระดิ่งในระบบ
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	</body>
</html>`;
}

export function emailButton(url: string, label: string) {
	return `<a href="${url}" style="display:inline-block;margin-top:8px;padding:10px 22px;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;border-radius:8px;">${label}</a>`;
}

type BadgeTone = 'info' | 'success' | 'warn' | 'danger';
const BADGE_COLORS: Record<BadgeTone, { bg: string; fg: string }> = {
	info: { bg: '#dbeafe', fg: '#1e40af' },
	success: { bg: '#dcfce7', fg: '#166534' },
	warn: { bg: '#fef9c3', fg: '#854d0e' },
	danger: { bg: '#fee2e2', fg: '#991b1b' }
};

export function emailBadge(label: string, tone: BadgeTone) {
	const { bg, fg } = BADGE_COLORS[tone];
	return `<span style="display:inline-block;padding:2px 10px;border-radius:999px;background-color:${bg};color:${fg};font-size:12px;font-weight:600;white-space:nowrap;">${label}</span>`;
}

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
			html: renderEmailHtml(options.html),
			text: options.text
		});
	} catch (err) {
		console.error(`[email] Failed to send "${options.subject}" to ${options.to}: ${err}`);
	}
}
