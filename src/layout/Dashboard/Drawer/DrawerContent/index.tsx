// project import

// import Navigation from './Navigation';
import { Box, CardContent, IconButton, Typography } from '@mui/material';
import SimpleBar from '../../../../components/third-party/SimpleBar';
import NavSide from './Navigation/NavSide';
import { Link } from 'react-router-dom';
import { useStoreUuid } from '../../../../usePerso/store';
import { useFetchEntreprise } from '../../../../usePerso/fonction.user';
import { BASE } from '../../../../_services/caller.service';
import { PowerIcon } from '@heroicons/react/20/solid';

// ==============================|| DRAWER CONTENT ||============================== //

export default function DrawerContent() {
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(uuid);

    const logoUrl = unEntreprise.image ? BASE(unEntreprise.image) : "/icon-192x192.png";
    console.log("Logo URL:", BASE(unEntreprise.image));
  
  return (
    <>
      <SimpleBar sx={{ 
        '& .simplebar-content': { display: 'flex', flexDirection: 'column' },
        background: `linear-gradient(rgba(128, 128, 128, 0.7), rgba(128, 128, 128, 0.7)), url(${logoUrl}) center/cover no-repeat`,

        }}>
        {/* <Navigation /> */}
        <CardContent 
        sx={{ mb: 2, display: 'flex', alignItems: 'center' }}
        className="text-white m-3 border border-indigo-600 bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 flex items-center gap-2 p-2 rounded border-dashed animate-border-rotate cursor-pointer">
                  
          <Link to="/">
            <img
              src={logoUrl}
              alt={unEntreprise.nom ? unEntreprise.nom : "Gest_Stocks"}
              className="h-8 w-8 object-contain rounded-full"
            />
          </Link>

          <Typography variant="h5">
            {unEntreprise.nom ? unEntreprise.nom : "Gest Stocks"}
          </Typography>

        </CardContent>
        {/* header / top (logo, actions, etc.) */}
      {/* <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <img src={logoUrl} alt="Logo" style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 8 }} />
        <Typography variant="h6" sx={{ flex: 1, color: 'white' }}>
          {unEntreprise.nom}
        </Typography>
        <IconButton color="inherit" size="small">
          <PowerIcon />
        </IconButton>
      </Box> */}
        <NavSide />
        {/* <NavCard /> */}
      </SimpleBar>
    </>
  );
}
