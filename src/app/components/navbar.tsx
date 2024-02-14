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
            <Box sx={{ flexGrow: 0 }}>
                <AppBar position={"static"}>
                    <Toolbar sx={{ background: yellow01 }}>
                        <Image
                            src={"picture/yellowBox.svg"}
                            alt="yellowBox"
                            width={72}
                            height={64}
                            style={{ right: "15px", top: "29px" }}
                        />
                        <form
                            style={{ width: "120%", height: "40px", marginInline: "50px", border: "0px", fontSize: "15px" }}
                            onSubmit={(event) => {
                                event.preventDefault();
                                // js script to redirect to the search page
                                const searchValue = (event.target as HTMLFormElement).querySelector('input[name="search"]')?.value;
                                if (searchValue === "" || searchValue === null) {
                                    window.location.href = `/shopping`;
                                }
                                else window.location.href = `/shopping/search/item=${searchValue}`;
                            }}
                        >
                            <input
                                style={{ paddingLeft: "20px", paddingInline: "20px", marginLeft: "20px", borderRadius: "20px", width: "100%", height: "100%", color: black01 }}
                                type="text"
                                name="search"
                                placeholder="Search"
                            />
                        </form>
                        <div style={{ display: "flex", width: "100%", gap: "30px", marginRight: "30px", flexDirection: "row", justifyContent: "right", alignItems: "center" }}>
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
            <Box sx={{ flexGrow: 0 }}>
                <AppBar position="static">
                    <Toolbar sx={{ background: yellow01, height: "100px" }}>
                        <div style={{ display: "flex", width: "120%", gap: "10px", flexDirection: "row", justifyContent: "left", alignItems: "center", marginTop: "25px", height: "30px" }}>
                            <form
                                style={{ width: "100%", height: "100%", margin: 0 }}
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    const searchValue = event.target.elements.search.value;
                                    if (searchValue === "" || searchValue === null) {
                                        window.location.href = `/shopping`;
                                    }
                                    else window.location.href = `/search/item=${searchValue}`;
                                }}
                            >
                                <TextField
                                    fullWidth
                                    id="standard-bare"
                                    variant="outlined"
                                    style={{ borderRadius: "20px", backgroundColor: "white", width: "100%", height: "100%", color: "black", justifyContent: "center", alignItems: "center", paddingInline: "20px" }}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton type="submit">
                                                <Image
                                                    src={"/picture/search.svg"}
                                                    alt="search"
                                                    width={20}
                                                    height={20}
                                                />
                                            </IconButton>
                                        ),
                                    }}
                                    name="search"
                                    placeholder="Search"
                                />
                            </form>
                        </div>


                        <div style={{ display: "flex", width: "20%", marginRight: "10px", flexDirection: "row", justifyContent: "right", alignItems: "center", marginTop: "25px" }}>
                            <IconButton
                                size="medium"
                                edge="start"
                                color="inherit"
                                aria-label="profile"
                                sx={{ width: 20, height: 20 }}
                            >
                                <Avatar alt="Profile" src="/picture/profile.png" sx={{ width: 30, height: 30 }} />
                            </IconButton>
                        </div>

                    </Toolbar>
                </AppBar>
            </Box>
        );
    }

    return <div>{isMobile ? <MobileNavbarPage /> : <ComNavbarPage />}</div>;

}
