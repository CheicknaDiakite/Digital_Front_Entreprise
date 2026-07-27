import { 
  Box, 
  CircularProgress, 
  Tab, 
  Tabs,
  Paper,
  Button,
  Alert,
  Container,
  Typography,
  Chip
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import React, { useState, useEffect } from 'react';
import { useFetchEntreprise } from '../../../usePerso/fonction.user';
import { a11yProps } from '../../../usePerso/fonctionPerso';
import { CustomTabPanel } from '../../../usePerso/useEntreprise';
import EtatProduit from './InfoEntreprise/EtatProduit/EtatProduit';
import InfoUsers from './InfoEntreprise/InfoUsers/InfoUsers';
import ModifEntreprise from './InfoEntreprise/ModifEntreprise/ModifEntreprise';
import { useStoreUuid } from '../../../usePerso/store';
import './mobile-admin.css';

export default function EntrepriseDetail() {
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise, isLoading, isError } = useFetchEntreprise(uuid);
  const [value, setValue] = React.useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: 2 }}>
        <CircularProgress size={48} thickness={4} sx={{ color: '#3b82f6' }} />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Chargement de l'entreprise...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert 
          severity="error"
          sx={{ borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          }
        >
          Problème de connexion ! Veuillez réessayer.
        </Alert>
      </Container>
    );
  }

  if (unEntreprise) {
    return (
      <Box sx={{ minHeight: '100%' }}>
        <Paper 
          elevation={0} 
          sx={{ 
            background: 'transparent',
            bgcolor: 'transparent',
          }}
        >
          {/* Tabs Header */}
          <Box sx={{ 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            // bgcolor: 'rgba(248, 250, 252, 0.8)',
            backdropFilter: 'blur(8px)',
            px: { xs: 1, sm: 2 }
          }}>
            {/* Entreprise badge */}
            {unEntreprise.nom && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 2, pb: 0.5 }}>
                <BusinessIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {unEntreprise.nom}
                </Typography>
                {unEntreprise.licence_type && (
                  <Chip 
                    label={unEntreprise.licence_type} 
                    size="small"
                    sx={{ 
                      height: 20, 
                      fontSize: '0.65rem', 
                      fontWeight: 700,
                      bgcolor: 'rgba(59, 130, 246, 0.1)',
                      color: '#2563eb',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}
                  />
                )}
              </Box>
            )}

            <Tabs 
              value={value} 
              onChange={handleChange} 
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              aria-label="enterprise tabs"
              sx={{
                minHeight: 48,
                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#64748b',
                  gap: 0.75,
                  px: { xs: 1.5, sm: 3 },
                  '&.Mui-selected': {
                    color: '#2563eb',
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 2.5,
                  borderRadius: '2px 2px 0 0',
                  backgroundColor: '#2563eb'
                }
              }}
            >
              <Tab 
                label="Statistiques" 
                icon={<InfoOutlinedIcon sx={{ fontSize: 18 }} />} 
                iconPosition="start"
                {...a11yProps(0)} 
              />
              <Tab 
                label="Utilisateurs" 
                icon={<GroupOutlinedIcon sx={{ fontSize: 18 }} />} 
                iconPosition="start"
                {...a11yProps(1)} 
              />
              <Tab 
                label="Paramètres" 
                icon={<SettingsOutlinedIcon sx={{ fontSize: 18 }} />} 
                iconPosition="start"
                {...a11yProps(2)} 
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box>
            <CustomTabPanel value={value} index={0}>
              <EtatProduit />
            </CustomTabPanel>
            
            <CustomTabPanel value={value} index={1}>
              <InfoUsers />
            </CustomTabPanel>
            
            <CustomTabPanel value={value} index={2}>
              <ModifEntreprise />
            </CustomTabPanel>
          </Box>
        </Paper>
      </Box>
    );
  }
}
