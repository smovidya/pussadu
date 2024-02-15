import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Image from 'next/image'
import { useState } from 'react';
import { useEffect } from 'react';
import "@fontsource/roboto/700.css";
import "/public/font/fontStyle.css";
import { Avatar } from '@mui/material';
import { yellow01, black01, yellow02, white } from '@/colors';
import { TextField } from '@mui/material';
import { Margin } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';




export default function Navbar() {
    const [width, setWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
    const isMobile = width <= 768;
    const [isLoaded, setIsLoaded] = useState(false);

    // test
    const role = "admin";



    function handleWindowSizeChange() {
        setWidth(window.innerWidth);
    }

    useEffect(() => {
        setIsLoaded(true);
        window.addEventListener("resize", handleWindowSizeChange);
        return () => {
            window.removeEventListener("resize", handleWindowSizeChange);
        };
    }, []);

    if (!isLoaded) {
        return null;
    }

    function AdminButton() {
        if (role === "admin") {
            return (
                <IconButton aria-label="admin" size="medium">
                    <Avatar alt="Admin" src="/picture/admin.png" sx={{ width: 40, height: 40 }} />
                </IconButton>
            );
        }
    }


    // Navbar for Computer
    function ComNavbarPage() {
        const handleProfileClick = () => {
            window.location.href = "/profile";
        };

        const handleAvatarMouseOver = () => {
            // Add your logic for the onMouseOver event here
            // Implement animation when the avatar is hovered over

        };


        return (
            <Box>
                <AppBar position={"static"}>
                    <Toolbar sx={{ background: yellow01, height: "88px", flexGrow: 1 }}>
                        <Image
                            src={"picture/yellowBox.svg"}
                            alt="yellowBox"
                            width={72}
                            height={64}
                        />
                        <form
                            style={{ height: "50px", marginInline: "50px", border: "0px", fontSize: "15px", width: "100%", borderWidth: "24px"}}
                            onSubmit={(event) => {
                                event.preventDefault();
                                const searchValue = (event.target as HTMLFormElement).querySelector<HTMLInputElement>('input[name="search"]')?.value;
                                if (searchValue === "" || searchValue === null) {
                                    window.location.href = `/shopping`;
                                } else {
                                    window.location.href = `/shopping/search/item=${searchValue}`;
                                }
                            }}
                        >
                            <TextField
                                    fullWidth
                                    id="standard-bare"
                                    variant="outlined"
                                    style={{ borderRadius: "25px", backgroundColor: "white", height: "100%", color: black01, justifyContent: "center", alignItems: "center", paddingInline: "20px" }}
                                    InputProps={{
                                        endAdornment: (
                                            <SearchIcon/>
                                        ),
                                    }}
                                    name="search"
                                    placeholder="Search"
                                />
                        </form>
                        <div style={{ display: "flex", width: "20%", gap: "30px", marginRight: "30px", flexDirection: "row", justifyContent: "right", alignItems: "center" }}>
                            <AdminButton />
                            <IconButton aria-label="profile" size="medium">
                                <Avatar alt="Profile" src="/picture/profile.png" sx={{ width: 40, height: 40 }} onClick={handleProfileClick} onMouseOver={handleAvatarMouseOver} />
                            </IconButton>
                        </div>
                    </Toolbar>

                </AppBar>
            </Box>
        );
    }

    // Navbar for Mobile
    function MobileNavbarPage() {
        return (
            <Box>
                <AppBar position="static">
                    <Toolbar sx={{ background: yellow01, height: "111px" }}>
                        <div style={{ display: "flex", width: "85%", gap: "10px", flexDirection: "row", justifyContent: "left", alignItems: "center", marginTop: "25px", height: "30px" }}>
                            <form
                                style={{ width: "100%", height: "100%", margin: 0 }}
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    const searchValue = (event.target as HTMLFormElement).querySelector<HTMLInputElement>('input[name="search"]')?.value;
                                    if (searchValue === "" || searchValue === null) {
                                        window.location.href = `/shopping`;
                                    } else {
                                        window.location.href = `/shopping/search/item=${searchValue}`;
                                    }
                                }}
                            >
                                <TextField
                                    fullWidth
                                    id="standard-bare"
                                    variant="outlined"
                                    style={{ borderRadius: "25px", backgroundColor: white , width: "100%", height: "38px", color: "black", justifyContent: "center", alignItems: "center", paddingInline: "20px" }}
                                    InputProps={{
                                        endAdornment: (
                                            <SearchIcon/>
                                        ),
                                    }}
                                    name="search"
                                    placeholder="Search"
                                />
                            </form>
                        </div>


                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "right", alignItems: "center", marginTop: "30px", width: "50px", minWidth:"16px", marginRight:"18px"}}>
                            <IconButton
                                size="medium"
                                edge="start"
                                color="inherit"
                                aria-label="profile"
                                sx={{ width: 20, height: 20 }}
                            >
                                <Avatar alt="Profile" src="/picture/profile.png" sx={{ width: 38, height: 38 }} />
                            </IconButton>
                        </div>

                    </Toolbar>
                </AppBar>
            </Box>
        );
    }

    return <div>{isMobile ? <MobileNavbarPage /> : <ComNavbarPage />}</div>;

}
