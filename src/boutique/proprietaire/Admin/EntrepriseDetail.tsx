import { 
  Alert, 
  Box, 
  CircularProgress, 
  Tab, 
  Tabs,
  Paper,
  Button,
  Container
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
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
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="sm" className="py-8">
        <Alert 
          severity="error"
          className="shadow-lg"
          sx={{
              position: 'fixed',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1400,
              width: 'calc(100% - 32px)',
              maxWidth: 600,
            }}
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
        
      <Box>
        {/* <Container> */}
          <Paper 
          elevation={0} 
          // className={`border rounded-lg overflow-hidden ${isMobile ? 'mobile-modif-paper' : ''}`}
          sx={ {
              background: 'transparent',
              bgcolor: 'transparent',
              backdropFilter: 'none',
              
            } }
          >
            <Box className={`border-b bg-gray-100 backdrop-blur-sm ${isMobile ? 'mobile-admin-tabs' : ''}`}>
              <Tabs 
                value={value} 
                onChange={handleChange} 
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                aria-label="enterprise tabs"
                className={`min-h-[48px] ${isMobile ? 'mobile-admin-tabs' : ''}`}
              >
                <Tab 
                  label="Informations" 
                  icon={<InfoIcon />} 
                  iconPosition="start"
                  {...a11yProps(0)} 
                  className={`min-h-[48px] ${isMobile ? 'mobile-admin-tab' : ''}`}
                />
                <Tab 
                  label="Utilisateurs" 
                  icon={<GroupIcon />} 
                  iconPosition="start"
                  {...a11yProps(1)} 
                  className={`min-h-[48px] ${isMobile ? 'mobile-admin-tab' : ''}`}
                />
                <Tab 
                  label="Paramètres" 
                  icon={<SettingsIcon />} 
                  iconPosition="start"
                  {...a11yProps(2)} 
                  className={`min-h-[48px] ${isMobile ? 'mobile-admin-tab' : ''}`}
                />
              </Tabs>
            </Box>

            <Box 
              >
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
        {/* </Container> */}
      </Box>
  
    );
  }
}
