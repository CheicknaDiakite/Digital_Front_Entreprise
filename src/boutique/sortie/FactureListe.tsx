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
  Card,
  CardContent,
  Avatar,
  useTheme,
  alpha
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
  Warning
} from '@mui/icons-material';
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useStoreUuid } from '../../usePerso/store';
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso';
import ReactToPrint from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import { useRef } from 'react';
import { StatCard } from '../../usePerso/useEntreprise';
import "../factureCard/print.css";

export default function FactureListe() {
  const theme = useTheme();
  const slug = useStoreUuid((state) => state.selectedId);
  const [factures, setFactures] = useState<FactureType[]>([]);

  const [selectedFacture, setSelectedFacture] = useState<FactureType | null>(null);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedFactureDetail, setSelectedFactureDetail] = useState<FactureType | null>(null);
  
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [printFormat, setPrintFormat] = useState<'A4' | 'A5' | 'A6' | 'A10' | 'Thermal'>('A4');
  const componentRef = useRef<HTMLDivElement>(null);

  // Fetch factures
  const { data: facturesData, isLoading, refetch, isError } = useQuery({
    queryKey: ['factures', slug],
    queryFn: () => factureService.getFactures(slug!).then(res => res.data.donnee),
    enabled: !!slug,
  });

  useEffect(() => {
    if (facturesData) {
      setFactures(facturesData);
    }
  }, [facturesData]);

  // Filter factures based on search term
  const filteredFactures = useMemo(() => {
    if (!searchTerm) return factures;
    const lowSearch = searchTerm.toLowerCase();
    return factures.filter(f =>
      f.code?.toLowerCase().includes(lowSearch) ||
      f.client_nom?.toLowerCase().includes(lowSearch)
    );
  }, [factures, searchTerm]);

  // Calculations for stats
  const stats = useMemo(() => {
    if (!filteredFactures.length) return { total: 0, paid: 0, remaining: 0, toReturn: 0, count: 0, soldeCount: 0, encaisse: 0 };
    const total = filteredFactures.reduce((acc, f) => acc + (Number(f.montant_total) || 0), 0);
    const paid = filteredFactures.reduce((acc, f) => acc + (Number(f.montant_paye) || 0), 0);
    const soldeCount = filteredFactures.filter(f => f.est_solde).length;

    // Calculer séparément le reste à recouvrer et le montant à rendre
    const { remaining, toReturn } = filteredFactures.reduce((acc, f) => {
      const diff = (Number(f.montant_total) || 0) - (Number(f.montant_paye) || 0);
      if (diff > 0) {
        acc.remaining += diff;
      } else if (diff < 0) {
        acc.toReturn += Math.abs(diff);
      }
      return acc;
    }, { remaining: 0, toReturn: 0 });
    const encaisse = paid - toReturn;
    return {
      total,
      paid,
      remaining,
      toReturn,
      count: filteredFactures.length,
      soldeCount,
      encaisse
    };
  }, [filteredFactures]);

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
    } catch (error) {
      toast.error("Erreur lors de la récupération des détails");
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedFacture || !paymentAmount) return;
    try {
      await factureService.payerFacture(selectedFacture.uuid!, parseFloat(paymentAmount));
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
      const message = error.response?.data?.message || "Erreur lors de la suppression de la facture";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Grid container spacing={3} mb={4}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography color="error" variant="h6">
          Erreur lors du chargement des factures.
        </Typography>
        <Button onClick={() => refetch()} sx={{ mt: 2 }} variant="outlined">Réessayer</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      {/* Header & Stats */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" className='text-gray-50' gutterBottom>
          Gestion des Factures
        </Typography>
        <Typography variant="body1" className='text-gray-100' mb={4}>
          Consultez et gérez les paiements de vos ventes à crédit.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={6} sm={6} md={2.4}>
            <StatCard
              title="Ventes Totales"
              value={`${formatNumberWithSpaces(stats.total)} FCFA`}
              icon={<ReceiptLong sx={{ color: theme.palette.primary.main }} />}
              // backgroundColor={alpha(theme.palette.primary.main, 0.05)}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={2.4}>
            <StatCard
              title="Montant Encaissé"
              value={`${formatNumberWithSpaces(stats.encaisse)} FCFA`}
              icon={<CheckCircle sx={{ color: theme.palette.success.main }} />}
              // backgroundColor={alpha(theme.palette.success.main, 0.05)}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={2.4}>
            <StatCard
              title="Reste à Recouvrer"
              value={`${formatNumberWithSpaces(stats.remaining)} FCFA`}
              icon={<AccountBalanceWallet sx={{ color: theme.palette.warning.main }} />}
              // backgroundColor={alpha(theme.palette.warning.main, 0.05)}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={2.4}>
            <StatCard
              title="Montant à Rendre"
              value={`${formatNumberWithSpaces(stats.toReturn)} FCFA`}
              icon={<AccountBalanceWallet sx={{ color: theme.palette.info.main }} />}
              // backgroundColor={alpha(theme.palette.info.main, 0.05)}
              description={stats.toReturn > 0 ? "Trop-perçu" : ""}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={2.4}>
            <StatCard
              title="Factures"
              value={`${stats.soldeCount}/${stats.count}`}
              icon={<PendingActions sx={{ color: theme.palette.secondary.main }} />}
              // backgroundColor={alpha(theme.palette.secondary.main, 0.05)}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par référence ou client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <Avatar sx={{ bgcolor: 'transparent', color: 'text.secondary', mr: 1, width: 32, height: 32 }}>
                <SearchOff sx={{ fontSize: 20 }} />
              </Avatar>
            ),
            sx: {
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              '& fieldset': { borderColor: alpha(theme.palette.divider, 0.5) },
              '&:hover fieldset': { borderColor: theme.palette.primary.main },
            }
          }}
        />
      </Box>

      {filteredFactures.length === 0 ? (
        <Paper sx={{
          py: 8,
          textAlign: 'center',
          borderRadius: 4,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          border: `1px dashed ${theme.palette.divider}`
        }}>
          <SearchOff sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Aucune facture trouvée.
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Les ventes avec remise différée apparaîtront ici.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Table stickyHeader>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Référence</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Remise</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Payé</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Reliquat</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFactures.map((facture) => {
                const reste = (facture.montant_total || 0) - (facture.montant_paye || 0);
                return (
                  <TableRow
                    key={facture.uuid}
                    sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.01) }, transition: 'background 0.2s' }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {facture.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{facture.client_nom || 'Client Anonyme'}</Typography>
                    </TableCell>
                    <TableCell>{formatNumberWithSpaces(facture.montant_total)} FCFA</TableCell>
                    <TableCell color="error.main">{formatNumberWithSpaces(facture.montant_remise)} FCFA</TableCell>
                    <TableCell sx={{ color: 'success.main', fontWeight: '500' }}>
                      {formatNumberWithSpaces(facture.montant_paye)} FCFA
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color={reste < 0 ? "info.main" : "warning.main"}>
                        {reste < 0
                          ? `rendue ${formatNumberWithSpaces(Math.abs(reste))}`
                          : formatNumberWithSpaces(reste)} FCFA
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={facture.est_solde ? "Soldé" : "En attente"}
                        color={facture.est_solde ? "success" : "warning"}
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          borderRadius: '6px',
                          bgcolor: facture.est_solde ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
                          color: facture.est_solde ? theme.palette.success.dark : theme.palette.warning.dark,
                          border: 'none'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Détails complets">
                          <IconButton
                            onClick={() => handleViewDetails(facture.uuid!)}
                            sx={{ color: 'info.main', bgcolor: alpha(theme.palette.info.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.15) } }}
                            size="small"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {!facture.est_solde && (
                          <Tooltip title="Enregistrer un paiement">
                            <IconButton
                              onClick={() => handlePaymentClick(facture)}
                              sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) } }}
                              size="small"
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

      {/* Modal de Paiement - Design Amélioré */}
      <Modal
        open={openPaymentModal}
        onClose={() => setOpenPaymentModal(false)}
        closeAfterTransition
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 450 },
          bgcolor: 'background.paper',
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          p: 4,
          borderRadius: 4,
          outline: 'none'
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h5" fontWeight="bold">Encaisser Paiement</Typography>
              <Typography variant="body2" color="text.secondary">Facture #{selectedFacture?.code}</Typography>
            </Box>
            <IconButton onClick={() => setOpenPaymentModal(false)} size="small">
              <Close />
            </IconButton>
          </Stack>

          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.warning.main, 0.03), borderColor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">Reste à payer actuel</Typography>
            <Typography variant="h5" fontWeight="bold" color="warning.dark">
              {(() => {
                const reste = (selectedFacture?.montant_total || 0) - (selectedFacture?.montant_paye || 0);
                return reste < 0
                  ? `rendue ${formatNumberWithSpaces(Math.abs(reste))} FCFA`
                  : `${formatNumberWithSpaces(reste)} FCFA`;
              })()}
            </Typography>
          </Paper>

          <TextField
            fullWidth
            label="Montant reçu"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            variant="filled"
            sx={{ mb: 4, '& .MuiFilledInput-root': { borderRadius: 2 } }}
            autoFocus
            InputProps={{
              endAdornment: <Typography variant="caption" sx={{ ml: 1, fontWeight: 'bold' }}>FCFA</Typography>
            }}
          />

          <Stack direction="row" spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOpenPaymentModal(false)}
              sx={{ borderRadius: 2, py: 1.2 }}
            >
              Annuler
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handlePaymentSubmit}
              disabled={!paymentAmount}
              sx={{ borderRadius: 2, py: 1.2, fontWeight: 'bold', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
            >
              Valider le paiement
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Modal de Détails - Design Amélioré */}
      <Modal
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: 750 },
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
          p: 0,
          borderRadius: 4,
          outline: 'none'
        }}>
          {/* Header */}
          <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, borderRadius: '16px 16px 0 0' }}>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Détails de la Vente
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Réf: <Box component="span" fontWeight="bold" color="primary.main"> {selectedFactureDetail?.code}</Box>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'grey.50', borderRadius: 2, p: 0.5, gap: 0.5, mr: 1 }}>
                {(['A4', 'Thermal'] as const).map((format) => (
                  <Button
                    key={format}
                    size="small"
                    variant={printFormat === format ? "contained" : "text"}
                    onClick={() => setPrintFormat(format)}
                    sx={{
                      minWidth: 'auto',
                      px: 1,
                      py: 0.2,
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      borderRadius: 1.5,
                      ...(printFormat === format ? {
                        boxShadow: 'none',
                        '&:hover': { boxShadow: 'none' }
                      } : {
                        color: 'text.secondary'
                      })
                    }}
                  >
                    {format === 'Thermal' ? 'Ticket' : format}
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
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
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
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) }
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton onClick={() => setOpenDetailModal(false)} size="small" sx={{ bgcolor: 'grey.100' }}>
                <Close fontSize="small" color='error' />
              </IconButton>
            </Box>
          </Box>

          <Box ref={componentRef} className={`print-container format-${printFormat.toLowerCase()}`} sx={{ p: 4, bgcolor: 'white' }}>
            <Box sx={{ mb: 4, textAlign: 'center', display: 'none', '.print-container &': { display: 'block' } }}>
              <Typography variant="h4" fontWeight="bold">{selectedFactureDetail?.entreprise_nom || 'Facture'}</Typography>
              {/* <Typography variant="body2">{selectedFactureDetail?.adresse_entreprise}</Typography> */}
              <Typography variant="body2">Facture: {selectedFactureDetail?.code}</Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Client</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedFactureDetail?.client_nom || 'Client Anonyme'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Vendeur</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedFactureDetail?.created_by_nom || 'Inconnu'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Date de vente</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedFactureDetail?.created_at && new Date(selectedFactureDetail.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Statut Paiement</Typography>
                <Box mt={0.5}>
                  <Chip
                    label={selectedFactureDetail?.est_solde ? "Paiement Soldé" : "Reste à payer"}
                    color={selectedFactureDetail?.est_solde ? "success" : "warning"}
                    size="small"
                    sx={{ fontWeight: 'bold', borderRadius: '4px' }}
                  />
                </Box>
              </Grid>
            </Grid>

            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptLong color="primary" fontSize="small" /> Articles vendus
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, mb: 4 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Article</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Qté</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Prix Unitaire</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedFactureDetail?.sorties?.map((item, index) => (
                    <TableRow key={index} sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>{item.categorie_libelle}</TableCell>
                      <TableCell align="right">{item.qte} {item.unite === "kilos" ? "" : item.unite}</TableCell>
                      <TableCell align="right">{formatNumberWithSpaces(item.pu || 0)} FCFA</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatNumberWithSpaces((Number(item.qte) * Number(item.pu)) || 0)} FCFA
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02), p: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
              <Stack spacing={1.5}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Montant Brut</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatNumberWithSpaces(selectedFactureDetail?.montant_total || 0)} FCFA
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Remise Appliquée</Typography>
                  <Typography variant="body1" color="error.main" fontWeight="bold">
                    -{formatNumberWithSpaces(selectedFactureDetail?.montant_remise || 0)} FCFA
                  </Typography>
                </Box>
                <Divider />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight="bold">Montant Final</Typography>
                  <Typography variant="h5" color="primary.main" fontWeight="900">
                    {formatNumberWithSpaces((selectedFactureDetail?.montant_total || 0))} FCFA
                  </Typography>
                </Box>

                <Box sx={{ mt: 2, pt: 2, borderTop: `2px dashed ${theme.palette.divider}` }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" fontWeight="medium">Total encaissé</Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      {formatNumberWithSpaces(selectedFactureDetail?.montant_paye || 0)} FCFA
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6" color="warning.dark" fontWeight="bold">Balance Restante</Typography>
                    <Typography variant="h6" color="warning.dark" fontWeight="900">
                      {(() => {
                        const reste = (selectedFactureDetail?.montant_total || 0) - (selectedFactureDetail?.montant_paye || 0);
                        return reste < 0
                          ? `rendue ${formatNumberWithSpaces(Math.abs(reste))} FCFA`
                          : `${formatNumberWithSpaces(reste)} FCFA`;
                      })()}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Box>

          <Box sx={{ px: 4, pb: 4 }}>
            <Button
              variant="contained"
              onClick={() => setOpenDetailModal(false)}
              fullWidth
              sx={{ mt: 2, py: 1.5, borderRadius: 3, fontWeight: 'bold' }}
            >
              Fermer le récapitulatif
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal de Confirmation de Suppression */}
      <Modal
        open={openDeleteConfirm}
        onClose={() => !isDeleting && setOpenDeleteConfirm(false)}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 },
          bgcolor: 'background.paper',
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          p: 4,
          borderRadius: 4,
          outline: 'none',
          textAlign: 'center'
        }}>
          <Avatar sx={{
            bgcolor: alpha(theme.palette.error.main, 0.1),
            color: 'error.main',
            width: 64,
            height: 64,
            margin: '0 auto 16px'
          }}>
            <Warning sx={{ fontSize: 32 }} />
          </Avatar>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Confirmer la suppression
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Êtes-vous sûr de vouloir supprimer la facture <Box component="span" fontWeight="bold">{selectedFactureDetail?.code}</Box> ?
            Cette action est irréversible et les stocks seront restaurés.
          </Typography>

          <Stack direction="row" spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setOpenDeleteConfirm(false)}
              disabled={isDeleting}
              sx={{ borderRadius: 2 }}
            >
              Annuler
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={handleDeleteFacture}
              disabled={isDeleting}
              startIcon={isDeleting ? null : <Delete />}
              sx={{ borderRadius: 2, fontWeight: 'bold' }}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
