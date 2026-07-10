import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  direction: "rtl",
  palette: {
    mode: "light",
    primary: { main: "#0071E3", light: "#EAF4FF", dark: "#0058B0", contrastText: "#FFFFFF" },
    secondary: { main: "#14B8A6", light: "#CCFBF1", dark: "#0F766E", contrastText: "#FFFFFF" },
    success: { main: "#34C759" },
    warning: { main: "#FF9F0A" },
    error: { main: "#FF3B30" },
    background: { default: "#F5F5F7", paper: "#FFFFFF" },
    text: { primary: "#1D1D1F", secondary: "#6E6E73" },
    divider: "#E5E5EA",
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "IRANSans, sans-serif",
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 12, minHeight: 42 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiTextField: { defaultProps: { size: "small", fullWidth: true, variant: "outlined" } },
    MuiFormControl: { defaultProps: { size: "small", fullWidth: true, variant: "outlined" } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 12 },
        input: { direction: "rtl", textAlign: "start" },
      },
    },
    MuiInputBase: { styleOverrides: { root: { direction: "rtl" }, input: { direction: "rtl", textAlign: "start" } } },
    MuiInputLabel: { styleOverrides: { root: { transformOrigin: "top start" } } },
    MuiFormHelperText: { styleOverrides: { root: { textAlign: "start" } } },
    MuiSelect: { defaultProps: { size: "small", fullWidth: true } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 22 } } },
    MuiCard: { styleOverrides: { root: { border: "1px solid #E5E5EA", boxShadow: "none" } } },
  },
});
