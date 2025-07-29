import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#5D5CDE',
      light: '#8281E6',
      dark: '#4140B8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF5722',
      light: '#FF8A65',
      dark: '#E64A19',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    error: {
      main: '#D32F2F',
    },
    warning: {
      main: '#FFA000',
    },
    info: {
      main: '#1976D2',
    },
    success: {
      main: '#388E3C',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          boxShadow: 'none',
          padding: '8px 16px',
        },
        containedPrimary: {
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(93, 92, 222, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

// Crear una versión dark del tema
export const darkTheme = createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    mode: 'dark',
    primary: {
      ...theme.palette.primary,
    },
    secondary: {
      ...theme.palette.secondary,
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#EEEEEE',
      secondary: '#AAAAAA',
    },
  },
});

// Función para alternar entre temas
export const getThemeByMode = (mode) => {
  return mode === 'dark' ? darkTheme : theme;
};

export default theme;