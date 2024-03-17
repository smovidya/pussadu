import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { use } from "react"
import Image from "next/image"

export function adminEdit() {
    return (
        <Link href="/admin/edit">
            <p className="text-blue-400 font-noto-sans">แก้ไข</p>
        </Link>
    )

}
//
function isAdmin(){
    return true;

}

function ItemDetail(it:any) {
    return(
    <AlertDialog>
    <AlertDialogTrigger className="w-full">
        <h2 className="text-black01 font-noto-sans text-left">{it["name"]}</h2>
    </AlertDialogTrigger>
    <AlertDialogContent className="dark:bg-white01">
        <AlertDialogHeader>
        <AlertDialogDescription className="font-noto-sans flex">
        {/* { @TODO: replace it into <Image> } */}
        <Image src={it["img_url"]} className="aspect-square object-cover rounded-md w-1/2 " alt={""} />
        <div className="mx-4 justify-items-center w-full h-full">
            <div className="flex justify-left gap-1">
            </div>
            <AlertDialogTitle className="font-noto-sans"></AlertDialogTitle>
            <div className="place-content-betweenv flex w-full mx-1">
                <div className="flex min-w-full content-center font-noto-sans mt-1 gap-x-1">
                                {/* TODO: additional label link here */}
                                {it["tag"].map((tag: string) => {
                                    return (
                                        <Badge variant="outline" key={it["id"]+tag} style={{color:"black", fontSize:"7px", height:"14px"}}>{tag}</Badge>
                                    )
                                }
                                )}
                </div>
                <div>
                    {isAdmin() && adminEdit()}
                </div>
            </div>
            <div className="flex align-center gap-1 pt-2 justify-between">
            <div className="flex flex-row align-center gap-1 pt-2">
                <p className=" font-noto-sans">{it["name"]}</p>
                <p className=" font-noto-sans">| {it["id"]}</p>
            </div>
            </div>
            <hr></hr>
            <div className="h-1/5">
                <p className=" font-noto-sans">{it["status"]}</p>
            </div>
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

export default ItemDetail;