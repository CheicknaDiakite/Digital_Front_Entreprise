import React, { useState } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Button,
  Alert,
  Container,
  Typography,
  Chip,
  Avatar,
  Skeleton,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  IconButton,
  Tooltip
} from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { useNavigate } from 'react-router-dom';

import { useFetchEntreprise } from '../../../usePerso/fonction.user';
import { a11yProps, getLicenceDuration } from '../../../usePerso/fonctionPerso';
import { CustomTabPanel } from '../../../usePerso/useEntreprise';
import { useStoreUuid } from '../../../usePerso/store';
import { BASE } from '../../../_services/caller.service';
import { LicenceTag } from './Entreprise';
import EtatProduit from './InfoEntreprise/EtatProduit/EtatProduit';
import InfoUsers from './InfoEntreprise/InfoUsers/InfoUsers';
import ModifEntreprise from './InfoEntreprise/ModifEntreprise/ModifEntreprise';

export default function EntrepriseDetail() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise, isLoading, isError } = useFetchEntreprise(uuid);
  const [value, setValue] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '20px',
            border: `1px solid ${theme.palette.divider}`,
            mb: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Skeleton variant="rounded" width={68} height={68} sx={{ borderRadius: '16px' }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="220px" height={36} />
              <Skeleton variant="text" width="160px" height={22} />
            </Box>
          </Box>
          <Box sx={{ mt: 3, display: 'flex', gap: 1.5 }}>
            <Skeleton variant="rounded" width={140} height={42} sx={{ borderRadius: '12px' }} />
            <Skeleton variant="rounded" width={140} height={42} sx={{ borderRadius: '12px' }} />
            <Skeleton variant="rounded" width={140} height={42} sx={{ borderRadius: '12px' }} />
          </Box>
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
          <Skeleton variant="rounded" height={130} sx={{ borderRadius: '18px' }} />
          <Skeleton variant="rounded" height={130} sx={{ borderRadius: '18px' }} />
          <Skeleton variant="rounded" height={130} sx={{ borderRadius: '18px' }} />
        </Box>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert
          severity="error"
          sx={{
            borderRadius: '16px',
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => window.location.reload()}
              startIcon={<RefreshRoundedIcon />}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              Réessayer
            </Button>
          }
        >
          Impossible de charger les données de l'entreprise. Veuillez vérifier votre connexion.
        </Alert>
      </Container>
    );
  }

  if (!unEntreprise) return null;

  const logoUrl = unEntreprise.image ? BASE(unEntreprise.image as string) : '';

  return (
    <Box sx={{ minHeight: '100%', pb: 5 }}>
      <Container maxWidth="xl" sx={{ pt: { xs: 2, sm: 3 } }}>
        {/* Executive Hero Banner */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: '24px',
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, #ffffff 100%)`,
            border: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(12px)',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.3)'
              : '0 8px 24px rgba(0,0,0,0.03)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle decorative glow */}
          <Box
            sx={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.18)} 0%, transparent 70%)`,
              pointerEvents: 'none',
              filter: 'blur(20px)'
            }}
          />

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 2.5
            }}
          >
            {/* Left: Avatar & Meta */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Avatar
                src={logoUrl}
                alt={unEntreprise.nom || 'Entreprise'}
                sx={{
                  width: { xs: 58, sm: 68 },
                  height: { xs: 58, sm: 68 },
                  borderRadius: '18px',
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                  fontWeight: 800,
                  fontSize: '1.4rem'
                }}
              >
                {unEntreprise.nom ? (
                  unEntreprise.nom.charAt(0).toUpperCase()
                ) : (
                  <BusinessRoundedIcon sx={{ fontSize: 32 }} />
                )}
              </Avatar>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      color: 'text.primary'
                    }}
                  >
                    {unEntreprise.nom || 'Entreprise sans nom'}
                  </Typography>

                  {unEntreprise.ref && (
                    <Chip
                      label={`REF: ${unEntreprise.ref}`}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        borderRadius: '6px',
                        bgcolor: alpha(theme.palette.text.primary, 0.05),
                        color: 'text.secondary',
                        border: `1px solid ${theme.palette.divider}`
                      }}
                    />
                  )}
                </Box>

                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ mt: 0.5 }}>
                  {unEntreprise.libelle && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      {unEntreprise.libelle}
                    </Typography>
                  )}

                  {unEntreprise.pays && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <LocationOnOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {unEntreprise.pays}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Box>

            {/* Right: Licence Tag & Quick Actions */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                width: { xs: '100%', md: 'auto' },
                justifyContent: { xs: 'space-between', md: 'flex-end' },
                flexWrap: 'wrap'
              }}
            >
              {unEntreprise.licence_type && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LicenceTag type={unEntreprise.licence_type}>
                    {unEntreprise.licence_type} • {getLicenceDuration(unEntreprise.licence_date_expiration)}
                  </LicenceTag>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Retour au tableau de bord" arrow>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ArrowBackRoundedIcon />}
                    onClick={() => navigate('/entreprise')}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: theme.palette.divider,
                      color: 'text.secondary',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.04)
                      }
                    }}
                  >
                    Retour
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {/* Segmented / Pill Tabs Ribbon */}
          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: `1px solid ${theme.palette.divider}`
            }}
          >
            <Tabs
              value={value}
              onChange={handleChange}
              variant={isMobile ? 'fullWidth' : 'standard'}
              aria-label="enterprise navigation tabs"
              TabIndicatorProps={{
                sx: { display: 'none' } // Use pill style instead of classic line
              }}
              sx={{
                minHeight: 'auto',
                gap: 1,
                '& .MuiTabs-flexContainer': {
                  gap: 1
                },
                '& .MuiTab-root': {
                  minHeight: 42,
                  py: 1,
                  px: { xs: 1.5, sm: 2.5 },
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: `1px solid transparent`,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.text.primary, 0.04),
                    color: 'text.primary'
                  },
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderColor: alpha(theme.palette.primary.main, 0.25),
                    fontWeight: 700,
                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.12)}`
                  }
                }
              }}
            >
              <Tab
                label="Statistiques & Flux"
                icon={<AssessmentRoundedIcon sx={{ fontSize: 19 }} />}
                iconPosition="start"
                {...a11yProps(0)}
              />
              <Tab
                label="Équipe & Accès"
                icon={<PeopleAltRoundedIcon sx={{ fontSize: 19 }} />}
                iconPosition="start"
                {...a11yProps(1)}
              />
              <Tab
                label="Paramètres & Licence"
                icon={<TuneRoundedIcon sx={{ fontSize: 19 }} />}
                iconPosition="start"
                {...a11yProps(2)}
              />
            </Tabs>
          </Box>
        </Paper>

        {/* Tab Views with Smooth Fade */}
        <Box>
          <CustomTabPanel value={value} index={0}>
            <Fade in={value === 0} timeout={300}>
              <Box>
                <EtatProduit />
              </Box>
            </Fade>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={1}>
            <Fade in={value === 1} timeout={300}>
              <Box>
                <InfoUsers />
              </Box>
            </Fade>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={2}>
            <Fade in={value === 2} timeout={300}>
              <Box>
                <ModifEntreprise />
              </Box>
            </Fade>
          </CustomTabPanel>
        </Box>
      </Container>
    </Box>
  );
}

