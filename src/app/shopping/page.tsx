'use client';
import React from 'react';
import Navbar from '@/app/components/navbar'; // Add missing import statement
import "@/app/globals.css";
import { useState, useEffect } from 'react';
import {Box, Card, Grid} from '@mui/material';
import "@fontsource/roboto/700.css";
import { red01, yellow01, yellow02 } from '@/colors';
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
                                        <div style={{ alignContent: "center" }}>
                                            {item.isAvailable ? (
                                                <Button variant="contained" color="success" style={{ width: "100px", height: "40px", background: "green01" }}>
                                                    Add to cart
                                                </Button>
                                            ) : (
                                                <Button variant="contained" color= "red01" style={{ width: "100px", height: "40px", background: "red01" }} disabled>
                                                    Out of stock
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