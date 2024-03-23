import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function InputWithLabel() {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  );
}

const Register = () => {
  return (
    <div className="w-screen h-screen bg-yellow01 flex justify-evenly items-center">
      <Image
        src={"/picture/yellowBox.svg"}
        alt="iconBox"
        width={256}
        height={286}
      />
      <div className="flex flex-col w-[410px] h-[639px] bg-white rounded-xl py-4 px-8 min-h-[540px]">
        <div className="font-noto-sans font-medium text-body1 mb-4">
          สมัครใหม่
        </div>
        <div className="flex flex-col w-full max-w-sm gap-7 mb-4">
          <div>
            <Label htmlFor="ชั้นปี">ชั้นปี</Label>
            <Select>
              <SelectTrigger className="w-full border-b-2 border-gray-200">
                <SelectValue placeholder="Value" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectScrollUpButton />
                  <SelectLabel>เลือกชั้นปี</SelectLabel>
                  <SelectItem value="ปี 1">ชั้นปีที่ 1</SelectItem>
                  <SelectItem value="ปี 2">ชั้นปีที่ 1</SelectItem>
                  <SelectItem value="ปี 3">ชั้นปีที่ 1</SelectItem>
                  <SelectItem value="ปี 4">ชั้นปีที่ 1</SelectItem>
                  <SelectItem value="ป.โท">ปริญญาโท</SelectItem>
                  <SelectItem value="ป.เอก">ปริญญาเอก</SelectItem>
                  <SelectScrollDownButton />
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ภาควิชา">ภาควิชา</Label>
            <Select>
              <SelectTrigger className="w-full border-b-2 border-gray-200">
                <SelectValue placeholder="Value" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectScrollUpButton />
                  <SelectLabel>เลือกภาควิชา</SelectLabel>
                  <SelectItem value="ภาควิชาคณิตศาสตร์">
                    ภาควิชาคณิตศาสตร์
                  </SelectItem>
                  <SelectItem value="ภาควิชาคอมพิวเตอร์">
                    ภาควิชาคอมพิวเตอร์
                  </SelectItem>
                  <SelectScrollDownButton />
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="Value"
              className="border-b-2"
            />
          </div>
          <div>
            <Label htmlFor="email">เบอร์โทร</Label>
            <Input
              type="email"
              id="email"
              placeholder="Value"
              className="border-b-2"
            />
          </div>
          <div>
            <Label htmlFor="email">Line ID</Label>
            <Input
              type="email"
              id="email"
              placeholder="Value"
              className="border-b-2"
            />
          </div>
          
        </div>
        <Button
            type="submit"
            className="self-center font-noto-sans font-bold py-2 px-6 bg-black text-white rounded-lg w-4/12 min-w-20 shadow-sm shadow-black"
          >
            เข้าสู่ระบบ
          </Button>
      </div>
    </div>
  );
};
export default Register;
