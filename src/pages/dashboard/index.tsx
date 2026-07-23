// material-ui
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
import { useFetchEntreprise, useFetchUser, useStockSemaine, useAllClients, useStockEntreprise, useRestructionUsers } from '../../usePerso/fonction.user';
import { useGetSumDepense } from '../../usePerso/fonction.entre';
import { formatNumberWithSpaces, isAccessAllowed } from '../../usePerso/fonctionPerso';
import { useStoreUuid } from '../../usePerso/store';
import { format } from 'date-fns';
import SimpleCharts from '../../_components/Chart/Chart_1';
import { Alert, Box, CircularProgress, Stack, Paper, Container, Button, useMediaQuery, useTheme } from '@mui/material';
import MonthlyBarChart from './MonthlyBarChart';
import './mobile-dashboard.css';
import { ChartSection } from './components/ChartSection';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PaymentsIcon from '@mui/icons-material/Payments';
import { StatCard } from '../../usePerso/useEntreprise';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

// Types
interface NavigationCardType {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  color?: string;
  disabled?: boolean;
}

const NavigationCard: FC<NavigationCardType> = ({ icon, title, description, to, color = '#6366f1', disabled }) => {
  const CardContent = (
    <Paper
      elevation={0}
      className="mobile-nav-card mobile-hover-effect mobile-glass"
     
      sx={{
        height: '100%',
        minHeight: { xs: '140px', sm: '155px' },
        // bgcolor: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
        // backdropFilter: 'blur(16px)',
        border: '1px solid',
        borderColor: disabled ? 'rgba(255,255,255,0.05)' : `${color}25`,
        borderRadius: '20px',
        p: { xs: 2, sm: 2.5 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: disabled ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.12)',
        '&::before': !disabled ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${color}, transparent)`,
          opacity: 0.8,
        } : {},
        '&:hover': !disabled ? {
          bgcolor: `${color}12`,
          borderColor: `${color}50`,
          transform: 'translateY(-5px)',
          boxShadow: `0 14px 32px ${color}25`,
        } : {},
      }}
    >
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: '14px',
          bgcolor: `${color}18`,
          border: `1px solid ${color}35`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          fontSize: '1.6rem',
          mb: 1.5,
          transition: 'transform 0.3s ease',
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h6"
        sx={{
          fontSize: { xs: '0.92rem', sm: '1.02rem' },
          fontWeight: 700,
          color: '#e0e7ff',
          mb: 0.6,
          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontSize: { xs: '0.76rem', sm: '0.82rem' },
          color: '#64748b',
          lineHeight: 1.4,
          fontWeight: 500,
        }}
      >
        {description}
      </Typography>
    </Paper>
  );

  if (disabled) {
    return CardContent;
  }

  return (
    <Link to={to} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      {CardContent}
    </Link>
  );
};

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

  const { getRestruction } = useRestructionUsers();

  // Protection contre les données manquantes
  if (!unUser || !unEntreprise) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyCenter: 'center', minHeight: '80vh' }}>
        <CircularProgress size={50} sx={{ color: '#6366f1', mx: 'auto' }} />
      </Box>
    );
  }

  if (hasError) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert
          severity="error"
          sx={{
            bgcolor: 'rgba(239,68,68,0.1)',
            color: '#fca5a5',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '16px',
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setHasError(false);
                window.location.reload();
              }}
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

  const navigationCards: NavigationCardType[] = (
    [
      safeUnUser.role === 1 ? {
        icon: <AddBusinessIcon fontSize="inherit" />,
        title: "Entreprise",
        description: "Les informations de votre entreprise",
        color: "#6366f1",
        to: "/entreprise/detail"
      } : null,
      (safeUnUser.role === 1 || safeUnUser.role === 2) ? {
        icon: <CategoryIcon fontSize="inherit" />,
        title: "Article || Catégorie",
        description: "Les différents articles de l'entreprise",
        color: "#8b5cf6",
        to: "/categorie"
      } : null,
      (safeUnUser.role === 1 || safeUnUser.role === 2) ? {
        icon: <AddCircleIcon fontSize="inherit" />,
        title: "Entrer || Achat",
        description: "Entrée des produits de l'entreprise",
        color: "#10b981",
        to: "/entre"
      } : null,
      (safeUnUser.role === 1 || safeUnUser.role === 3 || safeUnUser.role === 2) ? {
        icon: <ExitToAppIcon fontSize="inherit" />,
        title: "Sortie || Vente",
        description: "Pour la sortie des produits dans l'entreprise",
        color: "#ef4444",
        to: "/sortie"
      } : null,
      (safeUnUser.role === 1 || safeUnUser.role === 2 || safeUnUser.role === 3) ? {
        icon: <PeopleOutlineRoundedIcon fontSize="inherit" />,
        title: "Clients || Fournisseurs",
        description: "Pour ajouter des clients ou fournisseurs",
        color: "#06b6d4",
        to: "/entreprise/client"
      } : null,
      safeUnUser.role === 1 ? {
        icon: <PersonAddAltIcon fontSize="inherit" />,
        title: "Personnels",
        description: "Pour ajouter des personnes qui ont accès à la plateforme",
        color: "#ec4899",
        to: "/entreprise/personnel"
      } : null,
      {
        icon: <ReceiptIcon fontSize="inherit" />,
        title: "Facture Proforma",
        description: "Cette facture ne sera pas enregistrée",
        color: "#f59e0b",
        to: "/entreprise/PreFacture"
      },
      (safeUnUser.role === 1 || safeUnUser.role === 2 || safeUnUser.role === 3) ? {
        icon: <FileCopyIcon fontSize="inherit" />,
        title: "Factures sorties (ventes)",
        description: "Factures des produits de l'entreprise",
        color: "#f97316",
        to: "/entreprise/produit/sortie",
        disabled: (unEntreprise.licence_type === "Stock Simple")
      } : null,
      (safeUnUser.role === 1 || safeUnUser.role === 2) ? {
        icon: <FileOpenIcon fontSize="inherit" />,
        title: "Factures entrées (achat)",
        description: "Factures des produits de l'entreprise",
        color: "#64748b",
        to: "/entreprise/produit/entre",
        disabled: (unEntreprise.licence_type === "Stock Simple")
      } : null,
      (safeUnUser.role === 1 || safeUnUser.role === 3 || safeUnUser.role === 2) ? {
        icon: <MonetizationOnIcon fontSize="inherit" />,
        title: "Dépense(s)",
        description: "Ajout des dépenses de l'entreprise",
        color: "#14b8a6",
        to: "/entreprise/depense",
        disabled: (unEntreprise.licence_type === "Stock Simple")
      } : null
    ] as (NavigationCardType | null)[]
  ).filter((card): card is NavigationCardType => card !== null);

  return (
    <Box sx={{ minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Stack spacing={isMobile ? 3 : 4}>
          
          {/* Header Banner */}
          <Box
            className={`relative p-4 rounded-lg transition-all duration-200 hover:shadow-md border-x-2 animate-border-rotate mobile-shadow-card mobile-hover-effect ${isMobile ? 'mobile-glass' : 'mobile-glass'}`}
            sx={{
              // background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
              // backdropFilter: 'blur(16px)',
              border: '1px solid rgba(99,102,241,0.18)',
              borderRadius: '20px',
              p: { xs: 2.5, sm: 3.5 },
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-start' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 1, bgcolor: 'rgba(99,102,241,0.15)', px: 1.5, py: 0.4, borderRadius: '20px', border: '1px solid rgba(99,102,241,0.3)' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                <Typography variant="caption" sx={{ color: '#c4b5fd', fontWeight: 600, letterSpacing: 0.5 }}>
                  {unEntreprise?.nom || 'Entreprise'}
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.1rem' },
                  fontWeight: 800,
                  color: '#e0e7ff',
                  letterSpacing: '-0.02em',
                }}
              >
                Tableau de bord
              </Typography>
              <Typography variant="body1" sx={{ color: '#94a3b8', fontSize: { xs: '0.85rem', sm: '0.95rem' }, mt: 0.5 }}>
                Bienvenue dans votre espace de gestion d'entreprise
              </Typography>
            </Box>
          </Box>

          {/* Stat Cards Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: isMobile ? 2 : 2.5,
            }}
          >
            <StatCard
              title="Chiffre d'Affaires du mois"
              description="montant brut (hors remises)"
              value={(() => {
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
              icon={<PaymentsIcon sx={{ color: '#22c55e' }} />}
            />

            <StatCard
              title="Ventes Totales du mois"
              value={(() => {
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
              icon={<ShoppingBagIcon sx={{ color: '#6366f1' }} />}
            />

            <StatCard
              title="Clients"
              value={getClients ? getClients.filter(client => client.role === 1 || client.role === 3).length : '--'}
              icon={<PeopleOutlineRoundedIcon sx={{ color: '#06b6d4' }} />}
            />

            <StatCard
              title="Dépenses du mois"
              value={(() => {
                if (depensesSum && depensesSum.length > 0) {
                  const sortedDepenses = [...depensesSum].sort((a, b) => {
                    const dateA = new Date(a.mois + '-01');
                    const dateB = new Date(b.mois + '-01');
                    return dateB.getTime() - dateA.getTime();
                  });
                  const lastMonthTotal = sortedDepenses[0].total || 0;
                  return formatNumberWithSpaces(lastMonthTotal);
                }
                return '--';
              })()}
              icon={<PaymentsIcon sx={{ color: '#ef4444' }} />}
            />
          </Box>

          {/* Charts Section */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
              gap: 3,
            }}
          >
            {/* Monthly Sales */}
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 8' } }}>
              {safeStockSemaine.sorties_par_mois && safeStockSemaine.sorties_par_mois.length > 0 ? (
                <Box sx={{ height: '100%' }}>
                  <ChartSection
                    title={`Produits les plus vendus - ${(() => {
                      try {
                        return format(new Date(safeStockSemaine.sorties_par_mois[safeStockSemaine.sorties_par_mois.length - 1].month), 'MMMM yyyy');
                      } catch (error) {
                        return 'Ce mois';
                      }
                    })()}`}
                    className="h-full"
                  >
                    {(() => {
                      try {
                        return <MonthlyBarChart details={safeStockSemaine.sorties_par_mois[safeStockSemaine.sorties_par_mois.length - 1].details} />;
                      } catch (error) {
                        console.error('Erreur MonthlyBarChart:', error);
                        return (
                          <Alert severity="warning" sx={{ borderRadius: 2 }}>
                            Impossible de charger le graphique des ventes
                          </Alert>
                        );
                      }
                    })()}
                  </ChartSection>
                </Box>
              ) : (
                <Alert
                  severity="info"
                  sx={{
                    bgcolor: 'rgba(99,102,241,0.08)',
                    color: '#c4b5fd',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '16px',
                  }}
                >
                  Aucune vente n'a été enregistrée ce mois-ci
                </Alert>
              )}
            </Box>

            {/* Sales Statistics */}
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
              {(() => {
                try {
                  return (
                    <Box sx={{ height: '100%' }}>
                      <ChartSection title="Statistiques des ventes">
                        <SimpleCharts />
                      </ChartSection>
                    </Box>
                  );
                } catch (error) {
                  console.error('Erreur SimpleCharts:', error);
                  return (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      Impossible de charger les statistiques
                    </Alert>
                  );
                }
              })()}
            </Box>
          </Box>

          {/* Quick Navigation Section */}
          <Box sx={{ pt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#e0e7ff',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                }}
              >
                Navigation rapide
              </Typography>
              <Typography variant="caption" className="text-gray-300" sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                Accès direct aux modules
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
                gap: isMobile ? 2 : 2.5,
              }}
            >
              {(() => {
                if (!getRestruction) return null;

                if (isAccessAllowed(getRestruction)) {
                  return navigationCards.map((card, index) => (
                    <Box key={index} className={isMobile ? `mobile-stagger-${(index % 6) + 1}` : ''}>
                      <NavigationCard {...card} />
                    </Box>
                  ));
                } else {
                  return (
                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <Alert
                        severity="warning"
                        sx={{
                          bgcolor: 'rgba(234,179,8,0.1)',
                          color: '#fde68a',
                          border: '1px solid rgba(234,179,8,0.3)',
                          borderRadius: '16px',
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          Accès restreint
                        </Typography>
                        <Typography variant="body2">
                          Vous n'êtes pas autorisé à accéder à ces fonctionnalités en dehors de vos heures de travail.
                          <br />
                          Horaires : {getRestruction.hour_start} - {getRestruction.hour_end}
                        </Typography>
                      </Alert>
                    </Box>
                  );
                }
              })()}
            </Box>
          </Box>

        </Stack>
      </Container>
    </Box>
  );
}
