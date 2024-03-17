'use client'
import Navbar from "../components/navbar";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import ItemDetail from "./Dialogbox_detail";
import { useState, useEffect } from 'react'
import mockData from "./mockData.json";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";


// interface Item {
//         "id": String,
//         "name": String",
//         "img_url": String,
//         "description": String,
//         "status": String,
//         "category": [
//           {
//             "type": String,
//             "amount": Number
//           }
//         }


// Filter by category
function RadioGroupDemo(setRecord: any, filterItem: any) {
    return (
        <div className="row">
            <p className="pb-2">ประเภท</p>
            <RadioGroup defaultValue="allProduct" className="font-noto-sans">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="allProduct" id="r1" onClick={() => filterItem("allProduct", setRecord)}/>
                    <Label htmlFor="r1" className="font-noto-sans">ทั้งหมด</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="borrowItem" id="r2" onClick={() => filterItem("borrowItem", setRecord)} />
                    <Label htmlFor="r2" className="font-noto-sans">ครุภัณฑ์</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Inventory" id="r3" onClick={() => filterItem("Inventory", setRecord)}/>
                    <Label htmlFor="r3" className="font-noto-sans">พัสดุ</Label>
                </div>
            </RadioGroup>
        </div>
    )
}


function statusbar(it: any) {
    //
    if((it["id"]).split("-").length == 3){
        if (it["status"] == "Available") {
            return (
                <div className="... w-1/2 bg-green01 h-8 px-2 py-1 font-noto-sans align-center rounded-full text-center hover:bg-sky-700 drop-shadow-md">ว่าง</div>
            )
        }
        else{
        return (
            <div className="... w-1/2 bg-red01 h-8 px-2 py-1 font-noto-sans align-center rounded-full text-center hover:bg-gray-700 drop-shadow-md">ไม่ว่าง</div>
        )}
    }
    else{
        let sum = 0 
        it["category"].map((category: any) => {
            sum += parseInt(category["amount"])
        })
        return (
            <div className="flex justify-center content-center items-center gap-1 w-full">
                <div className="w-full bg-red01 h-8 px-2 py-1.5 font-noto-sans rounded-full text-center hover:bg-gray-700 text-xs">ใช้งาน {"x"}</div>
                <div className="border-2 w-full h-8 px-2 py-1.5 font-noto-sans rounded-full text-center hover:bg-gray-300 text-xs text-black01">เหลือ {sum}</div>
            </div>
        )
    }
}





function Layout(itemList: any, isReady:boolean) { // Fix the function name to follow the naming convention
    if (isReady) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 m-2 lg:mx-52 place-items-center justify-content-center dark:bg-white01">
            {itemList?.map((it: any) => {
                return (
                    <Card className="w-11/12 md:w-11/12 h-22 dark:bg-white01 rounded-md shadow-md m-1 sm:m-2 mt-2 drop-shadow-lg" key={it["id"]}>
                        {/* {@TODO: change it to Image from next} */}
                        <img src={it["img_url"]} alt="img" className="w-full aspect-square object-cover rounded-t-md mb-2" />
                        <div className="flex min-w-full content-center font-noto-sans pt-2 gap-x-0.5 px-3 justify-left content-center items-center">
                            {/* @TODO: additional label link here */}
                            {it["tag"].map((tag: string) => {
                                return (
                                    <Badge variant="outline" key={it["id"]+tag} style={{color:"black", fontSize:"7px", height:"14px"}}>{tag}</Badge>
                                )
                            }
                            )}
                        </div>
                        <CardHeader className="p-1 mx-2 md:p-3">
                            {ItemDetail(it)}
                            <p className="text-black01 font-noto-sans">{it["id"]}</p>
                        </CardHeader>
                        <CardContent>
                        <CardDescription className="mb-2 md:mb-4">{it["description"]}</CardDescription>
                        <div className="flex flex-wrap justify-center content-center items-center">
                        {statusbar(it)}
                        </div>
                        </CardContent>
                    </Card>
                )
            })}


        </div>
    );
    }
    else {}

}



const ShoppingPage = () => {
    const [data, setData] = useState<any>({});
    const [record, setRecord] = useState(data);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Assuming mockData is an object with an 'items' property
        if (mockData && mockData.items) {
            setData(mockData.items);
            setRecord(mockData.items);
            setIsReady(true);
            }
        }, []); 

    function filterItem(status: string, setRecord: any) {
        if (status == "allProduct") {
            setRecord(mockData.items);
        }
        else if (status == "borrowItem") {
            setRecord(mockData.items.filter((it: any) => {
                return (it["id"]).split("-").length === 3
            }));
        }
        else if (status == "Inventory") {
            setRecord(mockData.items.filter((it: any) => {
                return (it["id"]).split("-").length != 3
            }));
        }
    }

    
    return (
        <>
            <Navbar />
            <div className="w-full flex flex-wrap justify-center align-center content-center items-baseline">
                <div className="w-11/12 h-20 md:w-4/5 text-center border-2 border-b-8 m-10 pt-6 drop-shadow-xl rounded-md border-yellow02 font-noto-sans text-2xl font-bold">รายการสิ่งของ</div>
            </div>
            <div className="invisible lg:visible fixed w-full justify-right align-right content-right font-noto-sans mr-16 z-50">
                <div className="flex justify-end content-right mr-0 lg:mr-20">
                    {RadioGroupDemo(setRecord, filterItem)}
                </div>
            </div>
            {Layout(record, isReady)}
        </>
    );
}
export default ShoppingPage;