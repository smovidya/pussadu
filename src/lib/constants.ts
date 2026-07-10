import {
	CircleCheck,
	CircleDashed,
	CircleGauge,
	CircleSlash,
	Timer,
	PackagePlus,
	PackageSearch,
	PackageX,
	PackageMinus,
	HandCoins,
	ClipboardCheck,
	FolderPlus,
	FolderCog,
	FolderX,
	UserPlus,
	UserMinus,
	UserCog,
	UsersRound,
	ShieldBan,
	ShieldCheck,
	UserX,
	ListChecks,
	Contact,
	ContactRound,
	UserRoundX,
	BellRing
} from '@lucide/svelte';

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
		value: 'นายกสโมสรนิสิต',
		label: 'นายกสโมสรนิสิต'
	},
	{
		value: 'อุปนายกคนที่ 1',
		label: 'อุปนายกคนที่ 1'
	},
	{
		value: 'อุปนายกคนที่ 2',
		label: 'อุปนายกคนที่ 2'
	},
	{
		value: 'เลขานุการ',
		label: 'เลขานุการ'
	},
	{
		value: 'เหรัญญิก',
		label: 'เหรัญญิก'
	},
	{
		value: 'นิสิตสัมพันธ์',
		label: 'นิสิตสัมพันธ์'
	},
	{
		value: 'ศิลปะและวัฒนธรรม',
		label: 'ศิลปะและวัฒนธรรม'
	},
	{
		value: 'วิชาการ',
		label: 'วิชาการ'
	},
	{
		value: 'กีฬา',
		label: 'กีฬา'
	},
	{
		value: 'พัฒนาสังคมและบำเพ็ญประโยชน์',
		label: 'พัฒนาสังคมและบำเพ็ญประโยชน์'
	},
	{
		value: 'ชมรม กก.',
		label: 'ชมรม กก.'
	},
	{
		value: 'ชมรมไซเรน',
		label: 'ชมรมไซเรน'
	},
	{
		value: 'ชมรมวาทศิลป์',
		label: 'ชมรมวาทศิลป์'
	},
	{
		value: 'ชมรมการศึกษา',
		label: 'ชมรมการศึกษา'
	},
	{
		value: 'ชมรมอนุรักษ์',
		label: 'ชมรมอนุรักษ์'
	},
	{
		value: 'ชมรมอาสา',
		label: 'ชมรมอาสา'
	},
	{
		value: 'อื่น ๆ',
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

export const userRoleOptions = [
	{ label: 'ผู้ดูแลระบบ', value: 'admin', color: 'bg-red-50 text-red-600' },
	{ label: 'สตาฟ', value: 'staff', color: 'bg-blue-50 text-blue-600' },
	{ label: 'นิสิต', value: 'user', color: 'bg-green-50 text-green-600' }
];

export const userStatusOptions = [
	{ label: 'ปกติ', value: 'active', color: 'bg-green-50 text-green-600' },
	{ label: 'ถูกแบน', value: 'banned', color: 'bg-red-50 text-red-600' }
];

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

export const logActionOptions = [
	{ label: 'ทั้งหมด', value: 'all', icon: ListChecks, color: 'bg-stone-50 text-stone-600' },
	{
		label: 'สร้างพัสดุ',
		value: 'create-asset',
		icon: PackagePlus,
		color: 'bg-green-50 text-green-600'
	},
	{
		label: 'แก้ไขพัสดุ',
		value: 'update-asset',
		icon: PackageSearch,
		color: 'bg-blue-50 text-blue-600'
	},
	{ label: 'ลบพัสดุ', value: 'remove-asset', icon: PackageX, color: 'bg-red-50 text-red-600' },
	{
		label: 'ขอยืมพัสดุ',
		value: 'request-borrow',
		icon: HandCoins,
		color: 'bg-yellow-50 text-yellow-600'
	},
	{
		label: 'เพิ่มเข้าสต๊อก',
		value: 'add-to-stock',
		icon: PackagePlus,
		color: 'bg-green-50 text-green-600'
	},
	{
		label: 'นำออกจากสต๊อก',
		value: 'remove-from-stock',
		icon: PackageMinus,
		color: 'bg-orange-50 text-orange-600'
	},
	{
		label: 'อัปเดตคำขอยืม',
		value: 'update-borrowing-request',
		icon: ClipboardCheck,
		color: 'bg-blue-50 text-blue-600'
	},
	{
		label: 'สร้างโครงการ',
		value: 'create-project',
		icon: FolderPlus,
		color: 'bg-green-50 text-green-600'
	},
	{
		label: 'มอบหมายผู้ยืมเข้าโครงการ',
		value: 'assign-borrower-to-project',
		icon: UserPlus,
		color: 'bg-blue-50 text-blue-600'
	},
	{
		label: 'ถอดผู้ยืมออกจากโครงการ',
		value: 'unassign-borrower',
		icon: UserMinus,
		color: 'bg-orange-50 text-orange-600'
	},
	{
		label: 'แก้ไขโครงการ',
		value: 'update-project',
		icon: FolderCog,
		color: 'bg-blue-50 text-blue-600'
	},
	{ label: 'ลบโครงการ', value: 'remove-project', icon: FolderX, color: 'bg-red-50 text-red-600' },
	{
		label: 'เพิ่มผู้ใช้',
		value: 'create-student-user',
		icon: UserPlus,
		color: 'bg-green-50 text-green-600'
	},
	{
		label: 'เพิ่มผู้ใช้ (หลายคน)',
		value: 'bulk-create-student-users',
		icon: UsersRound,
		color: 'bg-green-50 text-green-600'
	},
	{
		label: 'แบนผู้ใช้ (หลายคน)',
		value: 'bulk-ban-student-users',
		icon: ShieldBan,
		color: 'bg-red-50 text-red-600'
	},
	{
		label: 'ปลดแบนผู้ใช้ (หลายคน)',
		value: 'bulk-unban-student-users',
		icon: ShieldCheck,
		color: 'bg-green-50 text-green-600'
	},
	{
		label: 'ลบผู้ใช้ (หลายคน)',
		value: 'bulk-remove-student-users',
		icon: UserX,
		color: 'bg-red-50 text-red-600'
	},
	{
		label: 'เปลี่ยนบทบาทผู้ใช้',
		value: 'set-student-role',
		icon: UserCog,
		color: 'bg-blue-50 text-blue-600'
	},
	{
		label: 'เพิ่มผู้มีสิทธิ์ยืม',
		value: 'create-borrower',
		icon: Contact,
		color: 'bg-green-50 text-green-600'
	},
	{
		label: 'แก้ไขผู้มีสิทธิ์ยืม',
		value: 'update-borrower',
		icon: ContactRound,
		color: 'bg-blue-50 text-blue-600'
	},
	{
		label: 'ลบผู้มีสิทธิ์ยืม',
		value: 'remove-borrower',
		icon: UserRoundX,
		color: 'bg-red-50 text-red-600'
	},
	{
		label: 'ส่งการแจ้งเตือนคืนพัสดุ',
		value: 'send-return-reminders',
		icon: BellRing,
		color: 'bg-yellow-50 text-yellow-600'
	}
];
