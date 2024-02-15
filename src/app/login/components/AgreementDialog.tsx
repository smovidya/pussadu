import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

const AgreementDialog = () => {
  return (
    <AlertDialog>
        <AlertDialogTrigger>
            <div className="flex">
                <input type="checkbox" name="agreement" id="agreement" className="mr-2" readOnly />
                <p className=" font-noto-sans">ยอมรับนโยบายการจัดเก็บข้อมูลส่วนตัว</p>
            </div>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle className=" font-noto-sans">นโยบายการจัดเก็บข้อมูลส่วนบุคคล</AlertDialogTitle>
            <AlertDialogDescription className=" font-noto-sans">
            สโมสรนิสิตคณะวิทยาศาสตร์จุฬาลงกรณ์มหาวิทยาลัยให้ความสำคัญต่อความปลอดภัยของข้อมูลส่วนบุคคลของท่าน และเพื่อช่วยให้เราปกป้องข้อมูลส่วนบุคคล (โดยอ้างอิงนิยามของข้อมูลส่วนบุคคลในพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562) ของท่านให้ปลอดภัย ตามมาตรฐานสูงสุดสอดคล้องกับพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 สโมสรนิสิตคณะวิทยาศาสตร์ จุฬาลงกรณ์มหาวิทยาลัยขอความยินยอมจากท่านเพื่อการดำเนินการลงประชามติสำหรับนิสิตคณะวิทยาศาสตร์ รวมถึงบทบาทที่เกี่ยวข้อง ดังนั้นเราได้กำหนดนโยบายการเก็บรวบรวมข้อมูลส่วนบุคคลดังต่อไปนี้
เพื่อตรวจสอบสิทธิในการลงประชามติของท่าน เราขอเข้าถึงข้อมูลส่วนบุคคลของท่านผ่านระบบ Chula Single Sign-On (Chula SSO) ซึ่งรวมถึงชื่อ รหัสประจำตัวนิสิต ปีการศึกษา และคณะที่ท่านสังกัด โดยมีเพียงรหัสประจำตัวนิสิตของท่านที่จะถูกบันทึกลงในระบบเพื่อป้องกันไม่ให้มีการลงคะแนนซ้ำซ้อน อย่างไรก็ตาม ระบบจะไม่เปิดเผยว่าท่านได้ลงคะแนนให้กับตัวเลือกใด
ภายหลังจากประกาศผลประชามติอย่างเป็นทางการในช่องทางที่ได้ประกาศไว้แล้ว เราจะทำการทำลายข้อมูลของท่านที่ได้บันทึกลงในระบบภายในเวลา 15 วัน เพื่อเป็นการยืนยันว่าข้อมูลส่วนบุคคลของท่านจะได้รับการปกป้องและไม่ถูกนำไปใช้เพื่อวัตถุประสงค์อื่นใดนอกจากการลงประชามติเท่านั้น
เพื่อปรับปรุงความถูกต้องของข้อมูลในระบบ เราอาจเก็บข้อมูลการใช้งานผ่านระบบคอมพิวเตอร์หรืออุปกรณ์ที่ใช้ในการเข้าถึงเว็บไซต์ เช่น ประเภทของเบราว์เซอร์และคุกกี้ ข้อมูลเหล่านี้จะช่วยให้เราเข้าใจวิธีการใช้งานเว็บไซต์ของท่านและปรับปรุงประสบการณ์การใช้งานของท่านให้ดียิ่งขึ้น
ขอให้ท่านยอมรับและเห็นด้วยกับเงื่อนไขและข้อกำหนดที่ระบุในนโยบายความเป็นส่วนตัวนี้ เพื่อเข้าใช้งานระบบลงประชามติ นโยบายนี้อาจมีการเปลี่ยนแปลง และการแก้ไขใด ๆ จะถูกแจ้งให้ท่านทราบผ่านช่องทางการประชาสัมพันธ์ของสโมสรฯ
หากท่านมีข้อสงสัยหรือข้อคำถาม กรุณาติดต่อ<br/>
Email: smovidyachula@gmail.com<br/>
Facebook: สโมสรนิสิตคณะวิทยาศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย - CU Smovidya<br/>
Instagram: @smovidya_official<br/>



            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction className="bg-yellow-400 text-black font-noto-sans w-full hover:bg-yellow-500">ตกลง</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default AgreementDialog