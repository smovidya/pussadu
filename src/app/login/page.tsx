'use client'

import * as React from "react";
import { useState, useEffect } from "react";
import Image from 'next/image'
import { grey02, yellow01, white } from "@/app/";
import {
  Box,
  Button,
  Typography,
  Stack,
  FormControlLabel,
  Checkbox,
  Modal,
  Grid,
} from "@mui/material";
import "@/app/globals.css";
import "@fontsource/roboto/700.css";
import "/public/font/fontStyle.css";
import { PolicyText } from "@/app/components/policy";

export default function Login() {
  const [width, setWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [isChecked, setIsChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = width <= 768;

  useEffect(() => {
    const handleWindowSizeChange = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  const handleCheckboxChange = (event: {
    target: { checked: boolean | ((prevState: boolean) => boolean) };
  }) => {
    setIsChecked(event.target.checked);
    if (event.target.checked) {
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  function MobileLoginPage() {
    return (
      <Box
        bgcolor={yellow01}
        width={"100%"}
        height={"100%"}
        display={"flex"}
        position={"fixed"}
        alignItems={"center"}
        justifyContent={"center"}
        boxShadow={"5px 0px 20px 0px rgba(0, 0, 0, 0.25) inset"}
        minWidth={"300px"}
      >
        {/* Mobile login page JSX */}
      </Box>
    );
  }

  function ComLoginPage() {
    return (
      <Grid container height={"100vh"}>
        {/* Complete login page JSX */}
      </Grid>
    );
  }

  return <div>{isMobile ? <MobileLoginPage /> : <ComLoginPage />}</div>;
}