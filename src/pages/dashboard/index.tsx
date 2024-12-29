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
import { useFetchEntreprise, useFetchUser, useStockEntreprise } from '../../usePerso/fonction.user';
import { connect } from '../../_services/account.service';
import AnalyticEcommerce from '../../components/cards/statistics/AnalyticEcommerce';
import { useStoreUuid } from '../../usePerso/store';
import { format } from 'date-fns';
import { BASE } from '../../_services/caller.service';

// ==============================|| DASHBOARD - DEFAULT ||============================== //
interface IconsGridProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const IconsGrid: FC<IconsGridProps> = ({ icon, title, description }) => (
  <div className="icon-box bg-white p-4 shadow-md rounded-lg text-center">
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
  const {stockEntreprise} = useStockEntreprise(unEntreprise.uuid!, connect)
  
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
      {/* row 1 */}
      <Grid item xs={12} sx={{ mb: -2.25 }} className='bg-blue-50'>
        <Typography 
          // variant="h5" 
          className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-900'
        >
          Le nombre de vente ou sortie par les 3 derniers mois
        </Typography>
      </Grid>

      {(!stockEntreprise.count_sortie_par_mois || stockEntreprise.count_sortie_par_mois.length === 0) ? (
        <Grid item xs={12} sx={{ mb: -2.25 }}>
          <Typography variant="h5">Il n'y a pas eu de vente !</Typography>
        </Grid>
      ) : (
        stockEntreprise.count_sortie_par_mois.slice(0, 3).map((post, index) => {
          const validDate = post.month ? new Date(post.month) : new Date(); // Vérifie si `post.week` est valide
          return (
            <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
              {/* <Link to="/sortie"> */}
                <AnalyticEcommerce
                  title=" "
                  count={post.count || 0} // Définit 0 par défaut si `post.count` est absent
                  pied="Le nombre de vente ou sortie effectué par le mois du"
                  extra={format(validDate, 'MMMM yyyy')} // Format de la date
                  className="bg-blue-100"
                />
              {/* </Link> */}
            </Grid>
          );
        })
      )}

      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography 
        variant="h5" 
        className='text-black'
        >
          Page d'accueil
        </Typography>
        {/* <button type="button" className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-pink-500 hover:to-orange-500 ...">
        Page d'accueil
        </button> */}
      </Grid>

      {unUser.role === 1 &&       
      <Grid item xs={12} md={4}>
        <Link to="/entreprise/detail" className="m-1 block">
          <IconsGrid 
            icon={<AddBusinessIcon color="primary" />} 
            title="Entreprise" 
            description="Entreprise" 
          />
        </Link>
      </Grid>
      }

      {(unUser.role === 1 || unUser.role === 2) &&       
        <Grid item xs={12} md={4}>
          <Link to="/categorie" className="m-1 block">
            <IconsGrid 
              icon={<CategoryIcon className="text-blue-500" />} 
              title="Catégorie" 
              description="Description de la catégorie des produits" 
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
              description="Entre des produits de la boutique" 
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
              description="Pour la sortie des prduits dans la boutique" 
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
              title="Factures des produits sorties" 
              description="Factures des produits de la boutique" 
            />
          </Link>
        </Grid>
      }

      {(unUser.role === 1 || unUser.role === 2) &&       
      <Grid item xs={12} md={4}>
        <Link to="/entreprise/produit/entre" className="m-1 block">
          <IconsGrid 
            icon={<FileOpenIcon color="primary"/>} 
            title="Factures des produits entrer" 
            description="Factures des produits de la boutique" 
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
              description="Ajout des depenses de la boutique" 
            />
          </Link>
        </Grid>
      }
      
      <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />
    </Grid>
  );
}
