export const formatDate = Intl.DateTimeFormat('th-TH', {
	year: 'numeric',
	month: 'long',
	day: 'numeric'
}).format;

const relativeTimeFormatter = new Intl.RelativeTimeFormat('th-TH', { numeric: 'auto' });

const RELATIVE_TIME_UNITS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
	{ unit: 'year', seconds: 31536000 },
	{ unit: 'month', seconds: 2592000 },
	{ unit: 'day', seconds: 86400 },
	{ unit: 'hour', seconds: 3600 },
	{ unit: 'minute', seconds: 60 },
	{ unit: 'second', seconds: 1 }
];

export function formatRelativeTime(date: Date | string | number) {
	const diffSeconds = (new Date(date).getTime() - Date.now()) / 1000;
	const absSeconds = Math.abs(diffSeconds);

	for (const { unit, seconds } of RELATIVE_TIME_UNITS) {
		if (absSeconds >= seconds || unit === 'second') {
			return relativeTimeFormatter.format(Math.round(diffSeconds / seconds), unit);
		}
	}

	return relativeTimeFormatter.format(0, 'second');
}
