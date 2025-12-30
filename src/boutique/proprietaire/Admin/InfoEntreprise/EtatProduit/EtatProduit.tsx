import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField
} from '@mui/material';

import { useFetchEntreprise, useStockEntreprise } from '../../../../../usePerso/fonction.user';
import { useGetAllEntre, useGetAllSortie } from '../../../../../usePerso/fonction.entre';
import { useStoreUuid } from '../../../../../usePerso/store';
import { Link } from 'react-router-dom';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';

import { useEffect, useState } from 'react';
import { RecupType } from '../../../../../typescript/DataType';
import { formatNumberWithSpaces } from '../../../../../usePerso/fonctionPerso';

import '../../mobile-admin.css';

// ───────────────────────────────
// Utils
// ───────────────────────────────
function isLicenceExpired(dateStr?: string) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

// ───────────────────────────────
// Component
// ───────────────────────────────
export default function EtatProduit() {
  const uuid = useStoreUuid((state) => state.selectedId);

  const { stockEntreprise, isLoading, isError } = useStockEntreprise(uuid || '');
  const { sortiesEntreprise = [] } = useGetAllSortie(uuid!);
  const { entresEntreprise = [] } = useGetAllEntre(uuid!);
  const { unEntreprise } = useFetchEntreprise(uuid);

  const [isMobile, setIsMobile] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');

  // ───────────────────────────────
  // Responsive
  // ───────────────────────────────
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ───────────────────────────────
  // FILTRAGE DATE - SORTIES
  // ───────────────────────────────
  const sortiesFiltrees = sortiesEntreprise.filter((item: RecupType) => {
    if (!item.date) return false;

    const itemDate = item.date.split('T')[0]; // YYYY-MM-DD

    if (selectedStartDate && itemDate < selectedStartDate) return false;
    if (selectedEndDate && itemDate > selectedEndDate) return false;

    return true;
  });

  const sortiesValides = sortiesFiltrees.filter(
    (item: RecupType) => item.is_remise === false
  );

  // ───────────────────────────────
  // CHIFFRE D'AFFAIRES (VENTES)
  // ───────────────────────────────
  const totalCA = sortiesValides.reduce((acc, row) => {
    const montant =
      row.qte !== undefined && row.pu !== undefined
        ? row.qte * row.pu
        : 0;
    return acc + montant;
  }, 0);

  // ───────────────────────────────
  // FILTRAGE DATE - ENTREES
  // ───────────────────────────────
  const entresFiltrees = entresEntreprise.filter((item: RecupType) => {
    if (!item.date) return false;

    const itemDate = item.date.split('T')[0];

    if (selectedStartDate && itemDate < selectedStartDate) return false;
    if (selectedEndDate && itemDate > selectedEndDate) return false;

    return true;
  });

  // ───────────────────────────────
  // MONTANT DEPENSÉ (ACHATS)
  // ───────────────────────────────
  const totalMD = entresFiltrees.reduce((acc, row: RecupType) => {
    const montant =
      row.qte !== undefined && row.pu_achat !== undefined
        ? row.qte * row.pu_achat
        : 0;
    return acc + montant;
  }, 0);

  const beneficeEstime = totalCA - totalMD;
  const isPerte = beneficeEstime < 0;


  // ───────────────────────────────
  // Loading / Error
  // ───────────────────────────────
  if (isLoading) {
    return (
      <Box className="flex items-center justify-center p-8">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        }
      >
        Problème de connexion
      </Alert>
    );
  }

  if (!stockEntreprise || !unEntreprise) return null;

  const licenceExpiree = isLicenceExpired(unEntreprise.licence_date_expiration);

  // ───────────────────────────────
  // Stats cards
  // ───────────────────────────────
  const stats = [
    {
      title: 'Quantités sorties',
      value: stockEntreprise.somme_sortie_qte,
      icon: <TrendingDownIcon color="error" />
    },
    {
      title: 'Quantités en stock',
      value: stockEntreprise.somme_entrer_qte,
      icon: <InventoryIcon color="success" />
    },
    {
      title: 'Sorties effectuées',
      value: stockEntreprise.nombre_sortie,
      icon: <ShoppingCartIcon color="primary" />,
      link: '/sortie'
    },
    {
      title: 'Entrées effectuées',
      value: stockEntreprise.nombre_entrer,
      icon: <TrendingUpIcon color="info" />,
      link: '/entre'
    }
  ];

  // ───────────────────────────────
  // Render
  // ───────────────────────────────
  return (
    <Container maxWidth="md" className="py-8">
      <Typography variant="h4" className="text-gray-50 mb-4">
        Statistiques de l’entreprise
      </Typography>

      {/* Filtres date */}
      <Grid container spacing={2} className="mb-4">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            className='bg-slate-200'
            label="Date de début"
            type="date"
            value={selectedStartDate}
            onChange={(e) => setSelectedStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            className='bg-slate-200'
            label="Date de fin"
            type="date"
            value={selectedEndDate}
            onChange={(e) => setSelectedEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      {/* CA */}
      <Box className="flex items-center gap-2 mb-3">
        <LocalAtmIcon color="primary" />
        <Typography variant="h6" className="text-gray-50">
          Chiffre d’affaires : {formatNumberWithSpaces(totalCA)}
        </Typography>
      </Box>

      {/* Dépenses */}
      <Box className="flex items-center gap-2 mb-6">
        <LocalAtmIcon color="error" />
        <Typography variant="h6" className="text-gray-50">
          Somme des prix d'achats : {formatNumberWithSpaces(totalMD)}
        </Typography>
      </Box>

      <Box className="flex items-center gap-2 mb-6">
        <LocalAtmIcon color={isPerte ? 'info' : 'success'} />
        <Typography
          variant="h6"
          sx={{
            color: isPerte ? 'info.main' : 'success.main',
            fontWeight: 600
          }}
        >
          {isPerte ? 'Perte estimée' : 'Bénéfice estimé'} :{' '}
          {formatNumberWithSpaces(Math.abs(beneficeEstime))}
        </Typography>
      </Box>

      {/* <Box className="flex items-center gap-2 mb-6">
        <LocalAtmIcon color={isPerte ? 'error' : 'success'} />
        <Typography
          variant="h6"
          sx={{
            color: isPerte ? 'error.main' : 'success.main',
            fontWeight: 600
          }}
        >
          {isPerte ? "Prix d'achat estimé" : 'Bénéfice estimé'} :{' '}
          {formatNumberWithSpaces(Math.abs(beneficeEstime))}
        </Typography>
      </Box> */}


      {/* Stats */}
      <Grid container spacing={3}>
        {stats.map((stat, index) => {
          const Card = (
            <Paper
              elevation={3}
              className={`p-4 ${
                licenceExpiree ? 'opacity-50 grayscale' : ''
              }`}
            >
              <Box className="flex justify-between items-center mb-2">
                <Typography variant="subtitle1">
                  {stat.title}
                </Typography>
                {stat.icon}
              </Box>
              <Typography variant="h5">{stat.value}</Typography>
            </Paper>
          );

          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              {stat.link && !licenceExpiree ? (
                <Link to={stat.link} className="no-underline">
                  {Card}
                </Link>
              ) : (
                Card
              )}
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
