import { Box, Tab, Tabs } from '@mui/material'
import React from 'react'
import { useFetchEntreprise } from '../../../usePerso/fonction.user';
import Nav from '../../../_components/Button/Nav';
import { a11yProps } from '../../../usePerso/fonctionPerso';
import { CustomTabPanel } from '../../../usePerso/useEntreprise';
import EtatProduit from './InfoEntreprise/EtatProduit/EtatProduit';
import InfoUsers from './InfoEntreprise/InfoUsers/InfoUsers';
import ModifEntreprise from './InfoEntreprise/ModifEntreprise/ModifEntreprise';
import { useStoreUuid } from '../../../usePerso/store';
import backgroundImage from '../../../../public/icon-192x192.png'
import { BASE } from '../../../_services/caller.service';

export default function EntrepriseDetail() {
  const uuid = useStoreUuid((state) => state.selectedId)

  const {unEntreprise, isLoading, isError} = useFetchEntreprise(uuid!)
  const url = unEntreprise.image ? BASE(unEntreprise.image) : backgroundImage;
  const [value, setValue] = React.useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error ...</div>
  }

  if (unEntreprise) {
    
    return <>
      <Nav />

      <Box sx={{ width: '100%' }}
      style={{
        background: `linear-gradient(rgba(128, 128, 128, 0.7), rgba(128, 128, 128, 0.7)), url(${url}) center center`, 
        backgroundSize: 'cover', // Peut être 'cover' ou 'contain' selon votre besoin
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
          value={value} 
          onChange={handleChange} 
          variant="scrollable" // Permet le défilement
          scrollButtons="auto" // Affiche les boutons si nécessaire
          allowScrollButtonsMobile // Active les boutons sur mobile
          aria-label="basic tabs example"
          >

            <Tab label="Info entreprise" {...a11yProps(0)} />
                    
            <Tab label="Les utilisateurs" {...a11yProps(1)} />
          
            <Tab label="Modification de l'entreprise" {...a11yProps(2)} />
          
          </Tabs>
        </Box>

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
      
    </>
  }
  
}
