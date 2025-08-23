import { dev } from '$app/environment';
import { command, getRequestEvent, query } from '$app/server';
import { department } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';

export const seed = command(async () => {
	if (!dev) error(401, 'Unauthorized');

	const { locals } = getRequestEvent();
	await locals.db.insert(department).values([
		{
			id: 'bbtech',
			name: 'เทคโนโลยีชีวภาพ',
			shortName: 'BBTECH'
		},
		{
			id: 'math',
			name: 'คณิตศาสตร์',
			shortName: 'MATH'
		},
		{
			id: 'com',
			name: 'วิทยาการคอมพิวเตอร์',
			shortName: 'COM'
		},
		{
			id: 'chem',
			name: 'เคมี',
			shortName: 'CHEM'
		},
		{
			id: 'bsac',
			name: 'เคมีประยุกต์',
			shortName: 'BSAC'
		},
		{
			id: 'bio',
			name: 'ชีววิทยา',
			shortName: 'BIO'
		},
		{
			id: 'zoo',
			name: 'สัตววิทยา',
			shortName: 'ZOO'
		},
		{
			id: 'phys',
			name: 'ฟิสิกส์',
			shortName: 'PHYS'
		},
		{
			id: 'bot',
			name: 'พฤกษศาสตร์',
			shortName: 'BOT'
		},
		{
			id: 'gen',
			name: 'พันธุศาสตร์',
			shortName: 'GEN'
		},
		{
			id: 'chemtech',
			name: 'เทคโนโลยีเคมี',
			shortName: 'CHEMTECH'
		},
		{
			id: 'geo',
			name: 'ธรณีวิทยา',
			shortName: 'GEO'
		},
		{
			id: 'envi',
			name: 'วิทยาศาสตร์สิ่งแวดล้อม',
			shortName: 'ENVI'
		},
		{
			id: 'marine',
			name: 'วิทยาศาสตร์ทางทะเล',
			shortName: 'MARINE'
		},
		{
			id: 'biochem',
			name: 'ชีวเคมี',
			shortName: 'BIOCHEM'
		},
		{
			id: 'matsci',
			name: 'วัสดุศาสตร์',
			shortName: 'MATSci'
		},
		{
			id: 'micro',
			name: 'จุลชีววิทยา',
			shortName: 'MICRO'
		},
		{
			id: 'imprint',
			name: 'เทคโนโลยีทางภาพและการพิมพ์',
			shortName: 'IMPRINT'
		},
		{
			id: 'food',
			name: 'เทคโนโลยีทางอาหาร',
			shortName: 'FOOD'
		},
		{
			id: 'bistech',
			name: 'วิทยาศาสตร์และเทคโนโลยีอุตสาหการ',
			shortName: 'BISTECH'
		}
	]);
});
