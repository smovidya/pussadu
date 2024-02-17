import Image from "next/image";
import AgreementDialog from "../components/AgreementDialog";
import PolicyModal from "../components/policyModal";

const LoginPage = () => {
  return (
    <div className="w-screen h-screen grid md:grid-cols-5">
      <div className="hidden md:bg-yellow01 md:flex col-span-3 items-center justify-center">
        <Image
          src={"/picture/yellowBox.svg"}
          alt="iconBox"
          width={200}
          height={200}
        />
      </div>
      <div className=" bg-yellow01 md:bg-grey02 md:col-span-2 p-5 flex flex-col items-center justify-center shadow-inner ">
        <div className="w-full flex justify-end">
          <Image
            src={"/picture/logoSmo.svg"}
            alt="logoSmo"
            width={80}
            height={71}
          />
        </div>
        <div className="flex flex-col items-center justify-self-center">
        <Image
          src={"/picture/yellowBox.svg"}
          alt="iconBox"
          width={108}
          height={108}
          className="md:hidden "
        />
        <div className="font-noto-sans text-H2 md:text-H1 font-bold drop-shadow-3xl ">
          ระบบพัสดุ ใส่ shadow บ่ได้
        </div>
        <div className="font-noto-sans text-subHead2 md:text-subHead1 font-bold mb-28">
          สโมสรนิสิตคณะวิทยาศาสตร์
        </div>
        <button
          type="button"
          data-modal-target="default-model"
          data-modal-toggle="default-modal"
          className=" block font-noto-sans text-bodyEngBold1 font-bold py-2 px-6 bg-black text-white rounded-lg w-72"
        >
          LOGIN CHULA SSO
        </button>
        <AgreementDialog/>
        <div className="h-36"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
