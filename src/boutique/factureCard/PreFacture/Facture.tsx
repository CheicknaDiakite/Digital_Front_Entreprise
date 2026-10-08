import { ChangeEvent, FormEvent, useRef, useState, useMemo } from 'react';
import ReactToPrint from 'react-to-print';
import Notes from '../component/Notes';
import Header from '../component/Header';
import toast from 'react-hot-toast';
import { uniqueId } from 'lodash';
import { useQueryClient } from '@tanstack/react-query';
import { useFetchEntreprise } from '../../../usePerso/fonction.user';
import { generateOrderNumber, formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import {
  Box,
  Button,
  Grid,
  Skeleton,
  Typography,
  Paper,
  TextField,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  useTheme,
  Alert,
} from '@mui/material';
import { useStoreUuid } from '../../../usePerso/store';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonIcon from '@mui/icons-material/Person';
import NumbersIcon from '@mui/icons-material/Numbers';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAppSettings } from '../../../themes/AppSettingsContext';
import { PageHeader } from '../../../_components/common';

type ItemType = {
  id: string;
  description: string;
  quantity: number;
  price: number;
  amount: number;
};

type TypeText = {
  clientName: string;
  clientAddress: string;
  clientCoordonne: string;
  invoiceDate: string;
  dueDate: string;
  notes: string;
  invoiceNumber: string;
  description: string;
  quantity: number;
  price: number;
};

export default function Facture() {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const uuid = useStoreUuid((state) => state.selectedId);
  const queryClient = useQueryClient();
  const { unEntreprise, isLoading, isError } = useFetchEntreprise(uuid);

  const [orderNumber, setOrderNumber] = useState<string>(() => generateOrderNumber());
  const [showPreviewMobile, setShowPreviewMobile] = useState(true);

  const [list, setList] = useState<Array<ItemType>>([]);

  const componentRef = useRef<HTMLDivElement>(null);

  const [texte, setNom] = useState<TypeText>({
    clientName: '',
    clientAddress: '',
    clientCoordonne: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: 'Devis valable 30 jours à compter de la date d\'émission. Modalités de règlement : Caisse / Virement.',
    invoiceNumber: '',
    description: '',
    quantity: 1,
    price: 0,
  });

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNom((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateNumber = () => {
    const newNum = generateOrderNumber();
    setOrderNumber(newNum);
    toast.success(`Nouveau numéro généré : ${newNum}`);
  };

  const handleAddItem = (e: FormEvent) => {
    e.preventDefault();

    if (!texte.description.trim()) {
      toast.error('Veuillez saisir une désignation pour l\'article');
      return;
    }
    if (!texte.quantity || texte.quantity <= 0) {
      toast.error('La quantité doit être supérieure à 0');
      return;
    }
    if (texte.price < 0) {
      toast.error('Le prix unitaire doit être positif');
      return;
    }

    const calculatedAmount = Number(texte.quantity) * Number(texte.price);
    const newItem: ItemType = {
      id: uniqueId('item_'),
      description: texte.description.trim(),
      quantity: Number(texte.quantity),
      price: Number(texte.price),
      amount: calculatedAmount,
    };

    setList((prev) => [...prev, newItem]);
    setNom((prev) => ({
      ...prev,
      description: '',
      quantity: 1,
      price: 0,
    }));
    toast.success('Article ajouté à la facture');
  };

  const handleRemoveItem = (id: string) => {
    setList((prev) => prev.filter((item) => item.id !== id));
    toast.success('Ligne supprimée');
  };

  const totalCalculated = useMemo(() => {
    return list.reduce((sum, item) => sum + item.amount, 0);
  }, [list]);

  // Clean phone for WhatsApp
  const cleanPhone = (phone?: string) => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  };

  const whatsAppShareUrl = useMemo(() => {
    const phone = cleanPhone(texte.invoiceNumber);
    const msg = `Bonjour ${texte.clientName || 'Cher client'}, voici votre devis / facture proforma N° ${orderNumber} d'un montant total de ${formatNumberWithSpaces(totalCalculated)} FCFA. Entreprise : ${unEntreprise?.nom || ''}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }, [texte.invoiceNumber, texte.clientName, orderNumber, totalCalculated, unEntreprise]);

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', p: 3, spaceY: 3 }}>
        <Skeleton variant="rounded" height={80} sx={{ borderRadius: '16px', mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rounded" height={450} sx={{ borderRadius: '16px' }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rounded" height={450} sx={{ borderRadius: '16px' }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
        <Alert severity="error" sx={{ borderRadius: '14px', mb: 2 }}>
          Impossible de charger les données de l'entreprise.
        </Alert>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => queryClient.invalidateQueries({ queryKey: ["entreprise", uuid] })}
          sx={{ borderRadius: '10px', textTransform: 'none' }}
        >
          Réessayer
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1600px', mx: 'auto', p: { xs: 1.5, sm: 3 }, spaceY: 3 }}>
      {/* En-tête */}
      <PageHeader
        title="Devis & Facture Proforma"
        subtitle="Établissez des devis professionnels et factures proforma avec calcul automatique et impression directe"
        actions={
          <Button
            variant="contained"
            startIcon={<NumbersIcon />}
            onClick={handleGenerateNumber}
            sx={{
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
            }}
          >
            Générer un numéro
          </Button>
        }
      />

      {/* Barre d'outils mobile */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'space-between', mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={showPreviewMobile ? <VisibilityOffIcon /> : <VisibilityIcon />}
          onClick={() => setShowPreviewMobile(!showPreviewMobile)}
          sx={{ borderRadius: '10px', textTransform: 'none' }}
        >
          {showPreviewMobile ? 'Masquer l\'aperçu A4' : 'Afficher l\'aperçu A4'}
        </Button>
      </Box>

      {/* Grille principale : Éditeur à gauche / Aperçu direct à droite */}
      <Grid container spacing={3}>
        {/* Colonne Gauche : Formulaire de création */}
        <Grid item xs={12} lg={6}>
          <Stack spacing={3}>
            {/* Carte 1 : Coordonnées du client & Date */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '18px',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(16px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ color: '#3b82f6' }} />
                Informations du Destinataire (Client)
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom du client / Société"
                    name="clientName"
                    placeholder="Ex: Société ABC SARL"
                    value={texte.clientName}
                    onChange={onChange}
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Téléphone du client"
                    name="invoiceNumber"
                    placeholder="Ex: +229 97 00 00 00"
                    value={texte.invoiceNumber}
                    onChange={onChange}
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date de la facture"
                    name="invoiceDate"
                    type="date"
                    value={texte.invoiceDate}
                    onChange={onChange}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Numéro de Devis / Proforma"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="Régénérer">
                          <IconButton size="small" onClick={handleGenerateNumber}>
                            <NumbersIcon fontSize="small" sx={{ color: '#3b82f6' }} />
                          </IconButton>
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Carte 2 : Ajout dynamique de lignes d'articles */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '18px',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(16px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon sx={{ color: '#10b981' }} />
                Lignes d'Articles & Prestations
              </Typography>

              {/* Formulaire ajout ligne */}
              <Box
                component="form"
                onSubmit={handleAddItem}
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: '14px',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0',
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      label="Désignation de l'article"
                      name="description"
                      placeholder="Ex: Ordinateur portable HP"
                      value={texte.description}
                      onChange={onChange}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={6} sm={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Qté"
                      name="quantity"
                      value={texte.quantity}
                      onChange={onChange}
                      size="small"
                      inputProps={{ min: 1 }}
                    />
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Prix unitaire"
                      name="price"
                      value={texte.price || ''}
                      onChange={onChange}
                      size="small"
                      placeholder="0"
                    />
                  </Grid>

                  <Grid item xs={12} sm={2}>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      startIcon={<AddCircleOutlineIcon />}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '10px',
                        fontWeight: 700,
                        height: '40px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      }}
                    >
                      Ajouter
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* Tableau des lignes ajoutées */}
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Désignation</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Qté</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>P.U (FCFA)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Total (FCFA)</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {list.length > 0 ? (
                      list.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell sx={{ fontWeight: 600 }}>{row.description}</TableCell>
                          <TableCell align="center">{row.quantity}</TableCell>
                          <TableCell align="right">{formatNumberWithSpaces(row.price)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#10b981' }}>
                            {formatNumberWithSpaces(row.amount)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="error" onClick={() => handleRemoveItem(row.id)}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#94a3b8' }}>
                          Aucun article ajouté pour le moment.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Total Récapitulatif */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 3,
                  pt: 2,
                  borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                }}
              >
                <Typography sx={{ fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b' }}>
                  Total Général ({list.length} articles) :
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                  {formatNumberWithSpaces(totalCalculated)} FCFA
                </Typography>
              </Box>
            </Paper>

            {/* Carte 3 : Notes et Conditions */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '18px',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(16px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <NoteAddIcon sx={{ color: '#f59e0b' }} />
                Modalités & Conditions Particulières
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={3}
                name="notes"
                value={texte.notes}
                onChange={onChange}
                placeholder="Ex: Modalités de livraison, validité du devis, coordonnées bancaires..."
                variant="outlined"
                size="small"
              />
            </Paper>
          </Stack>
        </Grid>

        {/* Colonne Droite : Prévisualisation A4 & Actions Export */}
        <Grid item xs={12} lg={6} sx={{ display: { xs: showPreviewMobile ? 'block' : 'none', md: 'block' } }}>
          <Box sx={{ position: { lg: 'sticky' }, top: 24, spaceY: 2 }}>
            {/* Barre d'actions d'impression */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: '16px',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="Format A4 Standard" color="primary" size="small" sx={{ fontWeight: 600 }} />
                <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                  Aperçu conforme pour impression
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {texte.invoiceNumber && (
                  <Button
                    component="a"
                    href={whatsAppShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    size="small"
                    startIcon={<WhatsAppIcon />}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '10px',
                      color: '#16a34a',
                      borderColor: '#16a34a',
                      fontWeight: 600,
                    }}
                  >
                    Partager WhatsApp
                  </Button>
                )}

                <ReactToPrint
                  trigger={() => (
                    <Tooltip title="Imprimer ou enregistrer au format PDF">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PrintIcon />}
                        sx={{
                          textTransform: 'none',
                          borderRadius: '10px',
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)',
                        }}
                      >
                        Imprimer / PDF
                      </Button>
                    </Tooltip>
                  )}
                  content={() => componentRef.current}
                />
              </Box>
            </Paper>

            {/* Feuille A4 Réelle */}
            <Paper
              elevation={4}
              sx={{
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              }}
            >
              <div
                ref={componentRef}
                style={{
                  padding: '32px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontFamily: 'Inter, Roboto, sans-serif',
                }}
              >
                {/* Header Devis */}
                <Header
                  nom={unEntreprise?.nom}
                  numeroFac={orderNumber}
                  email={unEntreprise?.email}
                  address={unEntreprise?.adresse}
                  numero={unEntreprise?.numero}
                  coordonne={unEntreprise?.coordonne}
                  clientName={texte.clientName || 'Nom du client'}
                  invoiceDate={texte.invoiceDate}
                  invoiceNumber={texte.invoiceNumber ? Number(cleanPhone(texte.invoiceNumber)) : undefined}
                />

                {/* Titre Proforma */}
                <Box sx={{ my: 3, p: 1.5, textAlign: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    FACTURE PROFORMA / DEVIS ESTIMATIF
                  </Typography>
                </Box>

                {/* Tableau Articles */}
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '8px', mb: 3 }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Désignation</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: '#334155' }}>Qté</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#334155' }}>Prix Unitaire</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#334155' }}>Montant (FCFA)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {list.length > 0 ? (
                        list.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell sx={{ color: '#0f172a', fontWeight: 500 }}>{item.description}</TableCell>
                            <TableCell align="center" sx={{ color: '#0f172a' }}>{item.quantity}</TableCell>
                            <TableCell align="right" sx={{ color: '#0f172a' }}>{formatNumberWithSpaces(item.price)}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>
                              {formatNumberWithSpaces(item.amount)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 3, color: '#94a3b8' }}>
                            Aucun article n'a été ajouté au devis.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Total A4 */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                  <Box
                    sx={{
                      width: '260px',
                      p: 2,
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      textAlign: 'right',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                      TOTAL NET À PAYER :
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', mt: 0.5 }}>
                      {formatNumberWithSpaces(totalCalculated)} FCFA
                    </Typography>
                  </Box>
                </Box>

                {/* Notes & Conditions */}
                <Notes notes={texte.notes} />
              </div>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
