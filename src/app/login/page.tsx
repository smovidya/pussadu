"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { grey02, yellow01, white } from "@/colors";
import {
  Box,
  Button,
  Typography,
  Stack,
  FormControlLabel,
  Checkbox,
  Card,
  CardMedia,
  Modal,
} from "@mui/material";
import "@/app/globals.css";
import "/public/font/Sukhumvit.css";
import "@fontsource/roboto/700.css";
export default function LogIn() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [width, setWidth] = useState<number>(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  const isMobile = width <= 768;
  return (
    <div>
      {isMobile ? (
        <Box
          className={"rightBox"}
          bgcolor={yellow01}
          width={"100%"}
          height={"100%"}
          position={"fixed"}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          boxShadow={"5px 0px 20px 0px rgba(0, 0, 0, 0.25) inset"}
          minWidth={"400px"}
        >
          <img
            src="picture/logoSmo.png"
            alt="logoSmo"
            height={"64px"}
            width={"72px"}
            style={{ position: "fixed", right: "23px", top: "23px" }}
          />
          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            gap={"136px"}
          >
            <Stack direction={"column"} spacing={"0"} alignItems={"center"}>
              <img
                src="picture/yellowBox.png"
                alt="Box"
                width={"108px"}
                height={"108px"}
              />
              <Typography
                className="normalThaiFont"
                fontSize={"64px"}
                lineHeight={"normal"}
                style={{ textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}
              >
                ระบบพัสดุ
              </Typography>
              <Typography className="normalThaiFont" fontSize={"28px"}>
                สโมสรนิสิตคณะวิทยาศาสตร์
              </Typography>{" "}
              <Box height={"108px"}></Box>
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
                <Typography
                  fontFamily={"Roboto"}
                  fontSize={"16px"}
                  fontWeight={"700"}
                  color={white}
                >
                  LOGIN CHULA SSO
                </Typography>
              </Button>
              <FormControlLabel
                required
                control={<Checkbox onClick={handleOpen} />}
                label="ยอมรับนโยบายการจัดเก็บข้อมูลส่วนตัว"
                defaultChecked
              />
              <Modal
                open={open}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Stack //Not Finish
                  width={"360px"}
                  height={"520px"}
                  bgcolor={white}
                  alignItems={"center"}
                  flexDirection={"column"}
                  borderRadius={"var(--2, 16px)"}
                >
                  <Typography
                    className="normalThaiFont"
                    fontSize={20}
                    alignSelf={"start"}
                    paddingTop={"18px"}
                    paddingBottom={"12px"}
                    paddingLeft={"23.5px"}
                  >
                    นโยบายการจัดเก็บข้อมูลส่วนบุคคล
                  </Typography>
                  <Typography
                    className="lightThaiFont"
                    fontSize={"16px"}
                    width={"350px"}
                    height={"410px"}
                    paddingX={"20px"}
                    overflow={"auto"}
                  >
                    <p>
                      สโมสรนิสิตคณะวิทยาศาสตร์จุฬาลงกรณ์มหาวิทยาลัยให้ความสำคัญต่อความปลอดภัยของข้อมูลส่วนบุคคลของท่าน
                      และเพื่อช่วยให้เราปกป้องข้อมูลส่วนบุคคล
                      (โดยอ้างอิงนิยามของข้อมูลส่วนบุคคลในพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล
                      พ.ศ. 2562) ของท่านให้ปลอดภัย
                      ตามมาตรฐานสูงสุดสอดคล้องกับพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล
                      พ.ศ. 2562 สโมสรนิสิตคณะวิทยาศาสตร์
                      จุฬาลงกรณ์มหาวิทยาลัยขอความยินยอมจากท่านเพื่อการดำเนินการลงประชามติสำหรับนิสิตคณะวิทยาศาสตร์
                      รวมถึงบทบาทที่เกี่ยวข้อง
                      ดังนั้นเราได้กำหนดนโยบายการเก็บรวบรวมข้อมูลส่วนบุคคลดังต่อไปนี้
                    </p>
                    <ol>
                      <li>
                        1. เพื่อตรวจสอบสิทธิในการลงประชามติของท่าน
                        เราขอเข้าถึงข้อมูลส่วนบุคคลของท่านผ่านระบบ Chula Single
                        Sign-On (Chula SSO) ซึ่งรวมถึงชื่อ รหัสประจำตัวนิสิต
                        ปีการศึกษา และคณะที่ท่านสังกัด
                        โดยมีเพียงรหัสประจำตัวนิสิตของท่านที่จะถูกบันทึกลงในระบบเพื่อป้องกันไม่ให้มีการลงคะแนนซ้ำซ้อน
                        อย่างไรก็ตาม
                        ระบบจะไม่เปิดเผยว่าท่านได้ลงคะแนนให้กับตัวเลือกใด
                      </li>
                      <li>
                        2.
                        ภายหลังจากประกาศผลประชามติอย่างเป็นทางการในช่องทางที่ได้ประกาศไว้แล้ว
                        เราจะทำการทำลายข้อมูลของท่านที่ได้บันทึกลงในระบบภายในเวลา
                        15 วัน
                        เพื่อเป็นการยืนยันว่าข้อมูลส่วนบุคคลของท่านจะได้รับการปกป้องและไม่ถูกนำไปใช้เพื่อวัตถุประสงค์อื่นใดนอกจากการลงประชามติเท่านั้น
                      </li>
                      <li>
                        3. เพื่อปรับปรุงความถูกต้องของข้อมูลในระบบ
                        เราอาจเก็บข้อมูลการใช้งานผ่านระบบคอมพิวเตอร์หรืออุปกรณ์ที่ใช้ในการเข้าถึงเว็บไซต์
                        เช่น ประเภทของเบราว์เซอร์และคุกกี้
                        ข้อมูลเหล่านี้จะช่วยให้เราเข้าใจวิธีการใช้งานเว็บไซต์ของท่านและปรับปรุงประสบการณ์การใช้งานของท่านให้ดียิ่งขึ้น
                      </li>
                    </ol>
                    <p>
                      
                      ขอให้ท่านยอมรับและเห็นด้วยกับเงื่อนไขและข้อกำหนดที่ระบุในนโยบายความเป็นส่วนตัวนี้
                      เพื่อเข้าใช้งานระบบลงประชามติ นโยบายนี้อาจมีการเปลี่ยนแปลง
                      และการแก้ไขใด ๆ
                      จะถูกแจ้งให้ท่านทราบผ่านช่องทางการประชาสัมพันธ์ของสโมสรฯ
                      หากท่านมีข้อสงสัยหรือข้อคำถาม
                      <p>กรุณาติดต่อ</p>
                      <p>Email:smovidyachula@gmail.com</p>
                      <p>
                        Facebook: สโมสรนิสิตคณะวิทยาศาสตร์จุฬาลงกรณ์มหาวิทยาลัย
                        - CU Smovidya
                      </p>
                      <p>Instagram:@smovidya_official</p>
                    </p>
                  </Typography>
                  <Button
                    onClick={handleClose}
                    variant="contained"
                    size="large"
                    style={{
                      width: "240px",
                      height: "22.5px",
                      backgroundColor: yellow01,
                      justifySelf: "center",
                      marginTop: "15px",
                    }}
                  >
                    <Typography className="lightThaiFont" fontSize={15}>
                      ตกลง
                    </Typography>
                  </Button>
                </Stack>
              </Modal>
            </Stack>
          </Box>
        </Box>
      ) : (
        <Stack display={"flex"} direction={"row"} height={"100vh"}>
          <Box
            className={"leftBox"}
            bgcolor={yellow01}
            width={"60%"} //ความกว้างสบกันไม่พอดี
            height={"100%"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <img src="picture/yellowBox.png" alt="BoxIcon" />
          </Box>
          <Box
            className={"rightBox"}
            bgcolor={grey02}
            width={"40%"}
            height={"100%"}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            boxShadow={"5px 0px 20px 0px rgba(0, 0, 0, 0.25) inset"}
            minWidth={"400px"}
          >
            <img
              src="picture/logoSmo.png"
              alt="logoSmo"
              height={"64px"}
              width={"72px"}
              style={{ position: "fixed", right: "23px", top: "23px" }}
            />
            <Box
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
              gap={"136px"}
            >
              <Stack direction={"column"} spacing={"0"} alignItems={"center"}>
                <Typography
                  className="normalThaiFont"
                  fontSize={"64px"}
                  lineHeight={"normal"}
                  style={{ textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}
                >
                  ระบบพัสดุ
                </Typography>
                <Typography className="normalThaiFont" fontSize={"28px"}>
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
                  <Typography
                    fontFamily={"Roboto"}
                    fontSize={"16px"}
                    fontWeight={"700"}
                    color={white}
                  >
                    LOGIN CHULA SSO
                  </Typography>
                </Button>
                <FormControlLabel
                  required
                  control={<Checkbox onClick={handleOpen} />}
                  label="ยอมรับนโยบายการจัดเก็บข้อมูลส่วนตัว"
                  defaultChecked
                />
                <Modal
                  open={open}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Stack //Not Finish
                    width={"760px"}
                    height={"620px"}
                    bgcolor={white}
                    alignItems={"center"}
                    flexDirection={"column"}
                    borderRadius={"var(--2, 16px)"}
                  >
                    <Typography
                      className="normalThaiFont"
                      fontSize={24}
                      alignSelf={"start"}
                      paddingTop={"17.5px"}
                      paddingBottom={"17.5px"}
                      paddingLeft={"23.5px"}
                    >
                      นโยบายการจัดเก็บข้อมูลส่วนบุคคล
                    </Typography>
                    <Typography
                      className="lightThaiFont"
                      fontSize={"16px"}
                      width={"696px"}
                      height={"480px"}
                      paddingX={"30px"}
                      paddingBottom={"5px"}
                      overflow={"auto"}
                    >
                      <p>
                        สโมสรนิสิตคณะวิทยาศาสตร์จุฬาลงกรณ์มหาวิทยาลัยให้ความสำคัญต่อความปลอดภัยของข้อมูลส่วนบุคคลของท่าน
                        และเพื่อช่วยให้เราปกป้องข้อมูลส่วนบุคคล
                        (โดยอ้างอิงนิยามของข้อมูลส่วนบุคคลในพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล
                        พ.ศ. 2562) ของท่านให้ปลอดภัย
                        ตามมาตรฐานสูงสุดสอดคล้องกับพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล
                        พ.ศ. 2562 สโมสรนิสิตคณะวิทยาศาสตร์
                        จุฬาลงกรณ์มหาวิทยาลัยขอความยินยอมจากท่านเพื่อการดำเนินการลงประชามติสำหรับนิสิตคณะวิทยาศาสตร์
                        รวมถึงบทบาทที่เกี่ยวข้อง
                        ดังนั้นเราได้กำหนดนโยบายการเก็บรวบรวมข้อมูลส่วนบุคคลดังต่อไปนี้
                      </p>
                      <ol>
                        <li>
                          1. เพื่อตรวจสอบสิทธิในการลงประชามติของท่าน
                          เราขอเข้าถึงข้อมูลส่วนบุคคลของท่านผ่านระบบ Chula
                          Single Sign-On (Chula SSO) ซึ่งรวมถึงชื่อ
                          รหัสประจำตัวนิสิต ปีการศึกษา และคณะที่ท่านสังกัด
                          โดยมีเพียงรหัสประจำตัวนิสิตของท่านที่จะถูกบันทึกลงในระบบเพื่อป้องกันไม่ให้มีการลงคะแนนซ้ำซ้อน
                          อย่างไรก็ตาม
                          ระบบจะไม่เปิดเผยว่าท่านได้ลงคะแนนให้กับตัวเลือกใด
                        </li>
                        <li>
                          2.
                          ภายหลังจากประกาศผลประชามติอย่างเป็นทางการในช่องทางที่ได้ประกาศไว้แล้ว
                          เราจะทำการทำลายข้อมูลของท่านที่ได้บันทึกลงในระบบภายในเวลา
                          15 วัน
                          เพื่อเป็นการยืนยันว่าข้อมูลส่วนบุคคลของท่านจะได้รับการปกป้องและไม่ถูกนำไปใช้เพื่อวัตถุประสงค์อื่นใดนอกจากการลงประชามติเท่านั้น
                        </li>
                        <li>
                          3. เพื่อปรับปรุงความถูกต้องของข้อมูลในระบบ
                          เราอาจเก็บข้อมูลการใช้งานผ่านระบบคอมพิวเตอร์หรืออุปกรณ์ที่ใช้ในการเข้าถึงเว็บไซต์
                          เช่น ประเภทของเบราว์เซอร์และคุกกี้
                          ข้อมูลเหล่านี้จะช่วยให้เราเข้าใจวิธีการใช้งานเว็บไซต์ของท่านและปรับปรุงประสบการณ์การใช้งานของท่านให้ดียิ่งขึ้น
                        </li>
                      </ol>
                      <p>

                        ขอให้ท่านยอมรับและเห็นด้วยกับเงื่อนไขและข้อกำหนดที่ระบุในนโยบายความเป็นส่วนตัวนี้
                        เพื่อเข้าใช้งานระบบลงประชามติ
                        นโยบายนี้อาจมีการเปลี่ยนแปลง และการแก้ไขใด ๆ
                        จะถูกแจ้งให้ท่านทราบผ่านช่องทางการประชาสัมพันธ์ของสโมสรฯ
                        หากท่านมีข้อสงสัยหรือข้อคำถาม
                        <p>กรุณาติดต่อ</p>
                        <p>Email:smovidyachula@gmail.com</p>
                        <p>
                          Facebook:
                          สโมสรนิสิตคณะวิทยาศาสตร์จุฬาลงกรณ์มหาวิทยาลัย - CU
                          Smovidya
                        </p>
                        <p>Instagram:@smovidya_official</p>
                      </p>
                    </Typography>
                    <Box marginTop={"12px"}>
                      <Button
                        onClick={handleClose}
                        variant="contained"
                        size="large"
                        style={{
                          width: "620px",
                          height: "42px",
                          backgroundColor: yellow01,
                          justifySelf: "center",
                        }}
                      >
                        <Typography className="lightThaiFont" fontSize={15}>
                          ตกลง
                        </Typography>
                      </Button>
                    </Box>
                  </Stack>
                </Modal>
              </Stack>
            </Box>
          </Box>
        </Stack>
      )}
    </div>
  );
}
