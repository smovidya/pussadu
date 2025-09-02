import { CircleCheck, CircleDashed, CircleGauge, CircleSlash, Timer } from '@lucide/svelte';

/**
 * Used in new project form
 */
export const possibleOwnerList = [
	'นายกสโมสรนิสิต',
	'อุปนายกคนที่ 1',
	'อุปนายกคนที่ 2',
	'เลขานุการ',
	'เหรัญญิก',
	'นิสิตสัมพันธ์',
	'ศิลปะและวัฒนธรรม',
	'วิชาการ',
	'กีฬา',
	'พัฒนาสังคมและบำเพ็ญประโยชน์',
	'อื่น ๆ'
];

export const projectOwnerOptions = [
	{
		value: 'president',
		label: 'นายกสโมสรนิสิต'
	},
	{
		value: 'vice1',
		label: 'อุปนายกคนที่ 1'
	},
	{
		value: 'vice2',
		label: 'อุปนายกคนที่ 2'
	},
	{
		value: 'secretary',
		label: 'เลขานุการ'
	},
	{
		value: 'treasurer',
		label: 'เหรัญญิก'
	},
	{
		value: 'student_relation',
		label: 'นิสิตสัมพันธ์'
	},
	{
		value: 'arts',
		label: 'ศิลปะและวัฒนธรรม'
	},
	{
		value: 'academic',
		label: 'วิชาการ'
	},
	{
		value: 'sport',
		label: 'กีฬา'
	},
	{
		value: 'social_development',
		label: 'พัฒนาสังคมและบำเพ็ญประโยชน์'
	},
	{
		value: 'korkor_club',
		label: 'ชมรม กก.'
	},
	{
		value: 'sciren_club',
		label: 'ชมรมไซเรน'
	},
	{
		value: 'vata_club',
		label: 'ชมรมวาทศิลป์'
	},
	{
		value: 'education_club',
		label: 'ชมรมการศึกษา'
	},
	{
		value: 'anurak_club',
		label: 'ชมรมอนุรักษ์'
	},
	{
		value: 'asa_club',
		label: 'ชมรมอาสา'
	},
	{
		value: 'etc',
		label: 'อื่น ๆ'
	}
];

export const projectStatusOptions = [
	{
		label: 'ยังไม่เริ่ม',
		value: 'notstarted',
		icon: CircleDashed,
		color: 'bg-stone-50 text-stone-600'
	},
	{
		label: 'ดำเนินอยู่',
		value: 'inprogress',
		icon: Timer,
		color: 'bg-yellow-50 text-yellow-600'
	},
	{
		label: 'เสร็จสิ้น',
		value: 'completed',
		icon: CircleCheck,
		color: 'bg-green-50 text-green-600'
	},
	{
		label: 'ประเมิน',
		value: 'evaluated',
		icon: CircleGauge,
		color: 'bg-blue-50 text-blue-600'
	},
	{ label: 'ถูกยกเลิก', value: 'cancelled', icon: CircleSlash, color: 'bg-red-50 text-red-600' }
];

export const assetStatusOptions = [
	{
		label: 'พร้อมใช้งาน',
		value: 'available',
		color: 'bg-green-50 text-green-600'
	},
	{
		label: 'ถูกยืม',
		value: 'borrowed',
		color: 'bg-yellow-50 text-yellow-600'
	},
	{
		label: 'ถูกจอง',
		value: 'reserved',
		color: 'bg-blue-50 text-blue-600'
	},
	{
		label: 'กำลังซ่อมบำรุง',
		value: 'maintenance',
		color: 'bg-orange-50 text-orange-600'
	},
	{
		label: 'สูญหาย',
		value: 'lost',
		color: 'bg-red-50 text-red-600'
	},
	{
		label: 'ชำรุด',
		value: 'damaged',
		color: 'bg-gray-50 text-gray-600'
	}
];

export const assetTypeOptions = [
	{
		label: 'พัสดุ',
		value: 'normal',
		desc: 'ของใช้ที่ใช้แล้วหมดไป เช่น กระดาษ'
	},
	{
		label: 'ครุภัณฑ์',
		value: 'durable',
		desc: 'ของใช้ที่มีอายุการใช้งานยาวนาน เช่น โต๊ะ เก้าอี้'
	},
	{
		label: 'กุญแจ',
		value: 'key',
		desc: 'ก็กุญแจ'
	}
] as const;

export const borrowingStatus = [
	{
		label: 'สูญหาย',
		value: 'lost',
		color: 'bg-red-50 text-black'
	},
	{
		label: 'ชำรุด',
		value: 'damaged',
		color: 'bg-gray-50 text-gray-600'
	},
	{
		label: 'ถูกยกเลิก',
		value: 'cancelled',
		color: 'bg-red-50 text-red-600'
	},
	{
		label: 'รอการอนุมัติ',
		value: 'pending',
		color: 'bg-blue-50 text-blue-600'
	},
	{
		label: 'อนุมัติแล้ว',
		value: 'approved',
		color: 'bg-green-700 text-green-200'
	},
	{
		label: 'ถูกปฏิเสธ',
		value: 'rejected',
		color: 'bg-red-50 text-red-600'
	},
	{
		label: 'กำลังใช้งาน',
		value: 'inuse',
		color: 'bg-purple-800 text-purple-200'
	},
	{
		label: 'ส่งคืนแล้ว',
		value: 'returned',
		color: 'bg-gray-50 text-gray-600'
	}
];
