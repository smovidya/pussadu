"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Image from 'next/image'
import { grey02, yellow01, white } from "@/colors";
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
  let width: number;
  let setWidth: (arg0: number) => void;
  if (typeof window !== "undefined") {
    [width, setWidth] = useState<number>(window.innerWidth);
  }
  else{width=0}
  const isMobile = width <= 768;
  const [isChecked, setIsChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
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
        <Image
          src={"picture/logoSmo.svg"}
          alt="logoSmo"
          width={72}
          height={64}
          style={{ position: "fixed", right: "23px", top: "29px" }}
        />
        <Box
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          gap={"130px"}
        >
          <Stack direction={"column"} spacing={"0"} alignItems={"center"}>
            <Image
              src={"picture/yellowBox.svg"}
              alt="iconBox"
              width={108}
              height={108}
            />
            
            <Typography
              className="H1"
              style={{ textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}
            >
              ระบบพัสดุ
            </Typography>
            <Typography className="subHead2">
              สโมสรนิสิตคณะวิทยาศาสตร์
            </Typography>{" "}
          </Stack>
          <Stack direction={"column"} alignItems={"center"}>
            <Button
              size="large"
              variant="contained"
              style={{
                width: "100%",
                height: "35px",
                backgroundColor: "black",
              }}
            >
              <Typography className="bodyEnglishBold1" color={white}>
                LOGIN CHULA SSO
              </Typography>
            </Button>
            <FormControlLabel
              required
              className="body1"
              label="ยอมรับนโยบายการจัดเก็บข้อมูลส่วนตัว"
              control={
                <Checkbox
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                  sx={{ color: "black", "&.Mui-checked": { color: "black" } }}
                />
              }
            />
            <Modal
              open={isModalOpen}
              onClose={handleModalClose}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Stack
                width={"374px"}
                height={"740px"}
                bgcolor={white}
                flexDirection={"column"}
                alignItems={"center"}
                borderRadius={"var(--2, 16px)"}
              >
                <Box
                  ml={"8.5px"}
                  mt={"16.5px"}
                  mb={"9.5px"}
                  alignSelf={"start"}
                >
                  <Typography className="H3">
                    นโยบายการจัดเก็บข้อมูลส่วนบุคคล
                  </Typography>
                </Box>
                <Typography
                  width={"342px"}
                  height={"610px"}
                  overflow={"auto"}
                  style={{ marginBottom: "13px" }}
                >
                  <PolicyText/>
                </Typography>
                <Box>
                  <Button
                    onClick={handleModalClose}
                    variant="contained"
                    style={{
                      width: "340px",
                      height: "42px",
                      backgroundColor: yellow01,
                    }}
                  >
                    <Typography className="body1" fontSize={15}>
                      ตกลง
                    </Typography>
                  </Button>
                </Box>
              </Stack>
            </Modal>
            <Box height={"108px"}></Box>
          </Stack>
        </Box>
      </Box>
    );
  }
  function ComLoginPage() {
    return (
      <Grid container height={"100vh"}>
        <Grid
          item
          xs={7.2}
          bgcolor={yellow01}
          display={"flex"}
          height={"100%"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Image
            src={"picture/yellowBox.svg"}
            alt="iconBox"
            width={200}
            height={200}
          />
        </Grid>
        <Grid item xs={4.8}>
          <Box
            bgcolor={grey02}
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            boxShadow={"5px 0px 20px 0px rgba(0, 0, 0, 0.25) inset"}
            height={"100%"}
            minWidth={"400px"}
          >
            <Image
              src={"picture/logoSmo.svg"}
              alt="logoSmo"
              width={80}
              height={71.5}
              style={{ position: "fixed", right: "28px", top: "33px" }}
            />
            <Typography
              className="H1"
              style={{ textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}
            >
              ระบบพัสดุ
            </Typography>
            <Typography className="subHead1" style={{ marginBottom: "113px" }}>
              สโมสรนิสิตคณะวิทยาศาสตร์
            </Typography>

            <Button
              variant="contained"
              style={{
                width: "285px",
                height: "35px",
                backgroundColor: "black",
              }}
            >
              <Typography className="bodyEngBold1" color={white}>
                LOGIN CHULA SSO
              </Typography>
            </Button>
            <FormControlLabel
              required
              className="body1"
              label="ยอมรับนโยบายการจัดเก็บข้อมูลส่วนตัว"
              control={
                <Checkbox
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                  sx={{ color: "black", "&.Mui-checked": { color: "black" } }}
                />
              }
            />
            <Modal
              open={isModalOpen}
              onClose={handleModalClose}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Stack
                width={"760px"}
                height={"620px"}
                bgcolor={white}
                flexDirection={"column"}
                alignItems={"center"}
                borderRadius={"var(--2, 16px)"}
              >
                <Box
                  ml={"23.5px"}
                  mt={"15.5px"}
                  mb={"17.5px"}
                  alignSelf={"start"}
                >
                  <Typography className="H3">
                    นโยบายการจัดเก็บข้อมูลส่วนบุคคล
                  </Typography>
                </Box>
                <Typography
                  width={"696px"}
                  height={"481px"}
                  overflow={"auto"}
                  style={{ marginBottom: "13px" }}
                >
                  <PolicyText/>
                </Typography>
                <Box>
                  <Button
                    onClick={handleModalClose}
                    variant="contained"
                    style={{
                      width: "694px",
                      height: "42px",
                      backgroundColor: yellow01,
                    }}
                  >
                    <Typography className="body1" fontSize={15}>
                      ตกลง
                    </Typography>
                  </Button>
                </Box>
              </Stack>
            </Modal>
          </Box>
        </Grid>
      </Grid>
    );
  }
  return <div>{isMobile ? MobileLoginPage() : ComLoginPage()}</div>;
}