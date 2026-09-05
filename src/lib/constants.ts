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
import type { StatusTone } from '$stories/status-badge';

type TonedOption = { tone: StatusTone };

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
		tone: 'neutral'
	},
	{
		label: 'ดำเนินอยู่',
		value: 'inprogress',
		icon: Timer,
		tone: 'warning'
	},
	{
		label: 'เสร็จสิ้น',
		value: 'completed',
		icon: CircleCheck,
		tone: 'success'
	},
	{
		label: 'ประเมิน',
		value: 'evaluated',
		icon: CircleGauge,
		tone: 'info'
	},
	{ label: 'ถูกยกเลิก', value: 'cancelled', icon: CircleSlash, tone: 'destructive' }
] satisfies (TonedOption & { label: string; value: string; icon: typeof CircleCheck })[];

export const assetStatusOptions = [
	{
		label: 'พร้อมใช้งาน',
		value: 'available',
		tone: 'success'
	},
	{
		label: 'ถูกยืม',
		value: 'borrowed',
		tone: 'warning'
	},
	{
		label: 'ถูกจอง',
		value: 'reserved',
		tone: 'info'
	},
	{
		label: 'กำลังซ่อมบำรุง',
		value: 'maintenance',
		tone: 'warning'
	},
	{
		label: 'สูญหาย',
		value: 'lost',
		tone: 'destructive'
	},
	{
		label: 'ชำรุด',
		value: 'damaged',
		tone: 'destructive'
	}
] satisfies (TonedOption & { label: string; value: string })[];

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
	{ label: 'ผู้ดูแลระบบ', value: 'admin', tone: 'neutral' },
	{ label: 'สตาฟ', value: 'staff', tone: 'neutral' },
	{ label: 'นิสิต', value: 'user', tone: 'neutral' }
] satisfies (TonedOption & { label: string; value: string })[];

export const userStatusOptions = [
	{ label: 'ปกติ', value: 'active', tone: 'success' },
	{ label: 'ถูกแบน', value: 'banned', tone: 'destructive' }
] satisfies (TonedOption & { label: string; value: string })[];

export const borrowingStatus = [
	{
		label: 'ถูกยกเลิก',
		value: 'cancelled',
		tone: 'destructive'
	},
	{
		label: 'รอการอนุมัติ',
		value: 'pending',
		tone: 'info'
	},
	{
		label: 'อนุมัติแล้ว',
		value: 'approved',
		tone: 'success'
	},
	{
		label: 'ถูกปฏิเสธ',
		value: 'rejected',
		tone: 'destructive'
	},
	{
		label: 'กำลังใช้งาน',
		value: 'inuse',
		tone: 'warning'
	},
	{
		label: 'ส่งคืนแล้ว',
		value: 'returned',
		tone: 'success'
	}
] satisfies (TonedOption & { label: string; value: string })[];

export const logActionOptions = [
	{ label: 'ทั้งหมด', value: 'all', icon: ListChecks, tone: 'neutral' },
	{
		label: 'สร้างพัสดุ',
		value: 'create-asset',
		icon: PackagePlus,
		tone: 'success'
	},
	{
		label: 'แก้ไขพัสดุ',
		value: 'update-asset',
		icon: PackageSearch,
		tone: 'info'
	},
	{ label: 'ลบพัสดุ', value: 'remove-asset', icon: PackageX, tone: 'destructive' },
	{
		label: 'ขอยืมพัสดุ',
		value: 'request-borrow',
		icon: HandCoins,
		tone: 'warning'
	},
	{
		label: 'เพิ่มเข้าสต๊อก',
		value: 'add-to-stock',
		icon: PackagePlus,
		tone: 'success'
	},
	{
		label: 'นำออกจากสต๊อก',
		value: 'remove-from-stock',
		icon: PackageMinus,
		tone: 'warning'
	},
	{
		label: 'อัปเดตคำขอยืม',
		value: 'update-borrowing-request',
		icon: ClipboardCheck,
		tone: 'info'
	},
	{
		label: 'สร้างโครงการ',
		value: 'create-project',
		icon: FolderPlus,
		tone: 'success'
	},
	{
		label: 'มอบหมายผู้ยืมเข้าโครงการ',
		value: 'assign-borrower-to-project',
		icon: UserPlus,
		tone: 'info'
	},
	{
		label: 'ถอดผู้ยืมออกจากโครงการ',
		value: 'unassign-borrower',
		icon: UserMinus,
		tone: 'warning'
	},
	{
		label: 'แก้ไขโครงการ',
		value: 'update-project',
		icon: FolderCog,
		tone: 'info'
	},
	{ label: 'ลบโครงการ', value: 'remove-project', icon: FolderX, tone: 'destructive' },
	{
		label: 'เพิ่มผู้ใช้',
		value: 'create-student-user',
		icon: UserPlus,
		tone: 'success'
	},
	{
		label: 'เพิ่มผู้ใช้ (หลายคน)',
		value: 'bulk-create-student-users',
		icon: UsersRound,
		tone: 'success'
	},
	{
		label: 'แบนผู้ใช้ (หลายคน)',
		value: 'bulk-ban-student-users',
		icon: ShieldBan,
		tone: 'destructive'
	},
	{
		label: 'ปลดแบนผู้ใช้ (หลายคน)',
		value: 'bulk-unban-student-users',
		icon: ShieldCheck,
		tone: 'success'
	},
	{
		label: 'ลบผู้ใช้ (หลายคน)',
		value: 'bulk-remove-student-users',
		icon: UserX,
		tone: 'destructive'
	},
	{
		label: 'เปลี่ยนบทบาทผู้ใช้',
		value: 'set-student-role',
		icon: UserCog,
		tone: 'info'
	},
	{
		label: 'เพิ่มผู้มีสิทธิ์ยืม',
		value: 'create-borrower',
		icon: Contact,
		tone: 'success'
	},
	{
		label: 'แก้ไขผู้มีสิทธิ์ยืม',
		value: 'update-borrower',
		icon: ContactRound,
		tone: 'info'
	},
	{
		label: 'ลบผู้มีสิทธิ์ยืม',
		value: 'remove-borrower',
		icon: UserRoundX,
		tone: 'destructive'
	},
	{
		label: 'ส่งการแจ้งเตือนคืนพัสดุ',
		value: 'send-return-reminders',
		icon: BellRing,
		tone: 'warning'
	}
] satisfies (TonedOption & { label: string; value: string; icon: typeof ListChecks })[];
