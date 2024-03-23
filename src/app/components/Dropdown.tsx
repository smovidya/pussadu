"use client";

import * as React from "react";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Checked = DropdownMenuCheckboxItemProps["checked"];

const DropdownPj = () => {
  const [pj1, setpj1] = React.useState<Checked>(false);
  const [pj2, setpj2] = React.useState<Checked>(false);
  const [pj3, setpj3] = React.useState<Checked>(false);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-yellow01 rounded-3xl w-full md:w-10/12 h-11">
          <div className="font-noto-sans font-medium text-body2 text-grey01 w-full text-start">
            กรอกโครง
          </div>
          <Image
            src={"/picture/plus.svg"}
            alt="iconPlus"
            width={"24"}
            height={"24"}
            className="relative right-0"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-10/12 md:w-10/12 bg-red-500">
        <DropdownMenuLabel>
          <div className="font-noto-sans font-medium text-body2">
            โครงการทั้งหมด
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={pj1}
          onCheckedChange={setpj1}
        >
          <div className="font-noto-sans font-medium text-body2 overflow-clip ">
            โครงการค่ายอาสาพัฒนาภายใต้ชื่อ
            “ไม่ใกล้ไม่ไกลอยากชวนเธอไปพักใจที่ไตรคามมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมมม”
          </div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={pj2}
          onCheckedChange={setpj2}
        >
          <div className="font-noto-sans font-medium text-body2">
            โครงการกีฬาบาส-บอล ประเพณีจุฬาฯ-ธรรมศาสตร์ คณะวิทยาศาสตร์
            ประจําปีการศึกษา 2566
          </div>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={pj3}
          onCheckedChange={setpj3}
        >
          <div className="font-noto-sans font-medium text-body2">
            โครงการการค่ายผู้นำเยาวชนนักวิทยาศาสตร์ ครั้งที่ 25
          </div>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownPj;
