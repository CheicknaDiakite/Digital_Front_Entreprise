import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  Button,
  TextField
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetchUnUser, useSortieUserEntreprise } from '../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../usePerso/store';
import { stringAvatar } from '../../../usePerso/fonctionPerso';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PaymentsIcon from '@mui/icons-material/Payments';
import InventoryIcon from '@mui/icons-material/Inventory';
import EditIcon from '@mui/icons-material/Edit';
import { format } from 'date-fns';
import { StatCard } from '../../../usePerso/useEntreprise';

export default function PersonnelInfo() {
  const { uuid: user_uuid } = useParams();
  const navigate = useNavigate();
  const entreprise_id = useStoreUuid((state) => state.selectedId);
  const { unUser, isLoading: userLoading } = useFetchUnUser(user_uuid!);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { sortiesUser, isLoading: sortiesLoading } = useSortieUserEntreprise(entreprise_id!, user_uuid, startDate, endDate);

  if (userLoading || sortiesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Calcul des statistiques pour cet utilisateur
  const userStats = sortiesUser.total_par_utilisateur.find(u => u.user_uuid === user_uuid) || {
    total_qte: 0,
    total_montant: 0
  };

  const totalVentes = sortiesUser.total_nombre_vente.find(u => u.user_uuid === user_uuid)?.total || 0;
  console.log('Sorties User:', sortiesUser);
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header with Back Button */}
      <Box display="flex" alignItems="center" mb={4}>
        {/* <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, color: 'white' }}>
          <ArrowBackIcon />
        </IconButton> */}
        <Typography variant="h4" fontWeight="bold" color="white">
          Détails du Personnel
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            borderRadius: 4, 
            height: '100%', 
            bgcolor: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(5px)' 
            }}
            className='text-gray-50'
            >
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" py={2}>
                <Avatar
                  {...stringAvatar(`${unUser.last_name} ${unUser.first_name}`)}
                  sx={{ width: 100, height: 100, fontSize: '2.5rem', mb: 2 }}
                />
                <Typography variant="h5" fontWeight="bold">
                  {unUser.first_name} {unUser.last_name}
                </Typography>
                <Typography gutterBottom>
                  @{unUser.username}
                </Typography>
                <Chip
                  label={
                    unUser.role === 1 ? "Admin" :
                      unUser.role === 2 ? "Superviseur" :
                        unUser.role === 3 ? "Caissier(e)" : "Pas de rôle"
                  }
                  color="primary"
                  sx={{ mt: 1, fontWeight: 'bold' }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ px: 2 }}>
                <Typography variant="subtitle2">Email</Typography>
                <Typography variant="body1" gutterBottom>{unUser.email_user || 'Non renseigné'}</Typography>

                <Typography variant="subtitle2" sx={{ mt: 2 }}>Téléphone</Typography>
                <Typography variant="body1" gutterBottom>{unUser.numero || 'Non renseigné'}</Typography>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/entreprise/personnel/modif/${user_uuid}`)}
                  sx={{ mt: 4, borderRadius: 2 }}
                  className='text-slate-100'
                >
                  Modifier le profil
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats and Sales Details */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3} mb={4}>
            {/* Stat Cards */}
            <Grid item xs={6} sm={4}>
              <StatCard
                title="Ventes Totales"
                value={totalVentes}
                icon={<ShoppingBagIcon color="primary" />}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <StatCard
                title="Produits Vendus"
                value={userStats.total_qte}
                icon={<InventoryIcon color="secondary" />}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <StatCard
                title="Chiffre d'Affaires"
                value={`${userStats.total_montant.toLocaleString()} F`}
                icon={<PaymentsIcon sx={{ color: '#2e7d32' }} />}
              />
            </Grid>
          </Grid>

          {/* Date Search Section */}
          <Paper sx={{ p: 2, mb: 4, borderRadius: 4, bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
            <Box mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">Rechercher par période</Typography>
            </Box>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6} sm={5}>
                <TextField
                  fullWidth
                  label="Du"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={5}>
                <TextField
                  fullWidth
                  label="Au"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  sx={{ borderRadius: 2 }}
                >
                  Effacer
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Recent Sales Table */}
          <Paper sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
            <Box px={3} py={2} bgcolor="rgba(0, 0, 0, 0.03)" display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                Dernières Ventes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                20 dernières transactions
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Date</b></TableCell>
                    <TableCell><b>Produit</b></TableCell>
                    <TableCell align="center"><b>Qté</b></TableCell>
                    <TableCell align="right"><b>P.U</b></TableCell>
                    <TableCell align="right"><b>Total</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortiesUser.derniere_ventes && sortiesUser.derniere_ventes.length > 0 ? (
                    sortiesUser.derniere_ventes.map((vente) => (
                      <TableRow key={vente.uuid} hover>
                        <TableCell sx={{ fontSize: '0.875rem' }}>{format(new Date(vente.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{vente.produit} {vente.libelle ? `(${vente.libelle})` : '' }</TableCell>
                        <TableCell align="center">{vente.qte}</TableCell>
                        <TableCell align="right">{vente.pu.toLocaleString()}</TableCell>
                        <TableCell align="right"><b>{vente.total.toLocaleString()}</b></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">Aucune vente enregistrée pour cet utilisateur.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          
        </Grid>
      </Grid>
    </Box>
  );
}

