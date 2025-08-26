<script lang="ts">
	import * as Card from '$stories/shadcnui/card';
</script>

<Card.Root class="border-yellow-200 bg-yellow-50">
	<Card.Header>
		<h2 class="text-lg font-semibold">เงื่อนไขการยืมพัสดุ</h2>
		<p class="text-sm text-muted-foreground">กรุณาอ่านและยอมรับเงื่อนไขการยืมพัสดุก่อนดำเนินการ</p>
	</Card.Header>
	<Card.Content>
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
	</Card.Content>
</Card.Root>
