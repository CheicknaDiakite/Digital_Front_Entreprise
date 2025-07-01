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
import { useFetchEntreprise, useFetchUser, useStockSemaine } from '../../usePerso/fonction.user';
import { connect } from '../../_services/account.service';
import { useStoreUuid } from '../../usePerso/store';
import { format } from 'date-fns';
import SimpleCharts from '../../_components/Chart/Chart_1';
import { Alert, Box, CircularProgress, Stack, Paper, Container, Button, useMediaQuery, useTheme } from '@mui/material';
import MonthlyBarChart from './MonthlyBarChart';
import './mobile-dashboard.css';

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
      elevation={2}
      className={`h-full transition-all duration-300 hover:shadow-xl hover:scale-105 rounded-2xl border-0 mobile-nav-card mobile-hover-effect ${className}`}
      sx={{
        minHeight: { xs: '140px', sm: '160px' },
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
        }
      }}
    >
      <Box className="p-4 text-center h-full flex flex-col justify-center items-center">
        <Box className="text-5xl mb-3 text-blue-600 flex items-center justify-center mobile-icon">
          {icon}
        </Box>
        <Typography 
          variant="h6" 
          className="mb-2 font-bold text-gray-900 text-center"
          sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}
        >
          {title}
        </Typography>
        <Typography 
          variant="body2" 
          className="text-gray-600 text-center"
          sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
        >
          {description}
        </Typography>
      </Box>
    </Paper>
  </Link>
);

export default function DashboardDefault() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { unUser } = useFetchUser(connect);
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(uuid!);
  const { stockSemaine, isLoading, isError } = useStockSemaine(unEntreprise.uuid!);
  
  if (isLoading) {
    return (
      <Box className="flex items-center justify-center min-h-screen mobile-loading">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="sm" className="py-8">
        <Alert 
          severity="error"
          className="shadow-lg rounded-2xl mobile-alert"
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()} className="mobile-button">
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
      className: "bg-gradient-to-br from-blue-50 to-blue-100",
      to: "/entreprise/detail"
    } : null,
    (unUser.role === 1 || unUser.role === 2) ? {
      icon: <CategoryIcon fontSize="inherit" />,
      title: "Article || Catégorie",
      description: "Les différents articles de l'entreprise",
      className: "bg-gradient-to-br from-white to-gray-50",
      to: "/categorie"
    } : null,
    (unUser.role === 1 || unUser.role === 2) && {
      icon: <AddCircleIcon fontSize="inherit" />,
      title: "Entrer || Achat",
      description: "Entrée des produits de l'entreprise",
      className: "bg-gradient-to-br from-green-50 to-green-100",
      to: "/entre"
    },
    (unUser.role === 1 || unUser.role === 2 || unUser.role === 3) && {
      icon: <ExitToAppIcon fontSize="inherit" />,
      title: "Sortie || Vente",
      description: "Pour la sortie des produits dans l'entreprise",
      className: "bg-gradient-to-br from-red-50 to-red-100",
      to: "/sortie"
    },
    (unUser.role === 1 || unUser.role === 2 || unUser.role === 3) && {
      icon: <PeopleOutlineRoundedIcon fontSize="inherit" />,
      title: "Clients || Fournisseurs",
      description: "Pour ajouter des clients ou fournisseurs",
      className: "bg-gradient-to-br from-lime-50 to-lime-100",
      to: "/entreprise/client"
    },
    unUser.role === 1 && {
      icon: <PersonAddAltIcon fontSize="inherit" />,
      title: "Personnels",
      description: "Pour ajouter des personnes qui ont accès à la plateforme",
      className: "bg-gradient-to-br from-cyan-50 to-cyan-100",
      to: "/entreprise/personnel"
    },
    {
      icon: <ReceiptIcon fontSize="inherit" />,
      title: "Facture Proforma",
      description: "Cette facture ne sera pas enregistrée",
      className: "bg-gradient-to-br from-neutral-50 to-neutral-100",
      to: "/entreprise/PreFacture"
    },
    (unUser.role === 1 || unUser.role === 2 || unUser.role === 3) && {
      icon: <FileCopyIcon fontSize="inherit" />,
      title: "Factures sorties (ventes)",
      description: "Factures des produits de l'entreprise",
      className: "bg-gradient-to-br from-amber-50 to-amber-100",
      to: "/entreprise/produit/sortie"
    },
    (unUser.role === 1 || unUser.role === 2) && {
      icon: <FileOpenIcon fontSize="inherit" />,
      title: "Factures entrées (achat)",
      description: "Factures des produits de l'entreprise",
      className: "bg-gradient-to-br from-slate-50 to-slate-100",
      to: "/entreprise/produit/entre"
    },
    (unUser.role === 1 || unUser.role === 2 || unUser.role === 3) && {
      icon: <MonetizationOnIcon fontSize="inherit" />,
      title: "Dépense(s)",
      description: "Ajout des dépenses de l'entreprise",
      className: "bg-gradient-to-br from-orange-50 to-orange-100",
      to: "/entreprise/depense"
    }
  ].filter((card): card is NavigationCardType => Boolean(card));

  return (
    <Box
      className="min-h-screen mobile-container"
      // sx={{
      //   background: `linear-gradient(rgba(128, 128, 128, 0.7), rgba(128, 128, 128, 0.7)), url(${url})`,
      //   backgroundSize: 'cover',
      //   backgroundPosition: 'center',
      //   backgroundAttachment: 'fixed',
      //   padding: { xs: '16px', sm: '24px', md: '32px' }
      // }}
    >
      <Container maxWidth="xl" sx={{ padding: { xs: 0, sm: 1 } }}>
        <Stack spacing={isMobile ? 3 : 6}>
          {/* Header */}
          <Box sx={{ textAlign: isMobile ? 'center' : 'left' }} className={isMobile ? 'mobile-header' : ''}>
            <Typography 
              variant="h4" 
              className={`font-bold text-gray-900 mb-2 ${isMobile ? 'mobile-title' : ''}`}
              sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
                textAlign: isMobile ? 'center' : 'left'
              }}
            >
              Tableau de bord
            </Typography>
            <Typography 
              variant="body1" 
              className="text-gray-600"
              sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem' },
                textAlign: isMobile ? 'center' : 'left'
              }}
            >
              Bienvenue dans votre espace de gestion
            </Typography>
          </Box>

          {/* Sales Statistics */}
          <Paper 
            elevation={isMobile ? 1 : 0} 
            className={`border rounded-2xl overflow-hidden ${isMobile ? 'mobile-stats-card' : ''}`}
            sx={{ borderRadius: isMobile ? '16px' : '8px' }}
          >
            <Box className="p-4 border-b bg-gray-50">
              <Typography 
                variant="h5" 
                className="font-medium text-gray-900"
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                Statistiques des ventes
              </Typography>
            </Box>
            <Box className="p-4">
              <SimpleCharts />
            </Box>
          </Paper>

          {/* Monthly Sales */}
          {stockSemaine.sorties_par_mois && stockSemaine.sorties_par_mois.length > 0 ? (
            <Paper 
              elevation={isMobile ? 1 : 0} 
              className={`border rounded-2xl overflow-hidden ${isMobile ? 'mobile-stats-card' : ''}`}
              sx={{ borderRadius: isMobile ? '16px' : '8px' }}
            >
              <Box className="p-4 border-b bg-gray-50">
                <Typography 
                  variant="h5" 
                  className="font-medium text-gray-900"
                  sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                >
                  Produits les plus vendus - {format(new Date(stockSemaine.sorties_par_mois[stockSemaine.sorties_par_mois.length - 1].month), 'MMMM yyyy')}
                </Typography>
              </Box>
              <Box className="p-4">
                <MonthlyBarChart details={stockSemaine.sorties_par_mois[stockSemaine.sorties_par_mois.length - 1].details} />
              </Box>
            </Paper>
          ) : (
            <Alert 
              severity="info" 
              className={`border rounded-2xl ${isMobile ? 'mobile-alert' : ''}`}
              sx={{ borderRadius: isMobile ? '16px' : '8px' }}
            >
              Aucune vente n'a été enregistrée ce mois-ci
            </Alert>
          )}

          {/* Navigation Section */}
          <Box>
            <Typography 
              variant="h5" 
              className={`font-medium text-gray-900 mb-4 ${isMobile ? 'mobile-title' : ''}`}
              sx={{ 
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                textAlign: isMobile ? 'center' : 'left'
              }}
            >
              Navigation rapide
            </Typography>
            <Paper 
              elevation={isMobile ? 1 : 0} 
              className={`border p-4 mb-4 rounded-2xl ${isMobile ? 'mobile-glass' : ''}`}
              sx={{ borderRadius: isMobile ? '16px' : '8px' }}
            >
              <Typography 
                variant="body1" 
                className="text-gray-600 text-center"
                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
              >
                Pour les factures et dépenses (en version numérique si nécessaire en PDF)
              </Typography>
            </Paper>
            <Grid container spacing={isMobile ? 2 : 3} className={isMobile ? 'py-3' : 'py-3'}>
              {navigationCards.map((card, index) => (
                <Grid item xs={6} sm={6} md={4} key={index} className={`mobile-stagger-${(index % 6) + 1}`}>
                  <NavigationCard {...card} />
                </Grid>
              ))}
            </Grid>
          </Box>

        </Stack>
      </Container>
    </Box>
  );
}
