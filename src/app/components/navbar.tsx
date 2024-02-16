'use strict';
import Image from "next/image";
import Avatar from "react-avatar"
const isAdmin = true;
const AdminButton = () => {
    return (
        <a href="/admin">
            <Avatar name="Admin" size="30" round="30px" color="#DAB021"/>
        </a>
    );
}
const Navbar = () => {
    return (
    <>
    <div className="flex justify-between items-center h-16 min-w-120" style={{backgroundColor: "#F7CF47", width:"100%"}}>
        <div className="flex justify-between items-center" style={{width:"100%"}}>
            <div className="flex items-center" style={{width: "100%"}}  >
                <a className="hidden sm:flex mx-10 w-20">
                    <Image src={"/picture/yellowBox.svg"}
                    alt="parcel"
                    width={60}
                    height={60}
                    />
                </a>

                <form action="#" className="flex items-center space-x-3 ml-5" style={{width: "100%"}}>
                    <div className="relative" style={{width: "60%", minWidth:"200px"}}>
                        <input type="text" placeholder="Search" className="px-2 py-1 font-noto-sans h-30" style={{borderRadius: "50px", width: "100%"}}/>
                    </div>
                    <button type="submit" className="bg-black text-white px-2 py-1 h-30 font-noto-sans" style={{borderRadius: "50px"}}>ค้นหา</button>
                </form>
            </div>
            <div className="flex items-center space-x-5 mx-10 align-right">
                {isAdmin && <AdminButton />}
                <a href="/profile">
                    <Avatar name="P" size="30" round="30px" color="#DAB021"/>
                </a>
            </div>
        </div>
    </div>
    </>    
    );
}
export default Navbar;