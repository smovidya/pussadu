import Pussadu from "./Pussadu";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const BorrowContent = () => {
  return (
    <div className="flex flex-col mb-5 w-full p-6 bg-white rounded-xl">
      <div className="flex w-full  mb-2 md:mb-6 flex-col md:flex-row">
        <div className="flex flex-row flex-grow font-noto-sans font-medium text-body1">
          6534417023
          <Separator
            orientation="vertical "
            className="h-full w-[0.5px] mx-2"
          />
          wowza
        </div>
        <div className="font-noto-sans font-normal text-blue text-body2 mt-2 md:mt-0">
          ได้รับสินค้าแล้ว
        </div>
      </div>
      <Separator className="h-[0.5px]" />
      <Pussadu />
      <Pussadu />
      <div className="flex flex-col md:flex-row mt-4">
        <div className="flex-grow items-center font-noto-sans font-medium text-body2 text-red-600">
          <p>วันสุดท้ายของการคืนของ</p>
          <p>21/01/2567</p>
        </div>
        <div className="w-full md:w-max flex">
          <div className="font-noto-sans font-medium text-body2 text-grey01 hidden">
            กรุณาตรวจสอบเมื่อได้รับสินค้าแล้ว
          </div>
          <div className="w-full flex justify-end items-center">
            <Button className="bg-yellow01 font-noto-sans font-medium text-body2 text-white shadow-sm shadow-grey01">
              ได้รับสินค้าเรียบร้อยแล้ว
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BorrowContent;
