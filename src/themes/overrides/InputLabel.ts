// ==============================|| OVERRIDES - INPUT LABEL ||============================== //

import { Theme } from "@mui/material";

export default function InputLabel(theme: Theme) {
  const isDark = theme.palette.mode === 'dark';
  return {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: isDark ? '#94a3b8' : theme.palette.grey[600],
          '&.Mui-focused': {
            color: isDark ? '#818cf8' : theme.palette.primary.main,
          },
          '&.Mui-error': {
            color: isDark ? '#f87171' : theme.palette.error.main,
          },
        },
        outlined: {
          lineHeight: '1rem',
          top: -4,
          '&.MuiInputLabel-sizeSmall': {
            lineHeight: '1em'
          },
          '&.MuiInputLabel-shrink': {
            background: isDark ? theme.palette.background.paper : theme.palette.background.paper,
            padding: '0 8px',
            marginLeft: -6,
            top: 2,
            lineHeight: '1rem',
            color: isDark ? '#cbd5e1' : undefined,
          }
        }
      }
    }
  };
}
