import { yellow } from "@mui/material/colors";
import { PaletteColorOptions, createTheme } from "@mui/material/styles";
import { black01, green1, grey01, grey02, red01, white, yellow01, yellow02 } from "./colors";

declare module "@mui/material/styles" {
  interface Palette {
    black01: PaletteColorOptions;
    green1: PaletteColorOptions;
    grey01: PaletteColorOptions;
    grey02: PaletteColorOptions;
    red01: PaletteColorOptions;
    white: PaletteColorOptions,
    yellow01: PaletteColorOptions;
    yellow02 : PaletteColorOptions;
    
  }
  interface PaletteOptions {
    black01: PaletteColorOptions;
    green1: PaletteColorOptions;
    grey01: PaletteColorOptions;
    grey02: PaletteColorOptions;
    red01: PaletteColorOptions;
    white: PaletteColorOptions,
    yellow01: PaletteColorOptions;
    yellow02 : PaletteColorOptions;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    black01: true;
    green1: true;
    grey01: true;
    grey02: true;
    red01: true;
    white: true,
    yellow01: true;
    yellow02 : true;
  }
}

// Define your custom theme
const theme = createTheme({
  palette: {
    yellow01: {
        main: yellow01
    },
    yellow02: {
        main: yellow02
    },
    green1: {
        main: green1
    },
    grey01: {
        main: grey01
    },
    grey02: {
        main: grey02
    },
    black01: {
        main: black01,
    },
    red01: {
        main: red01
    },
    white: {
        main: white
    }
    // Add more palette customization if needed
  },
  typography: {
    fontFamily: [
      "Roboto",
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    // Add more typography customization if needed
  },
});

export default theme;
