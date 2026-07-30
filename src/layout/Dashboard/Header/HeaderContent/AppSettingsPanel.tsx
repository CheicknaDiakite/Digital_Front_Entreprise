import { useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography,
  Divider,
  Stack,
  Switch,
  FormControlLabel,
  Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import HideImageOutlinedIcon from '@mui/icons-material/HideImageOutlined';
import CloseIcon from '@mui/icons-material/Close';

import { useThemeMode } from '../../../../themes/ThemeModeContext';
import { useAppSettings } from '../../../../themes/AppSettingsContext';

// ==============================|| PANNEAU DE PARAMÈTRES ||============================== //

interface AppSettingsPanelProps {
  listMode?: boolean;
}

export default function AppSettingsPanel({ listMode = false }: AppSettingsPanelProps) {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();
  const { showBackground, setShowBackground } = useAppSettings();
  const [open, setOpen] = useState(false);


  const isDark = mode === 'dark';

  return (
    <>
      {listMode ? (
        <ListItemButton
          onClick={() => setOpen(true)}
          aria-label="Ouvrir les paramètres d'affichage"
          sx={{
            borderRadius: '12px',
            mb: 0.5,
            py: 1,
            px: 1.5,
            color: theme.palette.text.primary,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(99, 102, 241, 0.15)',
              transform: 'translateX(4px)',
            },
          }}
        >
          <Box
            sx={{
              minWidth: 32,
              width: 32,
              height: 32,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              mr: 1.5,
              transition: 'transform 0.2s ease',
            }}
          >
            <SettingsIcon style={{ fontSize: '1.1rem' }} />
          </Box>
          <ListItemText
            primary="Paramètres d'affichage"
            primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
          />
        </ListItemButton>
      ) : (
        <Tooltip title="Paramètres d'affichage">
          <IconButton
            onClick={() => setOpen(true)}
            color="inherit"
            size="small"
            aria-label="Ouvrir les paramètres d'affichage"
            sx={{
              borderRadius: '10px',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(99, 102, 241, 0.15)',
                transform: 'rotate(30deg)',
              },
            }}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            background: isDark
              ? 'linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.97) 100%)'
              : 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
            backdropFilter: 'blur(20px)',
            borderLeft: `1px solid ${theme.palette.divider}`,
            boxShadow: isDark
              ? '-20px 0 60px rgba(0,0,0,0.5), 0 0 30px rgba(99,102,241,0.08)'
              : '-20px 0 60px rgba(15,23,42,0.12)',
          },
        }}
      >
        {/* En-tête */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 100%)',
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              }}
            >
              <SettingsIcon sx={{ color: 'white', fontSize: '1.1rem' }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                Paramètres
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Personnalisation de l'affichage
              </Typography>
            </Box>
          </Stack>
          <IconButton
            size="small"
            onClick={() => setOpen(false)}
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444' },
              transition: 'all 0.2s ease',
            }}
            aria-label="Fermer les paramètres"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Corps */}
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Section : Apparence */}
          <Typography
            variant="overline"
            sx={{ color: 'text.disabled', letterSpacing: 1.2, fontSize: '0.68rem' }}
          >
            Apparence
          </Typography>

          {/* Thème sombre / clair */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '14px',
              border: `1px solid ${theme.palette.divider}`,
              background: isDark
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'rgba(99,102,241,0.35)',
                background: isDark
                  ? 'rgba(99,102,241,0.06)'
                  : 'rgba(99,102,241,0.04)',
              },
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '10px',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(99,102,241,0.12)',
                  }}
                >
                  {isDark
                    ? <Brightness7Icon sx={{ color: '#fbbf24', fontSize: '1.1rem' }} />
                    : <Brightness4Icon sx={{ color: '#6366f1', fontSize: '1.1rem' }} />
                  }
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {isDark ? 'Mode sombre' : 'Mode clair'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
                  </Typography>
                </Box>
              </Stack>
              <Switch
                checked={isDark}
                onChange={toggleTheme}
                size="small"
                inputProps={{ 'aria-label': 'Basculer le thème' }}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#6366f1' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    bgcolor: 'rgba(99,102,241,0.5)',
                  },
                }}
              />
            </Stack>
          </Paper>

          <Divider sx={{ my: 0.5, opacity: 0.5 }} />

          {/* Section : Fond d'écran */}
          <Typography
            variant="overline"
            sx={{ color: 'text.disabled', letterSpacing: 1.2, fontSize: '0.68rem' }}
          >
            Fond d'écran
          </Typography>

          {/* Afficher l'image de fond */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '14px',
              border: `1px solid ${theme.palette.divider}`,
              background: isDark
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'rgba(99,102,241,0.35)',
                background: isDark
                  ? 'rgba(99,102,241,0.06)'
                  : 'rgba(99,102,241,0.04)',
              },
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '10px',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: showBackground
                      ? 'rgba(16,185,129,0.12)'
                      : 'rgba(107,114,128,0.12)',
                  }}
                >
                  {showBackground
                    ? <WallpaperIcon sx={{ color: '#10b981', fontSize: '1.1rem' }} />
                    : <HideImageOutlinedIcon sx={{ color: '#6b7280', fontSize: '1.1rem' }} />
                  }
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Image de fond
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {showBackground ? 'Fond d\'image activé' : 'Fond uni activé'}
                  </Typography>
                </Box>
              </Stack>
              <Switch
                checked={showBackground}
                onChange={(_, checked) => setShowBackground(checked)}
                size="small"
                inputProps={{ 'aria-label': "Afficher l'image de fond" }}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    bgcolor: 'rgba(16,185,129,0.5)',
                  },
                }}
              />
            </Stack>
          </Paper>

        </Box>

        {/* Pied de page */}
        <Box
          sx={{
            mt: 'auto',
            p: 2.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" color="text.disabled">
            Vos préférences sont sauvegardées automatiquement
          </Typography>
        </Box>
      </Drawer>
    </>
  );
}
