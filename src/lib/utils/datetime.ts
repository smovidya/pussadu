export const formatDate = Intl.DateTimeFormat('th-TH', {
	year: 'numeric',
	month: 'long',
	day: 'numeric'
}).format;
