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

function isBorrowType(id: string) {
    const x = id.split("-");
    return x.length > 2;
}

const items = {
    "item": [
      {
        "id": "\"SC56-0001-5555\"",
        "name": "\"item1\"",
        "status": "\"borrowed\"",
        "destcription": "\"aaaaaa\"",
        "dueDate": "\"2022-12-31\""
      },
      {
        "id": "\"SC56-0002-5555\"",
        "name": "\"item2\"",
        "destcription": "\"aaaaaa\"",
        "status": "\"available\""
      },
      {
        "id": "\"SC66-0002\"",
        "name":"\"item3\"",
        "destcription": "\"aaaaaa\"",
        "status:\"available\"": {},
        "catagory": [
          {
            "type": "\"red\"",
            "amount": "5"
          },
          {
            "type": "\"blue\"",
            "amount\"": "5"
          }
        ]
      }
    ]
  }

const itemList =  items.item.map((it: any) => {
    if (isBorrowType(it.id)) {
        return [it.id, it.name, it.destcription, isBorrowType(it.id),it.status, it.dueDate]
    }
    else {
        const catagory = it.catagory.map((cat: any) => {
            return [cat.type, cat.amount]
        })
        return [it.id, it.name, it.destcription,isBorrowType(it.id), it.status, catagory];
    }
  })


function Layout(){ // Fix the function name to follow the naming convention
    return (
            <div className="grid grid-cols-3 gap-4">
                {itemList.map((it: any) => {
                    return (
                        <Card className=" w-96 dark:bg-white01 rounded-md shadow-md m-10" key={it[0]}>
                            <CardHeader>
                                <CardTitle className="text-black01" style={{color:"black"}}>{it[1]}</CardTitle>
                                <CardDescription>{it[2]}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-black01">{it[3]}</p>
                                <p className="text-black01">{it[4]}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
    );

}

function cardlist() {
    return (
        <Card className=" w-96 h-20 dark:bg-white01 rounded-md shadow-md m-10">
            <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Card Content</p>
            </CardContent>
            <CardFooter>
                <p>Card Footer</p>
            </CardFooter>
        </Card>
    );
}

const shoppingPage = () => {
    return (
        <div>
            <Navbar />
            {Layout()}
        </div>
    );
}
export default shoppingPage;