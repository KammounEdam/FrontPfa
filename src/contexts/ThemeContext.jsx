import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#0d47a1' : '#1976d2',
        light: darkMode ? '#42a5f5' : '#42a5f5',
        dark: darkMode ? '#1a237e' : '#0d47a1',
        contrastText: '#ffffff',
      },
      secondary: {
        main: darkMode ? '#2c5282' : '#3182ce',
        light: darkMode ? '#63b3ed' : '#63b3ed',
        dark: darkMode ? '#1a365d' : '#2c5282',
        contrastText: '#ffffff',
      },
      error: {
        main: darkMode ? '#f56565' : '#e53e3e',
      },
      warning: {
        main: darkMode ? '#ed8936' : '#dd6b20',
      },
      info: {
        main: darkMode ? '#4299e1' : '#3182ce',
      },
      success: {
        main: darkMode ? '#48bb78' : '#38a169',
      },
      background: {
        default: darkMode ? '#1a202c' : '#f7fafc',
        paper: darkMode ? '#2d3748' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#f7fafc' : '#2d3748',
        secondary: darkMode ? '#e2e8f0' : '#4a5568',
      },
      divider: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 600 },
      h2: { fontWeight: 600 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            padding: '8px 16px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: darkMode 
              ? '0 4px 10px rgba(0, 0, 0, 0.3)'
              : '0 4px 10px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: darkMode ? '#1a237e' : '#1976d2',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            backgroundColor: darkMode ? '#1a237e' : '#1976d2',
          },
        },
      },
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 