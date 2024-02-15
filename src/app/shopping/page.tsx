'use client';
import React from 'react';
import Navbar from '@/app/components/navbar'; // Add missing import statement
import "@/app/globals.css";
import { useState, useEffect } from 'react';
import {Box, Card, Grid} from '@mui/material';
import "@fontsource/roboto/700.css";
import { red01, yellow01, yellow02, green1, white, black01 } from '@/colors';
import { BorderBottom } from '@mui/icons-material';
import { Button } from '@mui/material';



const Page = () => {

    const [width, setWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
    const isMobile = width <= 768;
    const [isLoaded, setIsLoaded] = useState(false);


    const list = [
        {
            id: 1,
          title: "Orange",
          img: "",
          price: "$5.50",
          isAvailable: true,
          amount: 0
        },
        {
          id: 2,
          title: "Apple",
          img: "",
          price: "$3.50",
          isAvailable: false,
          amount: 0
        },
        {
          id: 3,
          title: "Banana",
          img: "",
          price: "$2.50",
          isAvailable: true,
          amount: 0
        },
        {
          id: 4,
          title: "Grapes",
          img: "",
          price: "$4.50",
          isAvailable: true,
          amount: 0
        },
        {
          id: 5,
          title: "Pineapple",
          img: "",
          price: "$6.50",
          isAvailable: true,
          amount: 0
        },
        {
          id: 6,
          title: "Strawberry",
          img: "",
          price: "$7.50",
          isAvailable: true,
          amount: 0
        }
      ];

    function handleWindowSizeChange() {
        setWidth(window.innerWidth);
    }

    function handleCartClick(item: { id: number; title: string; img: string; price: string; isAvailable: boolean; amount: number; }) {
        window.location.href = "{`/cart/${item.id}`}";
    }

    useEffect(() => {
        setIsLoaded(true);
        setWidth(window.innerWidth);
        window.addEventListener("resize", handleWindowSizeChange);
        return () => {
          window.removeEventListener("resize", handleWindowSizeChange);
        };
      }, []);

    function displayMain() {
        return <div>{isMobile ? <MobilePage /> : <ComPage />}</div>;
    }

    if (!isLoaded) {
        return null;
    }

    const is_user_containt_cart = true;



    function ComPage() {
        return (
            <>
                <div style={{ marginInline: "15%", justifyContent: "center", alignItems: "center", marginRight: "250px" }}>
                    <Box sx={{ flexGrow: "1" ,marginTop: "30px", marginBottom: "100px", width: "100%", height: "50px", color: yellow02, alignContent: "center", textAlign: "center"}}
                    > รายการพัสดุ
                    </Box>
                    <Grid container spacing={2.5}>
                        {list.map((item, index) => {
                            return (
                                <Grid item xs={6} sm={4} md={3} lg={2.4} key={index}>

                                    <Card style={{ width: "100%", height: "320px" }}>
                                        <img src={item.img} alt={item.title} style={{ width: "100%", height: "200px" }} />
                                        <div>{item.title}</div>
                                        <div>{item.price}</div>
                                        <div style={{ justifyContent: "center", width: "100%", display:"flex", paddingLeft: "5px", paddingRight: "5px"}}>

                                            {item.isAvailable ? (
                                                is_user_containt_cart ? (
                                                    <>
                                                        <Button variant="contained" style={{ width: "80px", height: "40px", backgroundColor: green1, borderRadius: "20px", color: white}} onClick={() => handleCartClick(item)}>
                                                            ใช้งาน {item.amount}
                                                        </Button>
                                                        <Button variant="contained" style={{ width: "80px", height: "40px", backgroundColor: white, borderRadius: "20px", color: black01}}>
                                                            เหลือ {item.amount}
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button variant="contained" style={{ width: "80px", height: "40px", backgroundColor: green1, borderRadius: "20px", color: white}}>
                                                        ใส่ตะกร้า
                                                    </Button>
                                                )
                                            ) : (
                                                <Button variant="contained" style={{ width: "80px", height: "40px", backgroundColor: red01, borderRadius: "20px", color: white}} disabled>
                                                    หมด
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </div>
            </>
        );
    }

    function MobilePage() {
        return <div>Mobile</div>;
    }
    return (
        <div>
            <Navbar />
            {displayMain()}
        </div>
    );
};

export default Page;