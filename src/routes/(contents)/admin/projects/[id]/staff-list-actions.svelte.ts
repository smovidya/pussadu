import { getBorrowerInfo } from '$lib/rpc/borrower.remote';
import {
	assignBorrowerToProject,
	listAllStaffsForProject,
	removeBorrowerFromProject
} from '$lib/rpc/project.remote';
import { toast } from 'svelte-sonner';
import { SvelteMap } from 'svelte/reactivity';

export type StaffInfo = {
	name: string;
	ouid: string;
	email: string;
	line_id: string;
	phone: string;
	departmentId: string;
};

export class StaffList {
	staffs: SvelteMap<string, StaffInfo> = new SvelteMap();
	editTracking: SvelteMap<string, 'edit' | 'create' | 'delete'> = new SvelteMap();
	admins: SvelteMap<string, boolean> = new SvelteMap();

	constructor(private projectId: string) {}

	async loadStaffs() {
		const staffs = await listAllStaffsForProject({
			projectId: this.projectId
		});
		for (const s of staffs) {
			this.staffs.set(s.borrower.ouid, s.borrower);
		}
	}

	async addStaff(staff: StaffInfo, isAdmin: boolean) {
		this.staffs.set(staff.ouid, staff);
		this.editTracking.set(staff.ouid, 'create');
		if (isAdmin) {
			this.admins.set(staff.ouid, true);
		}
	}

	async removeStaff(ouid: string) {
		this.staffs.delete(ouid);
		this.editTracking.set(ouid, 'delete');
		this.admins.delete(ouid);
	}

	async saveChanges() {
		if (this.editTracking.size === 0) {
			toast.info('ไม่มีการเปลี่ยนแปลงที่จะบันทึก');
			return;
		}
		for (const [ouid, action] of this.editTracking.entries()) {
			if (action === 'create' || action === 'edit') {
				const borrowerData = this.staffs.get(ouid);
				if (!borrowerData) {
					toast.error(`ไม่พบข้อมูลผู้ใช้ ${ouid}`);
					continue;
				}
				await assignBorrowerToProject({
					borrowerData,
					relations: {
						projectId: this.projectId,
						borrowerId: ouid
					}
				});

				toast.success(`เพิ่ม ${ouid} เข้าสู่โครงการเรียบร้อยแล้ว`);
			} else if (action === 'delete') {
				await removeBorrowerFromProject({
					borrowerId: ouid,
					projectId: this.projectId
				});
				toast.success(`นำ ${ouid} ออกจากโครงการเรียบร้อยแล้ว`);
			} else {
				toast.success(`ไม่พบการเปลี่ยนแปลงสำหรับ ${ouid}`);
			}
		}
	}

	async clearChanges() {
		this.editTracking.clear();
	}

	async updateInfo(ouid: string, info: Partial<StaffInfo>) {
		const staff = this.staffs.get(ouid);
		if (!staff) throw new Error('Staff not found');

		this.staffs.set(ouid, { ...staff, ...info });
		this.editTracking.set(ouid, 'edit');
	}

	async getBorrowerInfo(ouid: string) {
		return getBorrowerInfo({
			ouid
		});
	}

	get stafflistItems() {
		return this.staffs.values();
	}
}
