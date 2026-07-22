import { FC } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { TypeAnimation } from 'react-type-animation';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';

const features = [
  { icon: <InventoryRoundedIcon sx={{ fontSize: 20, color: '#a5b4fc' }} />, text: 'Gestion intelligente des stocks' },
  { icon: <BarChartRoundedIcon sx={{ fontSize: 20, color: '#a5b4fc' }} />, text: 'Tableaux de bord en temps réel' },
  { icon: <SpeedRoundedIcon sx={{ fontSize: 20, color: '#a5b4fc' }} />, text: 'Interface rapide & intuitive' },
  { icon: <SecurityRoundedIcon sx={{ fontSize: 20, color: '#a5b4fc' }} />, text: 'Sécurité et confidentialité' },
];

const AuthBrandPanel: FC = () => {
  return (
    <Box
      sx={{
        width: { sm: '42%', md: '45%', lg: '50%' },
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 45%, #312e81 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        px: { sm: 5, md: 7, lg: 9 },
        py: 6,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Cercles décoratifs en fond */}
      <Box
        sx={{
          position: 'absolute',
          top: '-100px',
          right: '-80px',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-120px',
          left: '-60px',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '30%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Grille de points décoratifs */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }}
      />

      {/* Contenu */}
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
        {/* Badge */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '50px',
            px: 2,
            py: 0.6,
            mb: 4,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#6366f1',
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                '50%': { opacity: 0.5, transform: 'scale(1.4)' },
              },
            }}
          />
          <Typography sx={{ color: '#a5b4fc', fontSize: '0.78rem', fontWeight: 600, letterSpacing: 0.5 }}>
            Plateforme professionnelle
          </Typography>
        </Box>

        {/* Titre principal */}
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.15,
            mb: 2,
            fontSize: { sm: '2.2rem', md: '2.8rem', lg: '3.2rem' },
          }}
        >
          Gérez vos{' '}
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(90deg, #818cf8, #c084fc, #818cf8)',
              backgroundSize: '200% auto',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              animation: 'gradientMove 3s linear infinite',
              '@keyframes gradientMove': {
                '0%': { backgroundPosition: '0% center' },
                '100%': { backgroundPosition: '200% center' },
              },
            }}
          >
            stocks
          </Box>
          <br />
          en toute simplicité
        </Typography>

        {/* Sous-titre animé */}
        <Box sx={{ mb: 5, minHeight: '32px' }}>
          <Typography
            component="div"
            sx={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 400 }}
          >
            <TypeAnimation
              sequence={[
                'Bienvenue sur GestStocks 👋',
                2000,
                'Une solution complète pour votre entreprise',
                2000,
                'Suivez vos stocks en temps réel',
                2000,
                'Optimisez votre gestion commerciale',
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </Typography>
        </Box>

        {/* Features */}
        <Stack spacing={2.5}>
          {features.map((feature, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                opacity: 0,
                animation: `fadeInLeft 0.5s ease forwards`,
                animationDelay: `${idx * 0.12}s`,
                '@keyframes fadeInLeft': {
                  from: { opacity: 0, transform: 'translateX(-16px)' },
                  to: { opacity: 1, transform: 'translateX(0)' },
                },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  bgcolor: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {feature.icon}
              </Box>
              <Typography sx={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>
                {feature.text}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Ligne décorative */}
        <Box
          sx={{
            mt: 6,
            height: '1px',
            background: 'linear-gradient(90deg, rgba(99,102,241,0.6), transparent)',
            width: '80%',
          }}
        />
        <Typography sx={{ mt: 2, color: '#475569', fontSize: '0.78rem' }}>
          © {new Date().getFullYear()} EntrepriseGS · Tous droits réservés
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthBrandPanel;
