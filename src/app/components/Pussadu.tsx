import Image from "next/image";
import { Separator } from "@/components/ui/separator";
const Pussadu = () => {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:h-40 py-4 px-1">
        <div className="flex flex-row md:flex-grow">
          <div className="w-[140px]">
            <Image
              src={"/picture/yellowBox.svg"}
              alt="iconBox"
              width={"120"}
              height={"120"}
            />
          </div>
          <div className="flex flex-grow flex-col w-2/12">
            <div className="flex flex-row flex-grow font-noto-sans font-medium text-body2">
              123456
              <Separator
                orientation="vertical "
                className="h-full w-[0.5px] mx-2"
              />
              ชื่อพัสดุ
            </div>
            <div className="h-full font-noto-sans font-medium text-grey01 text-body2">
              รายละเอียดพัสดุ สีฟ้า ขนาดเล็ก
            </div>
            <div className="font-noto-sans font-medium text-body2">x5 </div>
          </div>
        </div>
        <Separator className="h-[0.5px] bg-grey01 md:hidden my-2" />
        <div className="flex flex-row">
          <div className="flex-grow md:w-24 font-noto-sans font-medium text-grey01 text-body2">
            ระยะเวลายืม
          </div>
          <div className="right-0 flex flex-col w-24">
            <div className="font-noto-sans font-medium text-grey01 text-body2 text-right">
              01/12/2567
            </div>
            <div className="font-noto-sans font-medium text-grey01 text-body2 text-right flex-grow ">
              12/12/2567
            </div>
            <div className="flex justify-end">
              <Image
                src={"/picture/penline.svg"}
                alt="iconBox"
                width={"24"}
                height={"24"}
              />
            </div>
          </div>
        </div>
      </div>
      <Separator className="h-[0.5px]" />
    </div>
  );
};
export default Pussadu;
