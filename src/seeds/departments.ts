import { getLocalD1DB } from '../../drizzle.config';
import { drizzle } from 'drizzle-orm/libsql';
import { department } from '$lib/schema';

async function main() {
	const db = drizzle({
		connection: {
			url: `file:${getLocalD1DB()}` as string
		}
	});
	await db.insert(department).values([
		{
			id: 'bbtech',
			name: 'เทคโนโลยีชีวภาพ',
			shortName: 'BBTech'
		},
		{
			id: 'math',
			name: 'คณิตศาสตร์',
			shortName: 'Math'
		},
		{
			id: 'comsci',
			name: 'วิทยาการคอมพิวเตอร์',
			shortName: 'ComSci'
		},
		{
			id: 'chem',
			name: 'เคมี',
			shortName: 'Chem'
		},
		{
			id: 'bsac',
			name: 'เคมีประยุกต์',
			shortName: 'BSAC'
		},
		{
			id: 'bio',
			name: 'ชีววิทยา',
			shortName: 'Bio'
		},
		{
			id: 'zoo',
			name: 'สัตววิทยา',
			shortName: 'Zoo'
		},
		{
			id: 'phys',
			name: 'ฟิสิกส์',
			shortName: 'Physics'
		},
		{
			id: 'bot',
			name: 'พฤกษศาสตร์',
			shortName: 'Bot'
		},
		{
			id: 'gen',
			name: 'พันธุศาสตร์',
			shortName: 'Gen'
		},
		{
			id: 'chemtech',
			name: 'เคมีวิศวกรรม',
			shortName: 'ChemTech'
		},
		{
			id: 'geo',
			name: 'ธรณีวิทยา',
			shortName: 'Geo'
		},
		{
			id: 'envi',
			name: 'วิทยาศาสตร์สิ่งแวดล้อม',
			shortName: 'Envi'
		},
		{
			id: 'marine',
			name: 'วิทยาศาสตร์ทางทะเล',
			shortName: 'Marine'
		},
		{
			id: 'biochem',
			name: 'ชีวเคมี',
			shortName: 'BioChem'
		},
		{
			id: 'matsci',
			name: 'วัสดุศาสตร์',
			shortName: 'MatSci'
		},
		{
			id: 'micro',
			name: 'จุลชีววิทยา',
			shortName: 'Micro'
		},
		{
			id: 'imprint',
			name: 'เทคโนโลยีทางภาพและการพิมพ์',
			shortName: 'ImPrint'
		},
		{
			id: 'foodtech',
			name: 'เทคโนโลยีทางอาหาร',
			shortName: 'FoodTech'
		},
		{
			id: 'bistech',
			name: 'วิทยาศาสตร์และเทคโนโลยีอุตสาหการ',
			shortName: 'BisTech'
		}
	]);
}
main();
