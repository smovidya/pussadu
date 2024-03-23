import Image from "next/image";
const Project = () => {
  return (
    <object className="flex items-center bg-zinc-300 rounded-3xl px-5 w-full md:w-[400px] h-[100px] shrink-0">
      <canvas className="w-10 h-10 bg-yellow03 rounded-[20px]"/>
      <div className="flex-grow font-noto-sans font-medium text-body2 mx-4 ">
        โครงการเลือกตั้งคณะกรรมการบริหารสโมสรนิสิตคณะวิทยาศาสตร์
        ประจําปีการศึกษา 2567
      </div>
      <div>
        <Image
          src={"/picture/minus.svg"}
          alt="minus"
          width={"50"}
          height={"50"}
        />
      </div>
    </object>
  );
};
export default Project;
