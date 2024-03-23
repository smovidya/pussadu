import Image from "next/image";
import NavigationTop from "../components/NavigationTop";
import DropdownPj from "../components/Dropdown";
import Content from "../components/BorrowContent";
import Project from "../components/Project";


const Profile = () => {
  return (
    <div className="flxe flex-col w-svw h-full bg-grey02">
      <div className="flex w-screen px-4 md:px-14 bg-yellow01 h-14 md:h-24">
        <div className="flex items-center">
          <Image
            src={"/picture/yellowBox.svg"}
            alt="iconBox"
            width={50}
            height={50}
          />
        </div>
        <div className="flex flex-grow items-center justify-center">
          <NavigationTop />
        </div>
        <div className="flex items-center justify-center w-[50px]">
          <Image
            src={"/picture/users.svg"}
            alt="users"
            width={24}
            height={24}
            color="grey01"
            className="md:size-10"
          />
        </div>
      </div>
      <div className="flex flex-col pt-5 md:pt-20 px-4 md:px-[10%] lg:px-[15%]">
        <div className="text-subHead2 font-noto-sans font-bold ml-4 md:ml-0 ">
          <p>Name Nathawat</p>
          <p>6534417023</p>
        </div>
        <div className="flex justify-center my-5 md:my-14">
          <DropdownPj />
        </div>
        <div className="font-noto-sans font-medium text-H3 mb-5">
          โครงปัจจุบัน
        </div>
        <div className="flex flex-nowrap gap-2 mb-5">
          <Project />
        </div>
        <div className="font-noto-sans font-medium text-H3 mb-5">
          โครงทั้งหมด
        </div>
        <div className="mb-5">
          <Project />
        </div>
        <Content />
        <Content />
      </div>
    </div>
  );
};
export default Profile;
