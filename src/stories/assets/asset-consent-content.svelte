<script lang="ts">
	import * as Alert from '$stories/shadcnui/alert';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
</script>

<Alert.Root>
	<CircleAlertIcon />
	<Alert.Title>เงื่อนไขการยืมพัสดุ</Alert.Title>
	<Alert.Description>
		<p>กรุณาอ่านและยอมรับเงื่อนไขการยืมพัสดุก่อนดำเนินการ</p>
		<ul class="list-disc pl-5">
			<li>
				การคืนพัสดุต้องทำในระยะเวลาของโครงการหรือหลังจบโครงการไปได้ไม่เกิน 3 วัน โดยไม่นับวันหยุด
				เสาร์ อาทิตย์ หรือวันหยุดนักขัตฤกษ์
			</li>
			<li>
				หากไม่คืนภายใน 7 วันหลังจากหมดวาระโครงการและไม่มีการชี้แจงสาเหตุที่ไม่สามารถคืนได้ในกำหนด
				จะมีการแจ้งเตือนจากทางสโมสรนิสิต (Not final)
			</li>
		</ul>
	</Alert.Description>
</Alert.Root>
