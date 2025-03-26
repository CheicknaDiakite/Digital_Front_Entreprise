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

      <Grid item xs={12} sx={{ mb: -2.25 }} >
        <Typography 
        variant="h5" 
        // className='text-black border bg-zinc-100/20 flex items-center gap-2 p-2 rounded'
        // maxWidth={"sm"}
        >
          Page d'accueil
        </Typography>
        
      </Grid>

      
      {/* <Grid item xs={12} sx={{ mb: -2.25 }}>
        <SimpleCharts />
      </Grid> */}
      <Grid item xs={12} md={7} lg={10}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid className='text-black border border-indigo-600 bg-zinc-100/50 flex items-center gap-2 p-2 rounded' item>
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
                  Eta de vente
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
          <Grid className='text-black border border-indigo-600 bg-zinc-100/50 flex items-center gap-2 p-2 rounded' item>
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
          stockSemaine.sorties_par_mois.slice(-1).map((post, index) => {
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
        <Grid item xs={6} md={4}>
          <Link to="/entreprise/detail" className=" block">
            <IconsGrid 
              icon={<AddBusinessIcon color="primary" fontSize='inherit' />} 
              title="Entreprise" 
              description="Les informations de l'entreprise"
              className="bg-blue-100"
            />
          </Link>
        </Grid>
      </>      
      }

      {(unUser.role === 1 || unUser.role === 2) &&       
        <Grid item xs={6} md={4}>
          <Link to="/categorie" className=" block">
            <IconsGrid 
              icon={<CategoryIcon color="primary" fontSize='inherit' />} 
              title="Article || Catégorie" 
              description="Les differents articles de l'entreprise" 
              className='bg-white'
            />
          </Link>
        </Grid>
      }

      {(unUser.role === 1 || unUser.role === 2) &&       
        <Grid item xs={6} md={4}>
          <Link to="/entre" className=" block">
            <IconsGrid 
              icon={<AddCircleIcon color="primary" fontSize='inherit' />} 
              title="Entrer || Achat" 
              description="Entre des produits de l'entreprise"
              className="bg-green-100" 
            />
          </Link>
        </Grid>
      }

      {(unUser.role === 1 || unUser.role === 2 || unUser.role === 3) &&
        <Grid item xs={6} md={4}>
          <Link to="/sortie" className=" block">
            <IconsGrid 
              icon={<ExitToAppIcon color="primary" fontSize='inherit' />} 
              title="Sortie || Vente" 
              description="Pour la sortie des prduits dans l'entreprise" 
              className="bg-red-100"
            />
          </Link>
        </Grid>
      }

      {(unUser.role === 1 || unUser.role === 2 || unUser.role === 3) &&       
        <Grid item xs={6} md={4}>
          <Link to="/entreprise/client" className=" block">
            <IconsGrid 
              icon={<PeopleOutlineRoundedIcon color="primary" fontSize='inherit' />} 
              title="Clients || Fournisseurs" 
              description="Pour ajouter des clients ou fournisseurs" 
              className="bg-lime-100"
            />
          </Link>
        </Grid>
      }
      {(unUser.role === 1 ) &&       
        <Grid item xs={6} md={4}>
          <Link to="/entreprise/personnel" className=" block">
            <IconsGrid 
              icon={<PersonAddAltIcon color="primary" fontSize='inherit' />} 
              title="Personnels" 
              description="Pour ajouter des personnes qui ont acces au plate-forme" 
              className="bg-cyan-100"
            />
          </Link>
        </Grid>
      }

      <Grid item xs={6} md={4}>
        <Link to="/entreprise/PreFacture" className=" block">
          <IconsGrid 
            icon={<ReceiptIcon color="primary" fontSize='inherit' />} 
            title="Facture Proforma" 
            description="Ce facture ne sera pas enregistrer"
            className="bg-neutral-100" 
          />
        </Link>
      </Grid> 

      {/* <Grid  item xs={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5" >Archiges = Pour les factures et depenses (en version numerique si necessaire en PDF)</Typography>
      </Grid> */}

        <Grid container alignItems="center" justifyContent="space-between" xs={12} sx={{ mb: -2.25 }}>
          <Grid className='text-black border border-indigo-600 bg-zinc-100/50 flex items-center gap-2 p-2 mx-5 mt-5 rounded' item>
            <Typography 
            variant="h5"
            >
              Archiges = Pour les factures et depenses (en version numerique si necessaire en PDF)
            </Typography>
          </Grid>
          <Grid item />
        </Grid>
      
      {(unUser.role === 1 || unUser.role === 2 || unUser.role === 3) &&       
        <Grid item xs={6} md={4}>
          <Link to="/entreprise/produit/sortie" className=" block">
            <IconsGrid 
              icon={<FileCopyIcon color="primary" fontSize='inherit' />} 
              title="Factures sorties(ventes)" 
              description="Factures des produits de l'entreprise" 
              className="bg-amber-100"
            />
          </Link>
        </Grid>
      }

      {(unUser.role === 1 || unUser.role === 2) &&       
      <Grid item xs={6} md={4}>
        <Link to="/entreprise/produit/entre" className=" block">
          <IconsGrid 
            icon={<FileOpenIcon color="primary" fontSize='inherit'/>} 
            title="Factures entrer(achat)" 
            description="Factures des produits de l'entreprise" 
            className="bg-slate-100"
          />
        </Link>
      </Grid>
      }

      {(unUser.role === 1 || unUser.role === 2 || unUser.role === 3) &&       
        <Grid item xs={6} md={4}>
          <Link to="/entreprise/depense" className=" block">
            <IconsGrid 
              icon={<MonetizationOnIcon color="primary" fontSize='inherit' />} 
              title="Depense(s)" 
              description="Ajout des depenses de l'entreprise" 
              className="bg-orange-100"
            />
          </Link>
        </Grid>
      }
      
      <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />
    </Grid>
  );
}
