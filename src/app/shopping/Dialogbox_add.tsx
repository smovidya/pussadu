import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { use } from "react"

export function adminEdit() {
    return (
        <Link href="/admin/edit">
            <p className="text-blue-400 font-noto-sans">แก้ไข</p>
        </Link>
    )

}

//item.tag should appear here
export const itemBadge = () =>{
    return(
        <>
            {//for each .. for example
            }
            <Badge>Blue</Badge>
        </>
    )
}

function addItem(item: any,remaining: number, pick: number) {
    return(
    <AlertDialog>
    <AlertDialogTrigger className="w-full">
                <Button className="text-white01 p-2 w-full bg-green01 hover:bg-grey01 drop-shadow-lg font-noto-sans" style={{ borderRadius: "50px", flexGrow: "1", width:"100%" }}>
                        เลือก {pick}
                </Button>
    </AlertDialogTrigger>
    <AlertDialogContent className="w-full">
        <AlertDialogHeader>
        <AlertDialogDescription className=" font-noto-sans flex">
        <img src={(String(item[2]).replace(/['"]+/g, ''))} className="aspect-square object-cover rounded-md w-1/2 " />
        <div className="mx-4 justify-items-center w-full h-full">
            <div className="flex justify-left gap-1">
                {itemBadge()}
            </div>
            <AlertDialogTitle className="font-noto-sans"></AlertDialogTitle>
            <div className="flex align-center gap-1 pt-2 justify-between">
            <div className="flex align-center gap-1 pt-2">
                <p className=" font-noto-sans">{item[0].replace(/['"]+/g, '')}</p>
                <p className=" font-noto-sans">| {item[1].replace(/['"]+/g, '')}</p>
            </div>
                {adminEdit()}
            </div>
            <hr></hr>
            <div className="h-1/5">
                <p className=" font-noto-sans">{item[3].replace(/['"]+/g, '')}</p>
            </div>
            
            <form className="flex flex-col space-y-2 justify-items-center items-center place-items-center h-full">
                <label className=" font-noto-sans" htmlFor="amount">จำนวน</label>
                <input type="number" id="amount" name="amount" min="0" max={remaining} required className="rounded-md p-2 border border-gray-300 " />
            </form>
        </div>

        </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogAction className="bg-yellow-400 text-black font-noto-sans w-full hover:bg-yellow-500">ตกลง</AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
    )
}

export default addItem;