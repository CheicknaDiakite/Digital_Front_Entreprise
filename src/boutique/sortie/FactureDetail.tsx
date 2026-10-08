import { Box, Paper, Tab, Tabs, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useState } from 'react';
import { CustomTabPanel } from '../../usePerso/useEntreprise';
import RemiseFacture from './RemiseFacture';
import { a11yProps } from '../../usePerso/fonctionPerso';
import FactureListe from './FactureListe';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

export default function FactureDetail() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [value, setValue] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', py: { xs: 1, sm: 2 } }}>
      {/* Navigation Onglets Moderne */}
      <Paper
        elevation={0}
        sx={{
          p: 0.75,
          mb: 3,
          borderRadius: '16px',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          width: 'fit-content',
          maxWidth: '100%',
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          variant={isMobile ? 'fullWidth' : 'standard'}
          aria-label="Facturation et remises navigation"
          sx={{
            minHeight: 44,
            '& .MuiTabs-indicator': {
              display: 'none', // Style type "Pill" moderne
            },
            '& .MuiTabs-flexContainer': {
              gap: 1,
            },
          }}
        >
          <Tab
            label="Remises accordées"
            icon={<LocalOfferIcon sx={{ fontSize: '1.15rem' }} />}
            iconPosition="start"
            {...a11yProps(0)}
            sx={{
              minHeight: 42,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              px: { xs: 2, sm: 3 },
              color: 'text.secondary',
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: '#ffffff',
                bgcolor: 'primary.main',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
              },
            }}
          />
          <Tab
            label="Factures & Créances"
            icon={<ReceiptLongIcon sx={{ fontSize: '1.15rem' }} />}
            iconPosition="start"
            {...a11yProps(1)}
            sx={{
              minHeight: 42,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              px: { xs: 2, sm: 3 },
              color: 'text.secondary',
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: '#ffffff',
                bgcolor: 'primary.main',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
              },
            }}
          />
        </Tabs>
      </Paper>

      {/* Contenu des Onglets */}
      <Box>
        <CustomTabPanel value={value} index={0}>
          <RemiseFacture />
        </CustomTabPanel>

        <CustomTabPanel value={value} index={1}>
          <FactureListe />
        </CustomTabPanel>
      </Box>
    </Box>
  );
}
