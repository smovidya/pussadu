'use client'
import { it } from "node:test";
import Navbar from "../components/navbar";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"




function strip(string: string) {
    return string.replace(/['"]+/g, '');
}


function isBorrowType(id: string) {
    const x = id.split("-");
    return x.length > 2;
}

// mocked data
const items = {
    "item": [
        {
            "id": "\"SC56-0001-5555\"",
            "name": "\"item1\"",
            "img_url": "\"https://i.insider.com/602ee9ced3ad27001837f2ac?width=700\"",
            "status": "\"Borrowed\"",
            "destcription": "\"aaaaaa\"",
            "dueDate": "\"2022-12-31\""
        },
        {
            "id": "\"SC56-0002-5555\"",
            "name": "\"item2\"",
            "img_url": "\"https://i.ytimg.com/vi/1pfF2RN2PxQ/hqdefault.jpg\"",
            "destcription": "\"aaaaaa\"",
            "status": "\"Available\""
        },
        {
            "id": "\"SC66-0002\"",
            "name": "\"item3\"",
            "img_url": "\"https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Prayut_2022.jpg/640px-Prayut_2022.jpg\"",
            "destcription": "\"aaaaaa\"",
            "status": "\"Available\"",
            "catagory": [
                {
                    "type": "\"red\"",
                    "amount": "5"
                },
                {
                    "type": "\"blue\"",
                    "amount": "5"
                }
            ]
        },
        {
            "id": "\"SC56-0004-5555\"",
            "name": "\"item1\"",
            "img_url": "\"https://f.ptcdn.info/251/076/000/r6phkmmxuGNF1erTdMG-o.jpg\"",
            "status": "\"Borrowed\"",
            "destcription": "\"aaaaaa\"",
            "dueDate": "\"2022-12-31\""
        },
        {
            "id": "\"SC56-0005-5555\"",
            "name": "\"item2\"",
            "img_url": "\"https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/210b5eaf-ea6b-4fa3-aaf0-067a5d0f9dea/width=450/00030-39723463.jpeg\"",
            "destcription": "\"aaaaaa\"",
            "status": "\"Available\""
        },
        {
            "id": "\"SC66-0006\"",
            "name": "\"item3\"",
            "img_url": "\"https://pbs.twimg.com/profile_images/1371819168173985806/cPg75H7p_400x400.jpg\"",
            "destcription": "\"aaaaaa\"",
            "status": "\"Available\"",
            "catagory": [
                {
                    "type": "\"red\"",
                    "amount": "5"
                },
                {
                    "type": "\"blue\"",
                    "amount": "5"
                }
            ]
        }
    ]
}

// mocked data
const userPick = {
    "item": {
        "SC66-0002": {
            "red": 1,
            "blue": 1
        }
    }
}


function amountItem(it: any) {
    if (it[4] == false) {
        let sum = 0;
        it[6].map((x: any) => {
            sum += parseInt(x[1]);
        })
        return sum;
    }
}

function pickItem(userpick: any, id: string) {
    for (let i in userpick.item) {
        if (i == strip(id)) {
            let sum = 0;
            for (let j in userpick.item[i]) {
                sum += parseInt(userpick.item[i][j]);
            }
            return sum; // if not found
        }
    }
    return 0;
}

const itemList = items.item.map((it: any) => {
    if (isBorrowType(it.id)) {
        return [it.id, it.name, it.img_url, it.destcription, isBorrowType(it.id), it.status, it.dueDate]
    }
    else {
        const catagory = it.catagory.map((cat: any) => {
            return [cat.type, cat.amount]
        })
        return [it.id, it.name, it.img_url, it.destcription, isBorrowType(it.id), it.status, catagory];
    }
})

function buttonOption(it: any[]) {
    if (it[4] == true) {
        if (it[5] == "\"Borrowed\"") {
            return (
                <div className=" flex w-3/5 space-x-1 justify-content-center place-items-center drop-shadow-lg">
                    <Button className="text-white01 p-2 bg-red01 font-noto-sans" disabled style={{ borderRadius: "50px", flexGrow: "1" }}>ไม่ว่าง</Button>
                </div>
            )
        }
        else {
            return (<div className="flex w-3/5 space-x-1 justify-content-center place-items-center justify-center">
                <Button asChild className="text-white01 p-2 bg-green01 hover:bg-grey01 drop-shadow-lg font-noto-sans" style={{ borderRadius: "50px", flexGrow: "1" }}>
                    <Link href={`/shopping/${it[0]}`}>
                        ว่าง
                    </Link>
                </Button>
            </div>
            )
        }
    }
    else {
        const amount = amountItem(it);
        const pick = pickItem(userPick, String(it[0]));
        const remaining = amount != undefined && pick !== undefined ? amount - pick : 0;
        if (pick == 0) {
            return (<div className="flex w-full space-x-1 justify-content-center">
                <Button asChild className="text-white01 p-2 w-5/12 bg-green01 hover:bg-grey01 drop-shadow-lg font-noto-sans" style={{ borderRadius: "50px", flexGrow: "1" }}>
                    <Link href={`/shopping/${it[0]}`}>
                        เหลือ {amount}
                    </Link>
                </Button>
            </div>
            )
        }
        else
            return (<div className=" flex w-full space-x-1 justify-content-center">
                <Button asChild className="text-white01 p-2 w-5/12 bg-green01 hover:bg-grey01 drop-shadow-lg font-noto-sans" style={{ borderRadius: "50px", flexGrow: "1" }}>
                    <Link href={`/shopping/${it[0]}`}>
                        เลือก {pick}
                    </Link>
                </Button>
                <Button asChild className="text-black01 p-2 w-5/12 border-2 hover:bg-grey01 drop-shadow-lg font-noto-sans" style={{ borderRadius: "50px", flexGrow: "1" }}>
                    <Link href={`/shopping/${it[0]}`}>
                        เหลือ {remaining}
                    </Link>
                </Button>
            </div>
            )
    }
}

function RadioGroupDemo() {
    return (
        <div className="row">
            <p className="pb-2">ประเภท</p>
            <RadioGroup defaultValue="allProduct" className="font-noto-sans">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="allProduct" id="r1"/>
                    <Label htmlFor="r1" className="font-noto-sans">ทั้งหมด</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="borrowItem" id="r2" />
                    <Label htmlFor="r2" className="font-noto-sans">ครุภัณฑ์</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Inventory" id="r3" />
                    <Label htmlFor="r3" className="font-noto-sans">พัสดุ</Label>
                </div>
            </RadioGroup>
        </div>
    )
}





function Layout() { // Fix the function name to follow the naming convention
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 m-2 lg:mx-52 place-items-center justify-content-center">
            {itemList.map((it: any) => {
                return (
                    <Card className="w-11/12 md:w-11/12 h-18 dark:bg-white01 rounded-md shadow-md m-1 sm:m-2 mt-2 drop-shadow-lg" key={it[0]}>
                        <a href={`/shopping/${it[0]}`}>
                            <img src={strip(String(it[2]))} alt={strip(it[1])} className="w-full aspect-square object-cover rounded-t-md" />
                        </a>
                        <CardHeader className="p-2 md:p-6">
                            <a href={`/shopping/${it[0]}`}>
                                <CardTitle className="text-black01 font-noto-sans">{strip(it[1])}</CardTitle>
                            </a>
                            <CardDescription>{strip(it[3])}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-black01">{it[4]}</p>
                            <div className="flex justify-between min-w-full place-items-center content-center font-noto-sans">
                                {buttonOption(it)}
                            </div>
                            {
                                //<p className="text-black01 font-noto-sans">{strip(String(it[5]))}</p>"}
                            }
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    );

}



const shoppingPage = () => {
    return (
        <div>
            <Navbar />
            <div className="w-full flex flex-wrap justify-center align-center content-center items-baseline">
                <div className="w-11/12 h-20 md:w-4/5 text-center border-2 border-b-8 m-10 pt-6 drop-shadow-xl rounded-md border-yellow02 font-noto-sans">รายการสิ่งของ</div>
            </div>
            <div className="invisible lg:visible fixed w-full justify-right align-right content-right font-noto-sans mr-16 z-50">
                <div className="flex justify-end content-right mr-0 lg:mr-20">
                    {RadioGroupDemo()}
                </div>
            </div>
            {Layout()}
        </div>
    );
}
export default shoppingPage;