import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { ClientModif } from './ModifClient/ClientModif';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { useParams } from 'react-router-dom';
import ClientEntrer from './Entrer/ClientEntrer';
import ClientSortie from './Sortie/ClientSortie';
import { useDeleteClient, useUnClient } from '../../../usePerso/fonction.user';
import Nav from '../../../_components/Button/Nav';
import { Button } from '@mui/material';
import { connect } from '../../../_services/account.service';
import { a11yProps } from '../../../usePerso/fonctionPerso';
import { CustomTabPanel } from '../../../usePerso/useEntreprise';

export default function ClientInfo() {
  const { uuid } = useParams();
  const {unClient} = useUnClient(uuid!);
  unClient["user_id"] = connect;
  
  const {deleteClient} = useDeleteClient()

  const handleDelete = () => {
    const confirmation = window.confirm("Vous êtes sûr de vouloir supprimer ?");
    if (confirmation) {
      // Appel de la fonction de suppression
      deleteClient(unClient)
    }
  };
  
  const [value, setValue] = React.useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (<>
    <Nav>
      <Button size="small" className='rounded-full shadow-md shadow-red-800/50' onClick={handleDelete}>
        <DeleteIcon fontSize='small' />
      </Button>
    </Nav>
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
        value={value} 
        onChange={handleChange} 
        variant="scrollable" // Permet le défilement
        scrollButtons="auto" // Affiche les boutons si nécessaire
        allowScrollButtonsMobile // Active les boutons sur mobile
        aria-label="basic tabs example"
        >

          <Tab label="Client ou Fournisseur Modification" {...a11yProps(0)} />
                   
          <Tab label="Achat(Fournisseur)" {...a11yProps(1)} />
         
          <Tab label="Vente(client)" {...a11yProps(2)} />
         
        </Tabs>
      </Box>

      <CustomTabPanel value={value} index={0}>
        <ClientModif uuid={uuid!} />
      </CustomTabPanel>
      
      <CustomTabPanel value={value} index={1}>
        <ClientEntrer uuid={uuid!} />
      </CustomTabPanel>
      
      <CustomTabPanel value={value} index={2}>
        <ClientSortie uuid={uuid!} />
      </CustomTabPanel>
      
    </Box>
  </>
  );
}
