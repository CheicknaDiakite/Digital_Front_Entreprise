// material-ui
import Grid from '@mui/material/Grid';

import Typography from '@mui/material/Typography';
import CategoryIcon from '@mui/icons-material/Category';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import { Link } from 'react-router-dom';
import { FC, ReactNode } from 'react';
import backgroundImage from '../../../public/assets/img/img.jpg'
import { useFetchEntreprise, useFetchUser, useStockSemaine } from '../../usePerso/fonction.user';
import { connect } from '../../_services/account.service';
import { useStoreUuid } from '../../usePerso/store';
import { format } from 'date-fns';
import { BASE } from '../../_services/caller.service';
import SimpleCharts from '../../_components/Chart/Chart_1';
import MainCard from '../../components/MainCard';
import { Alert, Box, CircularProgress, Stack } from '@mui/material';
import MonthlyBarChart from './MonthlyBarChart';
// import SimpleCharts from '../../_components/Chart/Chart_1';

// ==============================|| DASHBOARD - DEFAULT ||============================== //
interface IconsGridProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string; // Ajouter cette ligne
}

const IconsGrid: FC<IconsGridProps> = ({ icon, title, description, className }) => (
  <div className={`icon-box p-4 shadow-md rounded-lg text-center ${className}`}>
    <div className="icon text-4xl mb-4">{icon}</div>
    <h4 className="text-xl font-semibold mb-2">
      <a href="#" className="text-blue-500 hover:underline">
        {title}
      </a>
    </h4>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default function DashboardDefault() {
  const {unUser} = useFetchUser(connect)
  const uuid = useStoreUuid((state) => state.selectedId)
  const {unEntreprise} = useFetchEntreprise(uuid!)
  const url = unEntreprise.image ? BASE(unEntreprise.image) : backgroundImage;
  const {stockSemaine, isLoading, isError} = useStockSemaine(unEntreprise.uuid!)
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Stack sx={{ width: '100%' }} spacing={2}>        
        <Alert severity="error">Probleme de connexion !</Alert>
      </Stack>
    );
  }

  return (
    <Grid container 
    rowSpacing={4.5} 
    columnSpacing={2.75}
    style={{
      background: `linear-gradient(rgba(128, 128, 128, 0.7), rgba(128, 128, 128, 0.7)), url(${url}) center center`, 
      backgroundSize: 'cover', // Peut être 'cover' ou 'contain' selon votre besoin
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
    >

      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography 
        variant="h5" 
        className='text-black'
        >
          Page d'accueil
        </Typography>
        
      </Grid>

      
      {/* <Grid item xs={12} sx={{ mb: -2.25 }}>
        <SimpleCharts />
      </Grid> */}
      <Grid item xs={12} md={7} lg={10}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography 
            variant="h5"
            >
              Le nombre de vente ou sortie effectuer
            </Typography>
          </Grid>
          <Grid item />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Stack spacing={2}>
              <Typography variant="h6" color="text.secondary">
                  Eta de vente des 6 derniers mois
              </Typography>
              {/* <Typography variant="h3">$7,650</Typography> */}
            </Stack>
          </Box>
          {/* <MonthlyBarChart /> */}
            <SimpleCharts />
        </MainCard>
      </Grid>

      <Grid item xs={12} md={7} lg={12}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography 
            variant="h5"
            >
              Les produits les plus vendes du mois en cours
            </Typography>
          </Grid>
          <Grid item />
        </Grid>
        
        {(!stockSemaine.sorties_par_mois || stockSemaine.sorties_par_mois.length === 0) ? (
          <Grid item xs={12} sx={{ mb: -2.25 }}>
          <Typography variant="h5">Il n'y a pas eu de vente !</Typography>
          </Grid>
          ) : (
          stockSemaine.sorties_par_mois.slice(1, 2).map((post, index) => {
          // const validDate = post.week ? new Date(post.month) : new Date(); // Vérifie si `post.week` est valide
          const validD = new Date(post.month) // Vérifie si `post.week` est valide
          
          return (
            <MainCard key={index} sx={{ mt: 2 }} content={false}>
              <Box sx={{ p: 3, pb: 0 }}>
                <Stack spacing={2}>
                  <Typography variant="h6" color="text.secondary">
                    {format(validD, 'MMMM yyyy')}
                  </Typography>
                  {/* <Typography variant="h3">$7,650</Typography> */}
                </Stack>
              </Box>
              <MonthlyBarChart details={post.details} />
                {/* <Chart_2 details={post.details} /> */}
            </MainCard>
          );
          })
        )}
        
      </Grid>

      {unUser.role === 1 && <>
        <Grid item xs={12} md={4}>
          <Link to="/entreprise/detail" className="m-1 block">
            <IconsGrid 
              icon={<AddBusinessIcon color="primary" />} 
              title="Entreprise" 
              description="Entreprise"
              className="bg-blue-200"
            />
          </Link>
        </Grid>
      </>      
      }

      {(unUser.role === 1 || unUser.role === 2) &&       
        <Grid item xs={12} md={4}>
          <Link to="/categorie" className="m-1 block">
            <IconsGrid 
              icon={<CategoryIcon className="text-blue-500" />} 
              title="Catégorie" 
              description="Description de la catégorie des produits" 
              className='bg-white'
            />
          </Link>
        </Grid>
      }

      {(unUser.role === 1 || unUser.role === 2) &&       
        <Grid item xs={12} md={4}>
          <Link to="/entre" className="m-1 block">
            <IconsGrid 
              icon={<AddCircleIcon className="text-blue-500" />} 
              title="Entrer/Achat" 
              description="Entre des produits de l'entreprise"
              className="bg-green-200" 
            />
          </Link>
        </Grid>
      }

      {(unUser.role === 1 || unUser.role === 2 || unUser.role === 3) &&
        <Grid item xs={12} md={4}>
          <Link to="/sortie" className="m-1 block">
            <IconsGrid 
              icon={<ExitToAppIcon className="text-blue-500" />} 
              title="Sortie/Vente" 
              description="Pour la sortie des prduits dans l'entreprise" 
              className="bg-red-200"
            />
          </Link>
        </Grid>
      }

      {(unUser.role === 1 || unUser.role === 2 || unUser.role === 3) &&       
        <Grid item xs={12} md={4}>
          <Link to="/entreprise/client" className="m-1 block">
            <IconsGrid 
              icon={<PeopleOutlineRoundedIcon className="text-blue-500" />} 
              title="Clients/Fournisseurs" 
              description="Pour ajouter des clients ou fournisseurs" 
              className="bg-lime-200"
            />
          </Link>
        </Grid>
      }
      {(unUser.role === 1 ) &&       
        <Grid item xs={12} md={4}>
          <Link to="/entreprise/personnel" className="m-1 block">
            <IconsGrid 
              icon={<PersonAddAltIcon className="text-blue-500" />} 
              title="Personnels" 
              description="Pour ajouter des personnes qui ont acces au plate-forme" 
              className="bg-cyan-200"
            />
          </Link>
        </Grid>
      }

      <Grid item xs={12} md={4}>
        <Link to="/entreprise/PreFacture" className="m-1 block">
          <IconsGrid 
            icon={<ReceiptIcon className="text-blue-500" />} 
            title="Facture Proforma" 
            description="Ce facture ne sera pas enregistrer"
            className="bg-neutral-200" 
          />
        </Link>
      </Grid> 

      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5" >Archiges = Pour les factures et depenses (en version numerique si necessaire en PDF)</Typography>
      </Grid>
      
      {(unUser.role === 1 || unUser.role === 2 || unUser.role === 3) &&       
        <Grid item xs={12} md={4}>
          <Link to="/entreprise/produit/sortie" className="m-1 block">
            <IconsGrid 
              icon={<FileCopyIcon color="primary" />} 
              title="Factures sorties(ventes)" 
              description="Factures des produits de l'entreprise" 
              className="bg-amber-200"
            />
          </Link>
        </Grid>
      }

      {(unUser.role === 1 || unUser.role === 2) &&       
      <Grid item xs={12} md={4}>
        <Link to="/entreprise/produit/entre" className="m-1 block">
          <IconsGrid 
            icon={<FileOpenIcon color="primary"/>} 
            title="Factures entrer(achat)" 
            description="Factures des produits de l'entreprise" 
            className="bg-slate-200"
          />
        </Link>
      </Grid>
      }

      {(unUser.role === 1 || unUser.role === 2 || unUser.role === 3) &&       
        <Grid item xs={12} md={4}>
          <Link to="/entreprise/depense" className="m-1 block">
            <IconsGrid 
              icon={<MonetizationOnIcon color="primary" />} 
              title="Depense(s)" 
              description="Ajout des depenses de l'entreprise" 
              className="bg-orange-200"
            />
          </Link>
        </Grid>
      }
      
      <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />
    </Grid>
  );
}
