// ==============================|| OVERRIDES - DIALOG ||============================== //
import { Theme } from '@mui/material/styles';

export default function Dialog(theme: Theme) {
  const isDark = theme.palette.mode === 'dark';

  return {
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          backgroundColor: isDark ? '#152238' : '#ffffff',
          backgroundImage: 'none',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: isDark
            ? '0 25px 60px -12px rgba(0, 0, 0, 0.75), 0 0 35px rgba(99, 102, 241, 0.1)'
            : '0 20px 45px -15px rgba(0, 0, 0, 0.15)',
          colorScheme: isDark ? 'dark' : 'light',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.15rem',
          fontWeight: 700,
          color: isDark ? '#f1f5f9' : '#0f172a',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: isDark ? '#e2e8f0' : '#1e293b',
        },
      },
    },
    MuiDialogContentText: {
      styleOverrides: {
        root: {
          color: isDark ? '#94a3b8' : '#64748b',
        },
      },
    },
  };
}
