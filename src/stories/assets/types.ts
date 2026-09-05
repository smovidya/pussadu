export interface AssetView {
	id: string;
	name: string;
	description: string | null;
	type: 'normal' | 'durable' | 'key';
	status: 'available' | 'borrowed' | 'reserved' | 'maintenance' | 'lost' | 'damaged';
	amount: number;
	totalAmount: number;
	availableAmount: number;
	usableAmount: number;
	reservedAmount: number;
	inUseAmount: number;
	maintenanceAmount: number;
	damagedAmount: number;
	lostAmount: number;
	catalogState: 'active' | 'paused' | 'retired';
	needsInventoryReview: boolean;
	unitTerm: string;
	image_url: string | null;
	category: string;
	owner:
		| 'president'
		| 'vice1'
		| 'vice2'
		| 'secretary'
		| 'treasurer'
		| 'student_relation'
		| 'arts'
		| 'academic'
		| 'sport'
		| 'social_development'
		| 'korkor_club'
		| 'sciren_club'
		| 'vata_club'
		| 'education_club'
		| 'anurak_club'
		| 'asa_club'
		| 'etc';
	categoryId?: string | null;
	createdAt: Date | null;
	updatedAt: Date | null;
	deletedAt: Date | null;
}

export interface BorrowingProjectView {
	id: string;
	title: string;
	status?: 'notstarted' | 'inprogress' | 'completed' | 'evaluated' | 'cancelled';
}
