import {
	assetStatusOptions,
	assetTypeOptions,
	borrowingStatus,
	projectStatusOptions,
	userRoleOptions
} from '$lib/constants';
import { formatDate } from '$lib/utils/datetime';

/** Thai labels for recurring keys inside log `detail` payloads. Unknown keys fall back to the raw key. */
export const logFieldLabels: Record<string, string> = {
	id: 'รหัส',
	name: 'ชื่อ',
	title: 'ชื่อโครงการ',
	description: 'คำอธิบาย',
	amount: 'จำนวน',
	unitTerm: 'หน่วยนับ',
	status: 'สถานะ',
	type: 'ประเภท',
	category: 'หมวดหมู่',
	categoryId: 'รหัสหมวดหมู่',
	owner: 'ฝ่ายเจ้าของ',
	startDate: 'วันเริ่มยืม',
	endDate: 'วันคืน',
	note: 'หมายเหตุ',
	adminNote: 'หมายเหตุแอดมิน',
	email: 'อีเมล',
	role: 'บทบาท',
	reason: 'เหตุผล',
	borrowerId: 'รหัสนิสิตผู้ยืม',
	ouid: 'รหัสนิสิต',
	projectId: 'รหัสโครงการ',
	assetId: 'รหัสพัสดุ',
	count: 'จำนวนที่ส่ง',
	image_url: 'รูปภาพ',
	line_id: 'LINE ID',
	phone: 'เบอร์โทรศัพท์',
	departmentId: 'รหัสภาควิชา',
	isPinned: 'ปักหมุด',
	emailNotificationsEnabled: 'รับอีเมลแจ้งเตือน',
	amountReturned: 'จำนวนที่รับคืน',
	newAmount: 'จำนวนคงเหลือ',
	difference: 'ผลต่าง',
	request: 'คำขอยืม',
	succeeded: 'สำเร็จ',
	failed: 'ล้มเหลว',
	error: 'ข้อผิดพลาด'
};

/** Bookkeeping keys hidden from key-value summaries (still visible in raw JSON). */
export const HIDDEN_KEYS = ['createdAt', 'updatedAt', 'deletedAt', 'version'];

const DATE_KEYS = new Set([
	'startDate',
	'endDate',
	'createdAt',
	'updatedAt',
	'deletedAt',
	'banExpires'
]);

// `status` values across asset/project/borrowing rarely collide, and where they do
// (lost/damaged/cancelled) the Thai labels agree — first match wins.
const enumLabels: Record<string, { value: string; label: string }[]> = {
	status: [...assetStatusOptions, ...projectStatusOptions, ...borrowingStatus],
	type: [...assetTypeOptions],
	role: userRoleOptions
};

export const labelForKey = (key: string) => logFieldLabels[key] ?? key;

export const isComplexValue = (value: unknown): value is Record<string, unknown> | unknown[] =>
	typeof value === 'object' && value !== null;

/** Format a primitive detail value for display: enum → Thai label, date-ish → th-TH date, boolean → ใช่/ไม่ใช่. */
export const formatLogValue = (key: string, value: unknown): string => {
	if (value === null || value === undefined || value === '') return '-';
	if (typeof value === 'boolean') return value ? 'ใช่' : 'ไม่ใช่';
	if (DATE_KEYS.has(key)) {
		// JSON round-trip turns Date into ISO string (or epoch number)
		const date = new Date(value as string | number);
		if (!isNaN(date.getTime())) return formatDate(date);
	}
	if (typeof value === 'string') {
		const match = enumLabels[key]?.find((opt) => opt.value === value);
		if (match) return match.label;
	}
	if (isComplexValue(value)) return JSON.stringify(value);
	return String(value);
};
