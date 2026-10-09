// material-ui
import { alpha, Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - OUTLINED INPUT ||============================== //

export default function OutlinedInput(theme: Theme) {
  const isDark = theme.palette.mode === 'dark';
  return {
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          padding: '10.5px 14px 10.5px 12px',
          colorScheme: isDark ? 'dark' : 'light',
        },
        notchedOutline: {
          borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : theme.palette.grey[300],
          transition: 'border-color 0.2s ease',
        },
        root: {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : undefined,
          borderRadius: 8,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.4)' : theme.palette.primary.light,
          },
          '&.Mui-focused': {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : undefined,
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, isDark ? 0.35 : 0.2)}`,
            '& .MuiOutlinedInput-notchedOutline': {
              border: `1px solid ${isDark ? theme.palette.primary.main : theme.palette.primary.light}`,
            },
          },
          '&.Mui-error': {
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.error.light,
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 2px ${alpha(theme.palette.error.main, 0.2)}`,
              '& .MuiOutlinedInput-notchedOutline': {
                border: `1px solid ${theme.palette.error.light}`,
              },
            },
          },
        },
        inputSizeSmall: {
          padding: '7.5px 8px 7.5px 12px',
          colorScheme: isDark ? 'dark' : 'light',
        },
        inputMultiline: {
          padding: 0,
        },
      },
    },
  };
}
