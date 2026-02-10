import { Box, Container, Paper, Tab, Tabs } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { CustomTabPanel } from '../../usePerso/useEntreprise';
import RemiseFacture from './RemiseFacture';
import { a11yProps } from '../../usePerso/fonctionPerso';
import FactureListe from './FactureListe';

export default function FactureDetail() {
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

  return (

    <Box>
      <Container maxWidth="xl" className="relative z-10">
        <Paper
          elevation={0}
          // className={`border rounded-lg overflow-hidden ${isMobile ? 'mobile-modif-paper' : ''}`}
          sx={{
            background: 'transparent',
            bgcolor: 'transparent',
            backdropFilter: 'none',

          }}
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
                label="Tous les Remises"
                // icon={<InfoIcon />} 
                iconPosition="start"
                {...a11yProps(0)}
                className={`min-h-[48px] ${isMobile ? 'mobile-admin-tab' : ''}`}
              />
              <Tab
                label="Remises par facture"
                // icon={<GroupIcon />} 
                iconPosition="start"
                {...a11yProps(1)}
                className={`min-h-[48px] ${isMobile ? 'mobile-admin-tab' : ''}`}
              />

            </Tabs>
          </Box>

          <Box
          >
            <CustomTabPanel value={value} index={0}>
              <RemiseFacture />
            </CustomTabPanel>

            <CustomTabPanel value={value} index={1}>
              <FactureListe />
            </CustomTabPanel>

          </Box>
        </Paper>
      </Container>
    </Box>

  );
}
