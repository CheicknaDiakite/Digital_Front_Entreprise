import { FactureType } from '../../typescript/DataType';
import { factureService } from '../../_services/categorie.service';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Modal,
  Box,
  TextField,
  Button,
  Stack,
  Skeleton,
  Divider,
  Grid,
  Avatar,
  useTheme,
  alpha,
  Card,
  CardContent,
} from '@mui/material';
import {
  Payment,
  Visibility,
  Close,
  ReceiptLong,
  AccountBalanceWallet,
  CheckCircle,
  PendingActions,
  SearchOff,
  Delete,
  Warning,
  Search,
  CheckCircleOutline,
} from '@mui/icons-material';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useStoreUuid } from '../../usePerso/store';
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso';
import ReactToPrint from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import "../factureCard/print.css";

export default function FactureListe() {
  const theme = useTheme();
  const slug = useStoreUuid((state) => state.selectedId);
  const [factures, setFactures] = useState<FactureType[]>([]);

  const [selectedFacture, setSelectedFacture] = useState<FactureType | null>(null);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid' | 'overpaid'>('all');

  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedFactureDetail, setSelectedFactureDetail] = useState<FactureType | null>(null);

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [printFormat, setPrintFormat] = useState<'A4' | 'A5' | 'A6' | 'A10' | 'Thermal'>('A4');
  const componentRef = useRef<HTMLDivElement>(null);

  // Fetch factures
  const { data: facturesData, isLoading, refetch, isError } = useQuery({
    queryKey: ['factures', slug],
    queryFn: () => factureService.getFactures(slug!).then((res) => res.data.donnee),
    enabled: !!slug,
  });

  useEffect(() => {
    if (facturesData) {
      setFactures(facturesData);
    }
  }, [facturesData]);

  // Calculations for global stats
  const stats = useMemo(() => {
    if (!factures.length) {
      return { total: 0, paid: 0, remaining: 0, toReturn: 0, count: 0, soldeCount: 0, encaisse: 0, overpaidCount: 0 };
    }
    const total = factures.reduce((acc, f) => acc + (Number(f.montant_total) || 0), 0);
    const paid = factures.reduce((acc, f) => acc + (Number(f.montant_paye) || 0), 0);
    const soldeCount = factures.filter((f) => f.est_solde).length;

    let overpaidCount = 0;
    const { remaining, toReturn } = factures.reduce(
      (acc, f) => {
        const diff = (Number(f.montant_total) || 0) - (Number(f.montant_paye) || 0);
        if (diff > 0) {
          acc.remaining += diff;
        } else if (diff < 0) {
          acc.toReturn += Math.abs(diff);
          overpaidCount += 1;
        }
        return acc;
      },
      { remaining: 0, toReturn: 0 }
    );
    const encaisse = paid - toReturn;

    return {
      total,
      paid,
      remaining,
      toReturn,
      count: factures.length,
      soldeCount,
      encaisse,
      overpaidCount,
    };
  }, [factures]);

  // Filter factures based on search term AND status filter
  const filteredFactures = useMemo(() => {
    return factures.filter((f) => {
      // 1. Status Filter
      if (statusFilter === 'unpaid' && f.est_solde) return false;
      if (statusFilter === 'paid' && !f.est_solde) return false;
      if (statusFilter === 'overpaid') {
        const diff = (Number(f.montant_total) || 0) - (Number(f.montant_paye) || 0);
        if (diff >= 0) return false;
      }

      // 2. Search Term Filter
      if (searchTerm) {
        const lowSearch = searchTerm.toLowerCase();
        const matchCode = f.code?.toLowerCase().includes(lowSearch);
        const matchClient = f.client_nom?.toLowerCase().includes(lowSearch);
        if (!matchCode && !matchClient) return false;
      }

      return true;
    });
  }, [factures, searchTerm, statusFilter]);

  const handlePaymentClick = (facture: FactureType) => {
    setSelectedFacture(facture);
    setPaymentAmount('');
    setOpenPaymentModal(true);
  };

  const handleViewDetails = async (uuid: string) => {
    try {
      const response = await factureService.getFacture(uuid);
      setSelectedFactureDetail(response.data.donnee);
      setOpenDetailModal(true);
    } catch {
      toast.error('Erreur lors du chargement des détails de la facture');
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedFacture || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Veuillez entrer un montant valide');
      return;
    }

    try {
      await factureService.payerFacture(selectedFacture.uuid!, amount);
      toast.success('Paiement enregistré avec succès');
      setOpenPaymentModal(false);
      refetch();
    } catch (error: any) {
      const message = error.response?.data?.message || "Erreur lors de l'enregistrement du paiement";
      toast.error(message);
    }
  };

  const handleDeleteFacture = async () => {
    if (!selectedFactureDetail) return;
    setIsDeleting(true);
    try {
      await factureService.deleteFacture(selectedFactureDetail.uuid!);
      toast.success('Facture supprimée avec succès');
      setOpenDeleteConfirm(false);
      setOpenDetailModal(false);
      refetch();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la suppression de la facture';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <Grid container spacing={2.5} mb={3}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid item xs={12} sm={6} md={2.4} key={i}>
              <Skeleton variant="rectangular" height={105} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="error" variant="h6" fontWeight="bold">
          Erreur lors du chargement des factures.
        </Typography>
        <Button onClick={() => refetch()} sx={{ mt: 2, borderRadius: 2 }} variant="outlined">
          Réessayer
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      {/* Header & Statistiques Cartes */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h5" fontWeight="800" sx={{ color: 'text.primary' }}>
            Factures & Recouvrement
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Suivi des ventes, gestion des créances et encaissements des règlements.
          </Typography>
        </Box>

        {/* Grille des KPI Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              onClick={() => setStatusFilter('all')}
              sx={{
                borderRadius: '16px',
                border: '1px solid',
                borderColor: statusFilter === 'all' ? 'primary.main' : 'divider',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)', borderColor: 'primary.main' },
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Ventes Totales
                  </Typography>
                  <ReceiptLong sx={{ color: 'primary.main', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight="800" sx={{ color: 'text.primary' }}>
                  {formatNumberWithSpaces(stats.total)} <Typography component="span" variant="caption">FCFA</Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.count} facture{stats.count > 1 ? 's' : ''} émise{stats.count > 1 ? 's' : ''}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              onClick={() => setStatusFilter('paid')}
              sx={{
                borderRadius: '16px',
                border: '1px solid',
                borderColor: statusFilter === 'paid' ? 'success.main' : 'divider',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)', borderColor: 'success.main' },
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Encaissé
                  </Typography>
                  <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#10b981' }}>
                  {formatNumberWithSpaces(stats.encaisse)} <Typography component="span" variant="caption">FCFA</Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.soldeCount} réglée{stats.soldeCount > 1 ? 's' : ''} à 100%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              onClick={() => setStatusFilter('unpaid')}
              sx={{
                borderRadius: '16px',
                border: '1px solid',
                borderColor: statusFilter === 'unpaid' ? 'warning.main' : 'divider',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)', borderColor: 'warning.main' },
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Reste à Recouvrer
                  </Typography>
                  <AccountBalanceWallet sx={{ color: 'warning.main', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#f59e0b' }}>
                  {formatNumberWithSpaces(stats.remaining)} <Typography component="span" variant="caption">FCFA</Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.count - stats.soldeCount} créance{stats.count - stats.soldeCount > 1 ? 's' : ''} active{stats.count - stats.soldeCount > 1 ? 's' : ''}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              onClick={() => setStatusFilter('overpaid')}
              sx={{
                borderRadius: '16px',
                border: '1px solid',
                borderColor: statusFilter === 'overpaid' ? 'info.main' : 'divider',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)', borderColor: 'info.main' },
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Trop-perçu (À rendre)
                  </Typography>
                  <AccountBalanceWallet sx={{ color: 'info.main', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#0ea5e9' }}>
                  {formatNumberWithSpaces(stats.toReturn)} <Typography component="span" variant="caption">FCFA</Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.overpaidCount} avoir / reliquat
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              sx={{
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    Taux de Règlement
                  </Typography>
                  <PendingActions sx={{ color: 'secondary.main', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight="800" sx={{ color: 'text.primary' }}>
                  {stats.count > 0 ? Math.round((stats.soldeCount / stats.count) * 100) : 0} %
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.soldeCount} sur {stats.count} factures
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Barre d'Action : Recherche + Filtres par statut */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '16px',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(14px)',
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        {/* Recherche */}
        <TextField
          size="small"
          placeholder="Rechercher par référence (FAC-...) ou client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            minWidth: { xs: '100%', md: 360 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
            },
          }}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
          }}
        />

        {/* Puces de filtrage par Statut */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`Toutes (${stats.count})`}
            clickable
            color={statusFilter === 'all' ? 'primary' : 'default'}
            variant={statusFilter === 'all' ? 'filled' : 'outlined'}
            onClick={() => setStatusFilter('all')}
            sx={{ fontWeight: 700, borderRadius: '10px' }}
          />
          <Chip
            label={`En attente (${stats.count - stats.soldeCount})`}
            clickable
            color={statusFilter === 'unpaid' ? 'warning' : 'default'}
            variant={statusFilter === 'unpaid' ? 'filled' : 'outlined'}
            onClick={() => setStatusFilter('unpaid')}
            sx={{ fontWeight: 700, borderRadius: '10px' }}
          />
          <Chip
            label={`Soldées (${stats.soldeCount})`}
            clickable
            color={statusFilter === 'paid' ? 'success' : 'default'}
            variant={statusFilter === 'paid' ? 'filled' : 'outlined'}
            onClick={() => setStatusFilter('paid')}
            sx={{ fontWeight: 700, borderRadius: '10px' }}
          />
          {stats.overpaidCount > 0 && (
            <Chip
              label={`Trop-perçu (${stats.overpaidCount})`}
              clickable
              color={statusFilter === 'overpaid' ? 'info' : 'default'}
              variant={statusFilter === 'overpaid' ? 'filled' : 'outlined'}
              onClick={() => setStatusFilter('overpaid')}
              sx={{ fontWeight: 700, borderRadius: '10px' }}
            />
          )}
        </Box>
      </Paper>

      {/* Tableau des Factures */}
      {filteredFactures.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            py: 8,
            textAlign: 'center',
            borderRadius: '20px',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.7)',
            border: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <SearchOff sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary" fontWeight="700">
            Aucune facture ne correspond à ces critères.
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            Modifiez votre terme de recherche ou sélectionnez un autre statut.
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '20px',
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Référence</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Client</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Total Net</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Remise</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Montant Payé</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Reste / Reliquat</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Statut</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', py: 2 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFactures.map((facture) => {
                const total = Number(facture.montant_total) || 0;
                const paye = Number(facture.montant_paye) || 0;
                const reste = total - paye;
                const isPaid = facture.est_solde;
                const isOverpaid = reste < 0;

                // Configuration visuelle par ligne
                const borderColor = isPaid ? '#10b981' : isOverpaid ? '#0ea5e9' : '#f59e0b';
                const rowBg = isPaid
                  ? 'transparent'
                  : isOverpaid
                  ? 'rgba(14, 165, 233, 0.03)'
                  : 'rgba(245, 158, 11, 0.04)';

                return (
                  <TableRow
                    key={facture.uuid}
                    sx={{
                      bgcolor: rowBg,
                      borderLeft: `4px solid ${borderColor}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: isPaid
                          ? 'rgba(16, 185, 129, 0.06)'
                          : isOverpaid
                          ? 'rgba(14, 165, 233, 0.08)'
                          : 'rgba(245, 158, 11, 0.08)',
                      },
                      '& td': {
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      },
                    }}
                  >
                    {/* Référence */}
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="700" sx={{ color: 'primary.main', fontFamily: 'monospace' }}>
                        {facture.code}
                      </Typography>
                    </TableCell>

                    {/* Client */}
                    <TableCell>
                      <Typography variant="body2" fontWeight="600" sx={{ color: 'text.primary' }}>
                        {facture.client_nom || 'Client Anonyme'}
                      </Typography>
                    </TableCell>

                    {/* Montant Total */}
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="700">
                        {formatNumberWithSpaces(total)} <Typography component="span" variant="caption">FCFA</Typography>
                      </Typography>
                    </TableCell>

                    {/* Remise */}
                    <TableCell align="right">
                      {facture.montant_remise && Number(facture.montant_remise) > 0 ? (
                        <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700 }}>
                          -{formatNumberWithSpaces(facture.montant_remise)} FCFA
                        </Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>-</Typography>
                      )}
                    </TableCell>

                    {/* Montant Payé */}
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="700" sx={{ color: '#10b981' }}>
                        {formatNumberWithSpaces(paye)} <Typography component="span" variant="caption">FCFA</Typography>
                      </Typography>
                    </TableCell>

                    {/* Reste / Reliquat */}
                    <TableCell align="right">
                      {isOverpaid ? (
                        <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <Typography variant="body2" fontWeight="800" sx={{ color: '#0ea5e9' }}>
                            {formatNumberWithSpaces(Math.abs(reste))} FCFA
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#0ea5e9', fontSize: '0.65rem', fontWeight: 700 }}>
                            À RENDRE
                          </Typography>
                        </Box>
                      ) : isPaid || reste === 0 ? (
                        <Typography variant="body2" fontWeight="600" sx={{ color: 'text.disabled' }}>
                          0 FCFA
                        </Typography>
                      ) : (
                        <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <Typography variant="body2" fontWeight="800" sx={{ color: '#f59e0b' }}>
                            {formatNumberWithSpaces(reste)} FCFA
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#f59e0b', fontSize: '0.65rem', fontWeight: 700 }}>
                            RESTE DÛ
                          </Typography>
                        </Box>
                      )}
                    </TableCell>

                    {/* Statut Badge */}
                    <TableCell align="center">
                      <Chip
                        icon={isPaid ? <CheckCircleOutline sx={{ fontSize: 16 }} /> : <PendingActions sx={{ fontSize: 16 }} />}
                        label={isPaid ? 'Soldé' : 'En attente'}
                        color={isPaid ? 'success' : 'warning'}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          boxShadow: isPaid ? 'none' : '0 0 8px rgba(245, 158, 11, 0.25)',
                        }}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.75} justifyContent="center">
                        <Tooltip title="Voir le détail et imprimer">
                          <IconButton
                            onClick={() => handleViewDetails(facture.uuid!)}
                            size="small"
                            sx={{
                              color: 'primary.main',
                              bgcolor: 'rgba(99, 102, 241, 0.1)',
                              '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' },
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {!isPaid && (
                          <Tooltip title="Encaisser un paiement">
                            <IconButton
                              onClick={() => handlePaymentClick(facture)}
                              size="small"
                              sx={{
                                color: '#10b981',
                                bgcolor: 'rgba(16, 185, 129, 0.1)',
                                '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.2)' },
                              }}
                            >
                              <Payment fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal d'Encaissement Intelligent */}
      <Modal open={openPaymentModal} onClose={() => setOpenPaymentModal(false)} closeAfterTransition>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '92%', sm: 460 },
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.98)' : '#ffffff',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
            p: 3.5,
            borderRadius: '24px',
            border: `1px solid ${theme.palette.divider}`,
            outline: 'none',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
            <Box>
              <Typography variant="h6" fontWeight="800">
                Encaisser un Paiement
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Facture : <Box component="span" fontWeight="700" color="primary.main">{selectedFacture?.code}</Box>
              </Typography>
            </Box>
            <IconButton onClick={() => setOpenPaymentModal(false)} size="small">
              <Close />
            </IconButton>
          </Stack>

          {/* Synthèse Reste à Payer */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 2.5,
              borderRadius: '16px',
              bgcolor: 'rgba(245, 158, 11, 0.05)',
              borderColor: 'rgba(245, 158, 11, 0.2)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Reste actuel à payer
            </Typography>
            <Typography variant="h5" fontWeight="900" sx={{ color: '#f59e0b', mt: 0.5 }}>
              {(() => {
                const reste = (selectedFacture?.montant_total || 0) - (selectedFacture?.montant_paye || 0);
                return `${formatNumberWithSpaces(Math.max(0, reste))} FCFA`;
              })()}
            </Typography>
          </Paper>

          {/* Saisie du montant avec projection en temps réel */}
          <TextField
            fullWidth
            label="Montant reçu du client"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            variant="outlined"
            autoFocus
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': { borderRadius: '14px' },
            }}
            InputProps={{
              endAdornment: <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>FCFA</Typography>,
            }}
          />

          {/* Calcul de la balance restante dynamique */}
          {paymentAmount && !isNaN(parseFloat(paymentAmount)) && (
            <Box
              sx={{
                mb: 3,
                p: 1.5,
                borderRadius: '12px',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Nouveau solde après validation :
              </Typography>
              {(() => {
                const currentRemaining = (selectedFacture?.montant_total || 0) - (selectedFacture?.montant_paye || 0);
                const afterPayment = currentRemaining - parseFloat(paymentAmount);
                if (afterPayment < 0) {
                  return (
                    <Typography variant="caption" fontWeight="800" sx={{ color: '#0ea5e9' }}>
                      Rendu monnaie : {formatNumberWithSpaces(Math.abs(afterPayment))} FCFA
                    </Typography>
                  );
                } else if (afterPayment === 0) {
                  return (
                    <Typography variant="caption" fontWeight="800" sx={{ color: '#10b981' }}>
                      Entièrement Soldé (0 FCFA)
                    </Typography>
                  );
                } else {
                  return (
                    <Typography variant="caption" fontWeight="800" sx={{ color: '#f59e0b' }}>
                      Reste dû : {formatNumberWithSpaces(afterPayment)} FCFA
                    </Typography>
                  );
                }
              })()}
            </Box>
          )}

          <Stack direction="row" spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOpenPaymentModal(false)}
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
            >
              Annuler
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handlePaymentSubmit}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #2563eb, #10b981)',
                boxShadow: '0 8px 20px rgba(37,99,235,0.3)',
              }}
            >
              Valider le Paiement
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Modal de Détails & Impression */}
      <Modal open={openDetailModal} onClose={() => setOpenDetailModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: 760 },
            maxHeight: '90vh',
            overflowY: 'auto',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.98)' : '#ffffff',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
            borderRadius: '24px',
            border: `1px solid ${theme.palette.divider}`,
            outline: 'none',
          }}
        >
          {/* Header sticky */}
          <Box
            sx={{
              p: 2.5,
              px: 3,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.95)' : '#ffffff',
              backdropFilter: 'blur(10px)',
              zIndex: 2,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight="800">
                Facture #{selectedFactureDetail?.code}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Client : <strong>{selectedFactureDetail?.client_nom || 'Client Anonyme'}</strong>
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Sélecteur de format d'impression */}
              <Box sx={{ display: 'flex', bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderRadius: '10px', p: 0.4 }}>
                {(['A4', 'Thermal'] as const).map((fmt) => (
                  <Button
                    key={fmt}
                    size="small"
                    variant={printFormat === fmt ? 'contained' : 'text'}
                    onClick={() => setPrintFormat(fmt)}
                    sx={{
                      minWidth: 'auto',
                      px: 1.2,
                      py: 0.3,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      textTransform: 'none',
                      ...(printFormat === fmt ? { boxShadow: 'none' } : { color: 'text.secondary' }),
                    }}
                  >
                    {fmt === 'Thermal' ? 'Ticket' : fmt}
                  </Button>
                ))}
              </Box>

              <ReactToPrint
                trigger={() => (
                  <Tooltip title="Imprimer la facture">
                    <IconButton
                      size="small"
                      sx={{
                        color: 'primary.main',
                        bgcolor: 'rgba(99, 102, 241, 0.1)',
                        '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' },
                      }}
                    >
                      <PrintIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                content={() => componentRef.current}
              />

              <Tooltip title="Supprimer cette facture">
                <IconButton
                  onClick={() => setOpenDeleteConfirm(true)}
                  size="small"
                  sx={{
                    color: 'error.main',
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>

              <IconButton onClick={() => setOpenDetailModal(false)} size="small">
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Contenu imprimable */}
          <Box ref={componentRef} className={`print-container format-${printFormat.toLowerCase()}`} sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Box sx={{ mb: 3, textAlign: 'center', display: 'none', '.print-container &': { display: 'block' } }}>
              <Typography variant="h5" fontWeight="bold">{selectedFactureDetail?.entreprise_nom || 'Facture'}</Typography>
              <Typography variant="body2">Facture N° : {selectedFactureDetail?.code}</Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Client</Typography>
                <Typography variant="body2" fontWeight="700">
                  {selectedFactureDetail?.client_nom || 'Client Anonyme'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Opérateur</Typography>
                <Typography variant="body2" fontWeight="700">
                  {selectedFactureDetail?.created_by_nom || 'Inconnu'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Date</Typography>
                <Typography variant="body2" fontWeight="700">
                  {selectedFactureDetail?.created_at && new Date(selectedFactureDetail.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Statut</Typography>
                <Box mt={0.5}>
                  <Chip
                    label={selectedFactureDetail?.est_solde ? 'Soldé' : 'Reste à payer'}
                    color={selectedFactureDetail?.est_solde ? 'success' : 'warning'}
                    size="small"
                    sx={{ fontWeight: 700, borderRadius: '6px' }}
                  />
                </Box>
              </Grid>
            </Grid>

            {/* Tableau des articles vendus */}
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptLong color="primary" fontSize="small" /> Articles vendus
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px', mb: 3 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Désignation</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Qté</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>P.U</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedFactureDetail?.sorties?.map((item, index) => (
                    <TableRow key={index} sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>{item.categorie_libelle} {item.libelle ? `(${item.libelle})` : ''}</TableCell>
                      <TableCell align="right">{item.qte} {item.unite === 'kilos' ? 'kg' : item.unite}</TableCell>
                      <TableCell align="right">{formatNumberWithSpaces(item.pu || 0)} FCFA</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatNumberWithSpaces((Number(item.qte) * Number(item.pu)) || 0)} FCFA
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Récapitulatif Financier */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '16px',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(99, 102, 241, 0.03)',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack spacing={1.2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Montant Brut</Typography>
                  <Typography variant="body2" fontWeight="700">
                    {formatNumberWithSpaces(selectedFactureDetail?.montant_total || 0)} FCFA
                  </Typography>
                </Box>

                {selectedFactureDetail?.montant_remise && Number(selectedFactureDetail.montant_remise) > 0 ? (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Remise Appliquée</Typography>
                    <Typography variant="body2" color="error.main" fontWeight="700">
                      -{formatNumberWithSpaces(selectedFactureDetail.montant_remise)} FCFA
                    </Typography>
                  </Box>
                ) : null}

                <Divider sx={{ my: 0.5 }} />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="800">Montant Net</Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="900">
                    {formatNumberWithSpaces(selectedFactureDetail?.montant_total || 0)} FCFA
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Total Encaissé</Typography>
                  <Typography variant="body2" color="success.main" fontWeight="700">
                    {formatNumberWithSpaces(selectedFactureDetail?.montant_paye || 0)} FCFA
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" fontWeight="800">Reste à Recouvrer</Typography>
                  <Typography variant="subtitle1" color="warning.main" fontWeight="900">
                    {(() => {
                      const reste = (selectedFactureDetail?.montant_total || 0) - (selectedFactureDetail?.montant_paye || 0);
                      return reste < 0
                        ? `Rendu ${formatNumberWithSpaces(Math.abs(reste))} FCFA`
                        : `${formatNumberWithSpaces(reste)} FCFA`;
                    })()}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Confirmation de Suppression */}
      <Modal open={openDeleteConfirm} onClose={() => !isDeleting && setOpenDeleteConfirm(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.98)' : '#ffffff',
            boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
            p: 3.5,
            borderRadius: '20px',
            border: `1px solid ${theme.palette.divider}`,
            outline: 'none',
            textAlign: 'center',
          }}
        >
          <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: 'error.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
            <Warning sx={{ fontSize: 32 }} />
          </Avatar>

          <Typography variant="h6" fontWeight="800" gutterBottom>
            Supprimer la facture ?
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Voulez-vous supprimer définitivement la facture <strong>{selectedFactureDetail?.code}</strong> ? Les quantités vendues seront réintégrées au stock.
          </Typography>

          <Stack direction="row" spacing={1.5}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOpenDeleteConfirm(false)}
              disabled={isDeleting}
              sx={{ borderRadius: '10px', textTransform: 'none' }}
            >
              Annuler
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={handleDeleteFacture}
              disabled={isDeleting}
              startIcon={!isDeleting && <Delete />}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
