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
import { FC } from 'react';
import backgroundImage from '../../../public/assets/img/img.jpg'
import { useFetchEntreprise, useFetchUser, useStockSemaine } from '../../usePerso/fonction.user';
import { connect } from '../../_services/account.service';
import { useStoreUuid } from '../../usePerso/store';
import { format } from 'date-fns';
import { BASE } from '../../_services/caller.service';
import SimpleCharts from '../../_components/Chart/Chart_1';
import { Alert, Box, CircularProgress, Stack, Paper, Container, Button } from '@mui/material';
import MonthlyBarChart from './MonthlyBarChart';

// import SimpleCharts from '../../_components/Chart/Chart_1';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

// Types
interface NavigationCardType {
  icon: JSX.Element;
  title: string;
  description: string;
  to: string;
  className: string;
}

// type NavigationCardOrNull = NavigationCardType | null;

const NavigationCard: FC<NavigationCardType> = ({ icon, title, description, className, to }) => (
  <Link to={to} className="block h-full">
    <Paper
      elevation={0}
      className={`h-full transition-all duration-200 hover:shadow-lg rounded border-x-2 animate-border-rotate ${className}`}
    >
      <Box className="p-6 text-center h-full flex flex-col justify-between">
        <div className="mb-4">
          <Box className="text-4xl mb-4 text-blue-600">
            {icon}
          </Box>
          <Typography variant="h6" className="mb-2 font-medium text-gray-900">
            {title}
          </Typography>
        </div>
        <Typography variant="body2" className="text-gray-600">
          {description}
        </Typography>
      </Box>
    </Paper>
  </Link>
);

export default function DashboardDefault() {
  const { unUser } = useFetchUser(connect);
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(uuid!);
  const { stockSemaine, isLoading, isError } = useStockSemaine(unEntreprise.uuid!);
  
  const url = unEntreprise.image ? BASE(unEntreprise.image) : backgroundImage;

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

  const navigationCards = [
    unUser.role === 1 ? {
      icon: <AddBusinessIcon fontSize="inherit" />,
      title: "Entreprise",
      description: "Les informations de votre entreprise",
      className: "bg-blue-50",
      to: "/entreprise/detail"
    } : null,
    (unUser.role === 1 || unUser.role === 2) ? {
      icon: <CategoryIcon fontSize="inherit" />,
      title: "Article || Catégorie",
      description: "Les différents articles de l'entreprise",
      className: "bg-white",
      to: "/categorie"
    } : null,
    (unUser.role === 1 || unUser.role === 2) && {
      icon: <AddCircleIcon fontSize="inherit" />,
      title: "Entrer || Achat",
      description: "Entrée des produits de l'entreprise",
      className: "bg-green-50",
      to: "/entre"
    },
    (unUser.role === 1 || unUser.role === 2 || unUser.role === 3) && {
      icon: <ExitToAppIcon fontSize="inherit" />,
      title: "Sortie || Vente",
      description: "Pour la sortie des produits dans l'entreprise",
      className: "bg-red-50",
      to: "/sortie"
    },
    (unUser.role === 1 || unUser.role === 2 || unUser.role === 3) && {
      icon: <PeopleOutlineRoundedIcon fontSize="inherit" />,
      title: "Clients || Fournisseurs",
      description: "Pour ajouter des clients ou fournisseurs",
      className: "bg-lime-50",
      to: "/entreprise/client"
    },
    unUser.role === 1 && {
      icon: <PersonAddAltIcon fontSize="inherit" />,
      title: "Personnels",
      description: "Pour ajouter des personnes qui ont accès à la plateforme",
      className: "bg-cyan-50",
      to: "/entreprise/personnel"
    },
    {
      icon: <ReceiptIcon fontSize="inherit" />,
      title: "Facture Proforma",
      description: "Cette facture ne sera pas enregistrée",
      className: "bg-neutral-50",
      to: "/entreprise/PreFacture"
    },
    (unUser.role === 1 || unUser.role === 2 || unUser.role === 3) && {
      icon: <FileCopyIcon fontSize="inherit" />,
      title: "Factures sorties (ventes)",
      description: "Factures des produits de l'entreprise",
      className: "bg-amber-50",
      to: "/entreprise/produit/sortie"
    },
    (unUser.role === 1 || unUser.role === 2) && {
      icon: <FileOpenIcon fontSize="inherit" />,
      title: "Factures entrées (achat)",
      description: "Factures des produits de l'entreprise",
      className: "bg-slate-50",
      to: "/entreprise/produit/entre"
    },
    (unUser.role === 1 || unUser.role === 2 || unUser.role === 3) && {
      icon: <MonetizationOnIcon fontSize="inherit" />,
      title: "Dépense(s)",
      description: "Ajout des dépenses de l'entreprise",
      className: "bg-orange-50",
      to: "/entreprise/depense"
    }
  ].filter((card): card is NavigationCardType => Boolean(card));

  return (
    <Box
      className="min-h-screen py-8"
      sx={{
        background: `linear-gradient(rgba(128, 128, 128, 0.7), rgba(128, 128, 128, 0.7)), url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={6}>
          {/* Header */}
          <Box>
            <Typography variant="h4" className="font-semibold text-gray-900 mb-2">
              Tableau de bord
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Bienvenue dans votre espace de gestion
            </Typography>
          </Box>

          {/* Sales Statistics */}
          <Paper elevation={0} className="border rounded-lg overflow-hidden">
            <Box className="p-6 border-b bg-gray-50">
              <Typography variant="h5" className="font-medium text-gray-900">
                Statistiques des ventes
              </Typography>
            </Box>
            <Box className="p-6">
              <SimpleCharts />
            </Box>
          </Paper>

          {/* Monthly Sales */}
          {stockSemaine.sorties_par_mois && stockSemaine.sorties_par_mois.length > 0 ? (
            <Paper elevation={0} className="border rounded-lg overflow-hidden">
              <Box className="p-6 border-b bg-gray-50">
                <Typography variant="h5" className="font-medium text-gray-900">
                  Produits les plus vendus - {format(new Date(stockSemaine.sorties_par_mois[stockSemaine.sorties_par_mois.length - 1].month), 'MMMM yyyy')}
                </Typography>
              </Box>
              <Box className="p-6">
                <MonthlyBarChart details={stockSemaine.sorties_par_mois[stockSemaine.sorties_par_mois.length - 1].details} />
              </Box>
            </Paper>
          ) : (
            <Alert severity="info" className="border">
              Aucune vente n'a été enregistrée ce mois-ci
            </Alert>
          )}

          {/* Navigation Section */}
          <Box>
            <Typography variant="h5" className="font-medium text-gray-900 mb-4">
              Navigation rapide
            </Typography>
            <Paper elevation={0} className="border p-6 mb-4">
              <Typography variant="body1" className="text-gray-600">
                Pour les factures et dépenses (en version numérique si nécessaire en PDF)
              </Typography>
            </Paper>
            <Grid container spacing={3}>
              {navigationCards.map((card, index) => (
                <Grid item xs={6} sm={6} md={4} key={index}>
                  <NavigationCard {...card} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Archives Section */}
          {/* <Box>
            <Typography variant="h5" className="font-medium text-gray-900 mb-4">
              Archives
            </Typography>
            <Paper elevation={0} className="border p-6">
              <Typography variant="body1" className="text-gray-600">
                Pour les factures et dépenses (en version numérique si nécessaire en PDF)
              </Typography>
            </Paper>
          </Box> */}
        </Stack>
      </Container>
    </Box>
  );
}
