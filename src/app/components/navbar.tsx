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
import { yellow01, black01, yellow02 } from '@/colors';
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
            <Box sx={{ flexGrow: 1 }}>
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
                            style={{ width: "50%", height: "40px", marginInline: "50px", border: "0px", fontSize: "15px" }}
                            onSubmit={(event) => {
                                event.preventDefault();
                                // js script to redirect to the search page
                                const searchValue = (event.target as HTMLFormElement).querySelector('input[name="search"]')?.value;
                                if (searchValue == null || searchValue === "") { return; }
                                else
                                    window.location.href = `/shopping/search/item=${searchValue}`;
                            }}
                        >
                            <input
                                style={{ paddingLeft: "20px", paddingInline: "20px", marginLeft: "20px", borderRadius: "20px", width: "100%", height: "100%", color: black01 }}
                                type="text"
                                name="search"
                            />
                        </form>
                        <div style={{ display: "flex", width: "100%", gap: "30px", marginRight: "30px", flexDirection: "row", justifyContent: "right", alignItems: "center" }}>
                        <IconButton aria-label="profile" size="medium">
                            <Avatar alt="Profile" src="/picture/profile.png" sx={{ width: 40, height: 40 }} onClick={handleProfileClick} onMouseOver={handleAvatarMouseOver} />
                        </IconButton>
                        <AdminButton />
                        </div>
                    </Toolbar>

                </AppBar>
            </Box>
        );
    }

    // Navbar for Mobile
    function MobileNavbarPage() {
        return (
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            News
                        </Typography>
                        <Button color="inherit">Login</Button>
                    </Toolbar>
                </AppBar>
            </Box>
        );
    }

    return <div>{isMobile ? <MobileNavbarPage /> : <ComNavbarPage />}</div>;

}
