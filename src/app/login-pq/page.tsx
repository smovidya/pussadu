import Image from "next/image";
import AgreementDialog from "./components/AgreementDialog";

const LoginPage = () => {
  return (
    <div className="w-screen h-screen grid grid-cols-2">
      <div className="bg-yellow01 hidden md:flex items-center justify-center">
        <Image
          src={"/picture/yellowBox.svg"}
          alt="parcel"
          width={200}
          height={200}
        />
      </div>
      <div className="flex flex-col p-5 md:p-10 lg:p-20 col-span-3 md:col-span-1 bg-yellow01 md:bg-white">
        <div className="w-full flex justify-end">
          <Image
            src={"/picture/logoSmo.svg"}
            alt="parcel"
            width={100}
            height={100}
          />
        </div>
        <div className="flex flex-col h-full justify-center">
          <div className="flex flex-col mb-32 mt-10 items-center">
            <Image
              src={"/picture/yellowBox.svg"}
              alt="parcel"
              width={100}
              height={100}
              className="md:hidden mb-5"
            />

            <h1 className="text-H1 font-bold font-noto-sans mb-2 text-center">
              ระบบพัสดุ
            </h1>
            <h2 className="text-subHead1 font-noto-sans text-center">
              สโมสรนิสิตคณะวิทยาศาสตร์
            </h2>
          </div>
          <div className="flex flex-col items-center">
            <button className="bg-black text-white mb-5 rounded text-xl py-2.5 w-full font-bold font-noto-sans">
              LOGIN CHULA SSO
            </button>
            <AgreementDialog />
          </div>
        </div>
        <div className="h-[100px]" />
      </div>
    </div>
  );
};

export default LoginPage;
