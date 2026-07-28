import { forwardRef, ReactNode } from 'react';
import { useTheme, SxProps } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { Theme } from '@mui/material';

declare module '@mui/material/styles' {
  interface Theme {
    customShadows: {
      z1: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    customShadows?: {
      z1?: string;
    };
  }
}

interface MainCardProps {
  border?: boolean;
  boxShadow?: boolean;
  children?: ReactNode;
  content?: boolean;
  contentSX?: SxProps<Theme>;
  darkTitle?: boolean;
  elevation?: number;
  secondary?: ReactNode;
  shadow?: string;
  sx?: SxProps<Theme>;
  title?: string | ReactNode;
  [key: string]: any; // for other props
}

const headerSX = {
  p: 2.5,
  '& .MuiCardHeader-action': { m: '0px auto', alignSelf: 'center' }
};

const MainCard = forwardRef<HTMLDivElement, MainCardProps>(
  (
    {
      border = true,
      boxShadow,
      children,
      content = true,
      contentSX = {},
      darkTitle,
      elevation,
      secondary,
      shadow,
      sx = {},
      title,
      ...others
    },
    ref
  ) => {
    const theme = useTheme();
    boxShadow = theme.palette.mode === 'dark' ? boxShadow || true : boxShadow;

    return (
      <Card
        elevation={elevation || 0}
        ref={ref}
        {...others}
        sx={{
          color: 'text.primary',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(145deg, rgba(20, 33, 56, 0.98), rgba(13, 24, 43, 0.96))'
              : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 253, 0.98))',
          backdropFilter: 'blur(14px)',
          border: border ? `1px solid ${theme.palette.divider}` : 'none',
          borderRadius: 3,
          boxShadow: boxShadow && (!border || theme.palette.mode === 'dark') ? shadow || theme.customShadows.z1 : 'none',
          transition: 'border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
          '&:hover': {
            borderColor: border ? theme.palette.primary.main : 'transparent',
            boxShadow: boxShadow ? shadow || theme.customShadows.z1 : 'none'
          },
          '& pre': {
            m: 0,
            p: '16px !important',
            fontFamily: theme.typography.fontFamily,
            fontSize: '0.75rem'
          },
          ...sx
        }}
        
      >
        {/* card header and action */}
        {!darkTitle && title && <CardHeader sx={headerSX} titleTypographyProps={{ variant: 'subtitle1' }} title={title} action={secondary} />}
        {content && <CardContent sx={contentSX}>{children}</CardContent>}
        {!content && children}
      </Card>
    );
  }
);

export default MainCard;
