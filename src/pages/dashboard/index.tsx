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
import { FC, useState } from 'react';
import { useFetchEntreprise, useFetchUser, useStockSemaine, useAllClients, useStockEntreprise } from '../../usePerso/fonction.user';
import { useGetSumDepense } from '../../usePerso/fonction.entre';
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso';
import { useStoreUuid } from '../../usePerso/store';
import { format } from 'date-fns';
import SimpleCharts from '../../_components/Chart/Chart_1';
import { Alert, Box, CircularProgress, Stack, Paper, Container, Button, useMediaQuery, useTheme } from '@mui/material';
import MonthlyBarChart from './MonthlyBarChart';
import './mobile-dashboard.css';
import { ChartSection } from './components/ChartSection';
import MonthlyTarget from './MonthlyTarget';

// import Logo from '../../components/logo/LogoMain';

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
      className={`h-full transition-all duration-300 hover:shadow-xl hover:scale-105 rounded-2xl border-0 mobile-nav-card mobile-hover-effect ${className} shadow-sm bg-white`}
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
  
  // Gestion d'erreur robuste pour éviter les pages blanches
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Utilisation de try-catch pour les hooks qui peuvent échouer
  let unUser, uuid, unEntreprise, stockSemaine, stockEntreprise, getClients, stockData, depensesSum;
  
  try {
    const userData = useFetchUser();
    unUser = userData.unUser;
    uuid = useStoreUuid((state) => state.selectedId);
    
    const entrepriseData = useFetchEntreprise(uuid);
    
    unEntreprise = entrepriseData.unEntreprise;
    
    stockData = useStockSemaine(uuid || '');
    
    stockSemaine = stockData.stockSemaine;
    // Ajout pour CA et clients
    const stockEntrepriseData = useStockEntreprise(uuid || '');
    const depensesData = useGetSumDepense(uuid!);
    depensesSum = depensesData.depensesSum;
    stockEntreprise = stockEntrepriseData.stockEntreprise;
    const clientsData = useAllClients(uuid || '');
    getClients = clientsData.getClients;
    
  } catch (error) {
    console.error('Erreur lors du chargement du dashboard:', error);
    setHasError(true);
    setErrorMessage('Erreur lors du chargement des données');
  }

  // Protection contre les données manquantes
  if (!unUser || !unEntreprise) {
    return (
      <Box className="flex items-center justify-center min-h-screen mobile-loading">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (hasError) {
    return (
      <Container maxWidth="sm" className="py-8">
        <Alert 
          severity="error"
          className="shadow-lg rounded-2xl mobile-alert"
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => {
                setHasError(false);
                window.location.reload();
              }} 
              className="mobile-button"
            >
              Réessayer
            </Button>
          }
        >
          {errorMessage || 'Erreur inattendue ! Veuillez réessayer.'}
        </Alert>
      </Container>
    );
  }

  // Protection contre les données manquantes pour les cartes
  const safeStockSemaine = stockSemaine || { sorties_par_mois: [] };
  const safeUnUser = unUser || { role: 0 };

  const navigationCards = [
    safeUnUser.role === 1 ? {
      icon: <AddBusinessIcon fontSize="inherit" />,
      title: "Entreprise",
      description: "Les informations de votre entreprise",
      className: "bg-gradient-to-br from-blue-50 to-blue-100",
      to: "/entreprise/detail"
    } : null,
    (safeUnUser.role === 1 || safeUnUser.role === 2) ? {
      icon: <CategoryIcon fontSize="inherit" />,
      title: "Article || Catégorie",
      description: "Les différents articles de l'entreprise",
      className: "bg-gradient-to-br from-white to-gray-50",
      to: "/categorie"
    } : null,
    (safeUnUser.role === 1 || safeUnUser.role === 2) && {
      icon: <AddCircleIcon fontSize="inherit" />,
      title: "Entrer || Achat",
      description: "Entrée des produits de l'entreprise",
      className: "bg-gradient-to-br from-green-50 to-green-100",
      to: "/entre"
    },
    (safeUnUser.role === 1 || safeUnUser.role === 2 || safeUnUser.role === 3) && {
      icon: <ExitToAppIcon fontSize="inherit" />,
      title: "Sortie || Vente",
      description: "Pour la sortie des produits dans l'entreprise",
      className: "bg-gradient-to-br from-red-50 to-red-100",
      to: "/sortie"
    },
    (safeUnUser.role === 1 || safeUnUser.role === 2 || safeUnUser.role === 3) && {
      icon: <PeopleOutlineRoundedIcon fontSize="inherit" />,
      title: "Clients || Fournisseurs",
      description: "Pour ajouter des clients ou fournisseurs",
      className: "bg-gradient-to-br from-lime-50 to-lime-100",
      to: "/entreprise/client"
    },
    safeUnUser.role === 1 && {
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
    (safeUnUser.role === 1 || safeUnUser.role === 2 || safeUnUser.role === 3) && {
      icon: <FileCopyIcon fontSize="inherit" />,
      title: "Factures sorties (ventes)",
      description: "Factures des produits de l'entreprise",
      className: "bg-gradient-to-br from-amber-50 to-amber-100",
      to: "/entreprise/produit/sortie"
    },
    (safeUnUser.role === 1 || safeUnUser.role === 2) && {
      icon: <FileOpenIcon fontSize="inherit" />,
      title: "Factures entrées (achat)",
      description: "Factures des produits de l'entreprise",
      className: "bg-gradient-to-br from-slate-50 to-slate-100",
      to: "/entreprise/produit/entre"
    },
    (safeUnUser.role === 1 || safeUnUser.role === 2 || safeUnUser.role === 3) && {
      icon: <MonetizationOnIcon fontSize="inherit" />,
      title: "Dépense(s)",
      description: "Ajout des dépenses de l'entreprise",
      className: "bg-gradient-to-br from-orange-50 to-orange-100",
      to: "/entreprise/depense"
    }
  ].filter((card): card is NavigationCardType => Boolean(card));

  return (
    <Box className="min-h-screen mobile-container">
      <Container maxWidth="xl" sx={{ padding: { xs: 0, sm: 1 } }}>
        <Box sx={{ px: { xs: 1, sm: 2 } }}>
          <Stack spacing={isMobile ? 3 : 6}>
            {/* Header */}
            <Grid container>
            
              <Grid item xs={12}>
              
                <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  flexDirection: 'column', 
                  textAlign: 'center', 
                  gap: 2,

                  backdropFilter: 'blur(1px)',
                  // bgcolor: 'rgba(255,255,255,0.06)',

                }} 
                
                className={'mobile-glass p-4 rounded-2xl mb-4'}
                
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: isMobile ? 1 : 0 }}>
                    {/* <Logo /> */}
                    <Typography variant="h6" className="font-bold text-gray-100" sx={{ ml: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>{unEntreprise?.nom || 'Entreprise'}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h4" 
                      className={`font-bold text-gray-50 mb-2 leading-tight`}
                      sx={{ 
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
                        textAlign: isMobile ? 'center' : 'left'
                      }}
                    >
                      Tableau de bord
                    </Typography>
                    <Typography 
                      variant="body1" 
                      className="text-gray-200 leading-snug"
                      sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        textAlign: isMobile ? 'center' : 'left'
                      }}
                    >
                      Bienvenue dans votre espace de gestion
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2} sx={{ width: '100%', mb: 3 }} className='flex justify-center'>
                  
                  <Grid item md={3} sm={6}>

                    <Paper 
                      elevation={3} 
                      sx={{ 
                        p: 3, 
                        borderRadius: 3, 
                        boxShadow: '0 4px 24px rgba(0,0,0,0.07)', 
                        minWidth: 200, 
                        flex: 1, 
                        maxWidth: 350,
                        // bgcolor: 'rgba(255,255,255,0.06)', // semi-transparent. Mettre 'transparent' pour totalement transparent
                        // backdropFilter: 'blur(8px)'        
                      }}
                    
                    >
                      <Typography variant="subtitle2" color="text.secondary">
                        CA du mois
                      </Typography>
                      
                      <Typography variant="h5" className="font-bold" sx={{ color: 'primary.main', mt: 1 }}>
                        {(() => {
                          if (stockEntreprise && stockEntreprise.details_sortie_par_mois) {
                            const months = Object.keys(stockEntreprise.details_sortie_par_mois);
                            const lastMonth = months[months.length - 1];
                            const details = stockEntreprise.details_sortie_par_mois[lastMonth];
                            
                            if (details) {
                              return formatNumberWithSpaces((details as any).somme_prix_total || 0);
                            }
                          }
                          return '--';
                        })()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        montant brut (hors remises)
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item md={3} sm={6}>

                  <Paper elevation={3} sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', bgcolor: 'white', minWidth: 200, flex: 1, maxWidth: 350 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Dépenses du mois
                    </Typography>
                    
                    <Typography variant="h5" className="font-bold" sx={{ color: 'error.main', mt: 1 }}>
                      {(() => {
                        if (depensesSum && depensesSum.length > 0) {
                          // Trier par mois (du plus récent au plus ancien)
                          const sortedDepenses = depensesSum.sort((a, b) => {
                            const dateA = new Date(a.mois + '-01');
                            const dateB = new Date(b.mois + '-01');
                            return dateB.getTime() - dateA.getTime();
                          });
                          
                          // Prendre le total du dernier mois
                          const lastMonthTotal = sortedDepenses[0].total || 0;
                          return formatNumberWithSpaces(lastMonthTotal);
                        }
                        return '--';
                      })()}
                    </Typography>
                    
                  </Paper>
                  </Grid>

                  <Grid item md={3} sm={6}>

                  <Paper elevation={3} sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', bgcolor: 'white', minWidth: 200, flex: 1, maxWidth: 350 }}>
                    <Typography variant="subtitle2" color="text.secondary">Ventes ce mois</Typography>
                    <Typography variant="h5" className="font-bold" sx={{ color: 'success.main', mt: 1 }}>
                      {(() => {
                        if (stockEntreprise && stockEntreprise.details_sortie_par_mois) {
                          const months = Object.keys(stockEntreprise.details_sortie_par_mois);
                          const lastMonth = months[months.length - 1];
                          const details = stockEntreprise.details_sortie_par_mois[lastMonth];
                          
                          if (details) {
                            return (details as any).somme_qte || 0;
                          }
                        }
                        return '--';
                      })()}
                    </Typography>
                  </Paper>
                  </Grid>

                  <Grid item md={3} sm={6}>

                  <Paper elevation={3} sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', bgcolor: 'white', minWidth: 200, flex: 1, maxWidth: 350 }}>
                    <Typography variant="subtitle2" color="text.secondary">Clients</Typography>
                    <Typography variant="h5" className="font-bold" sx={{ color: 'info.main', mt: 1 }}>
                      {getClients ? getClients.filter(client => client.role === 1 || client.role === 3).length : '--'}
                    </Typography>
                    {/* <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      (rôle 1 ou 3 uniquement)
                    </Typography> */}
                  </Paper>
                  
                  </Grid>
                </Grid>

                {/* </Box> */}
              </Grid>

              {/* Grille principale pour les 3 sections */}

              {/* Monthly Sales */}
              <Grid item xs={12} md={8}>
                {safeStockSemaine.sorties_par_mois && safeStockSemaine.sorties_par_mois.length > 0 ? (
                  <Paper 
                    elevation={isMobile ? 1 : 0} 
                    className={`border rounded-2xl overflow-hidden ${isMobile ? 'mobile-stats-card' : ''} shadow-sm`}
                    sx={{ borderRadius: isMobile ? '16px' : '8px' }}
                  >
                    <Box className="p-4 border-b bg-gray-50">
                      <Typography 
                        variant="h5" 
                        className="font-medium text-gray-900"
                        sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                      >
                        Produits les plus vendus - {(() => {
                          try {
                            return format(new Date(safeStockSemaine.sorties_par_mois[safeStockSemaine.sorties_par_mois.length - 1].month), 'MMMM yyyy');
                          } catch (error) {
                            return 'Ce mois';
                          }
                        })()}
                      </Typography>
                    </Box>
                    <Box className="p-4">
                      {(() => {
                        try {
                          return <MonthlyBarChart details={safeStockSemaine.sorties_par_mois[safeStockSemaine.sorties_par_mois.length - 1].details} />;
                        } catch (error) {
                          console.error('Erreur MonthlyBarChart:', error);
                          return (
                            <Alert severity="warning" className="rounded-lg">
                              Impossible de charger le graphique des ventes
                            </Alert>
                          );
                        }
                      })()}
                    </Box>
                  </Paper>
                ) : (
                  <Alert 
                    severity="info" 
                    className={`border rounded-2xl ${isMobile ? 'mobile-alert' : ''} shadow-sm`}
                    sx={{ borderRadius: isMobile ? '16px' : '8px' }}
                  >
                    Aucune vente n'a été enregistrée ce mois-ci
                  </Alert>
                )}
              </Grid>

              {/* Sales Statistics */}
              <Grid item xs={12} md={4}>
                
                  
                  {/* <Box className={`border rounded-2xl overflow-hidden ${isMobile ? 'mobile-stats-card mt-3' : 'ml-3'} `}> */}
                    {(() => {
                      try {
                        return <ChartSection className={`${isMobile ? 'mt-5' : 'ml-5'} `} title="Statistiques des ventes">
                        <SimpleCharts />
                        </ChartSection>
                      // <SimpleCharts />;
                      } catch (error) {
                        console.error('Erreur SimpleCharts:', error);
                        return (
                          <Alert severity="warning" className="rounded-lg">
                            Impossible de charger les statistiques
                          </Alert>
                        );
                      }
                    })()}
                  {/* </Box> */}

                  {/* <div className="col-span-12 xl:col-span-5">
                    <MonthlyTarget />
                  </div> */}
                
              </Grid>

            
              <Grid item xs={12}>
                {/* Navigation Section */}
                <Box>
                  <Typography 
                    variant="h5" 
                    className={`font-medium text-gray-50 mb-4`}
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      textAlign: isMobile ? 'center' : 'left'
                    }}
                  >
                    Navigation rapide
                  </Typography>
                  <Paper 
                    elevation={isMobile ? 1 : 0} 
                    className={`border p-4 mb-4 rounded-2xl mobile-glass shadow-sm`}
                    sx={{ borderRadius: isMobile ? '16px' : '8px' }}
                  >
                    <Typography 
                      variant="body1" 
                      className="text-gray-50 text-center"
                      sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                    >
                      Pour les factures et dépenses (en version numérique si nécessaire en PDF)
                    </Typography>
                  </Paper>
                  <Grid container spacing={isMobile ? 2 : 3} className={isMobile ? 'py-3' : 'py-3'}>
                    {navigationCards.map((card, index) => (
                      <Grid item xs={6} sm={6} md={4} key={index} className={isMobile ? `mobile-stagger-${(index % 6) + 1}` : ''}>
                        <NavigationCard {...card} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
