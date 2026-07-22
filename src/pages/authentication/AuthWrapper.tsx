import { FC } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Logo from '../../components/logo';
import AuthFooter from '../../components/cards/AuthFooter';
import { ChildrenProps } from '../../typescript/Account';
import AuthBrandPanel from './AuthBrandPanel';

const AuthWrapper: FC<ChildrenProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#0f172a',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Panneau gauche — Branding (masqué sur mobile) */}
      {!isMobile && <AuthBrandPanel />}

      {/* Panneau droit — Formulaire */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          position: 'relative',
          // Fond gradient sur mobile (pas de panneau gauche)
          ...(isMobile && {
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          }),
          // Fond blanc/clair sur desktop (côté formulaire)
          ...(!isMobile && {
            bgcolor: theme.palette.mode === 'dark' ? '#111827' : '#f8fafc',
          }),
        }}
      >
        {/* Décoration fond mobile */}
        {isMobile && (
          <>
            <Box
              sx={{
                position: 'absolute',
                top: '-120px',
                right: '-80px',
                width: '350px',
                height: '350px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '-100px',
                left: '-60px',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
          </>
        )}

        {/* Header avec Logo */}
        <Box sx={{ p: { xs: 2.5, sm: 3 }, zIndex: 1 }}>
          <Logo />
        </Box>

        {/* Contenu formulaire centré */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 2, sm: 4, md: 5 },
            py: { xs: 2, sm: 3 },
            zIndex: 1,
          }}
        >
          {children}
        </Box>

        {/* Footer */}
        <Box sx={{ px: 3, py: 2, zIndex: 1 }}>
          <AuthFooter />
        </Box>
      </Box>
    </Box>
  );
};

export default AuthWrapper;
