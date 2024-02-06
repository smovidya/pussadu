"use client";

import { white, yellow01 } from "@/colors";
import { Box, Button, Typography } from "@mui/material";

export default function LogIn() {
  return (
    <>
      <Box bgcolor={yellow01} height={120} width={120}>
        <Button variant="contained" color="black01" sx={{borderRadius : "36px"}}>
          <Typography color={white}>Hello</Typography>
        </Button>
      </Box>
    </>
  );
}
