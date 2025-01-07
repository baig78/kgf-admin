import { createTheme } from '@mui/material/styles';

// Define consistent spacing and sizing
const SPACING_UNIT = 8; // 8px base unit

const theme = createTheme({
  spacing: SPACING_UNIT,
  palette: {
    primary: {
      main: '#1976d2', // Adjust to your brand color
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e', // Adjust as needed
    },
    background: {
      default: '#f4f4f4',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: SPACING_UNIT * 2,
          paddingRight: SPACING_UNIT * 2,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: SPACING_UNIT * 2,
          margin: SPACING_UNIT,
        },
      },
    },
  },
});

export default theme;
