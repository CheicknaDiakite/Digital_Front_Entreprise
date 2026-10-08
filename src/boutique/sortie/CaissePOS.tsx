import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
  Tooltip,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PrintIcon from '@mui/icons-material/Print';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CloseIcon from '@mui/icons-material/Close';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HistoryIcon from '@mui/icons-material/History';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAppSettings } from '../../themes/AppSettingsContext';
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso';
import { BASE } from '../../_services/caller.service';
import defaultProductImg from '../../../public/icon-192x192.png';
import BarcodeScanner from '../../_components/Input/BarcodeScanner';
import { RecupType, SortieType } from '../../typescript/DataType';
import { ClienType } from '../../typescript/UserType';

export interface CartItem {
  entre_id: string;
  libelle: string;
  categorie_libelle: string;
  pu: number;
  qte: number;
  unite: string;
  max_stock: number;
  is_prix?: boolean;
  image?: string;
  barcode_value?: string;
  ref?: string;
}

interface CaissePOSProps {
  products: RecupType[];
  clients: ClienType[];
  currentUser: any;
  entreprise: any;
  onSaleCompleted: (saleDetails: any) => void;
  onSubmitSale: (salesData: SortieType[]) => Promise<any>;
  onSwitchToHistory?: () => void;
  onNavigateToInvoice?: (details: any) => void;
}

export default function CaissePOS({
  products,
  clients,
  currentUser,
  entreprise,
  onSaleCompleted,
  onSubmitSale,
  onSwitchToHistory,
  onNavigateToInvoice,
}: CaissePOSProps) {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [scannerOpen, setScannerOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cart / Ticket
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClienType | null>(null);
  const [paymentMode, setPaymentMode] = useState<string>('Caisse');
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount');
  const [discountValue, setDiscountValue] = useState<string>('0');
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Receipt Modal State
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);

  // Focus search input on mount & keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0) {
          if (window.confirm('Voulez-vous vider le ticket en cours ?')) {
            clearCart();
          }
        }
      } else if (e.key === 'Enter' && e.ctrlKey && cart.length > 0 && !isSubmitting) {
        e.preventDefault();
        handleValidateSale();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, isSubmitting]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      const cat = p.categorie_libelle || 'Autres';
      set.add(cat);
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        (p.categorie_libelle || 'Autres').toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCategory) return false;
      if (!query) return true;

      const nameMatch = (p.libelle || '').toLowerCase().includes(query);
      const catMatch = (p.categorie_libelle || '').toLowerCase().includes(query);
      const refMatch = (p.ref || '').toLowerCase().includes(query);
      const barcodeMatch = (p.barcode_value || '').toLowerCase().includes(query);

      return nameMatch || catMatch || refMatch || barcodeMatch;
    });
  }, [products, selectedCategory, searchTerm]);

  // Cart Calculations
  const rawSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.pu * item.qte, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    const val = parseFloat(discountValue) || 0;
    if (val <= 0) return 0;
    if (discountType === 'percent') {
      return Math.round((rawSubtotal * Math.min(val, 100)) / 100);
    }
    return Math.min(val, rawSubtotal);
  }, [rawSubtotal, discountType, discountValue]);

  const netTotal = useMemo(() => {
    return Math.max(0, rawSubtotal - discountAmount);
  }, [rawSubtotal, discountAmount]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.qte, 0);
  }, [cart]);

  // Change Calculation
  const numericReceived = parseFloat(receivedAmount) || 0;
  const changeToReturn = numericReceived >= netTotal ? numericReceived - netTotal : 0;
  const remainingDue = numericReceived < netTotal && numericReceived > 0 ? netTotal - numericReceived : 0;

  // Add product to cart
  const addToCart = (product: RecupType) => {
    const stockAvailable = Number(product.qte || 0);
    if (stockAvailable <= 0) {
      toast.error(`Rupture de stock pour "${product.libelle || product.categorie_libelle}"`);
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.entre_id === product.uuid);
      if (existingIndex >= 0) {
        const currentQty = prev[existingIndex].qte;
        if (currentQty + 1 > stockAvailable) {
          toast.error(`Stock maximal atteint (${stockAvailable} ${product.unite || 'unités'})`);
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qte: currentQty + 1,
        };
        return updated;
      }

      const newItem: CartItem = {
        entre_id: product.uuid || '',
        libelle: product.libelle || 'Produit sans nom',
        categorie_libelle: product.categorie_libelle || 'Général',
        pu: Number(product.pu || 0),
        qte: 1,
        unite: product.unite || 'pièce',
        max_stock: stockAvailable,
        is_prix: product.is_prix !== undefined ? product.is_prix : true,
        image: typeof product.image === 'string' ? product.image : undefined,
        barcode_value: product.barcode_value,
        ref: product.ref,
      };
      return [...prev, newItem];
    });
  };

  // Stepper functions
  const updateQuantity = (entreId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(entreId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.entre_id === entreId) {
          if (newQty > item.max_stock) {
            toast.error(`Stock maximal : ${item.max_stock} ${item.unite}`);
            return { ...item, qte: item.max_stock };
          }
          return { ...item, qte: newQty };
        }
        return item;
      })
    );
  };

  const updatePrice = (entreId: string, newPrice: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.entre_id === entreId) {
          return { ...item, pu: Math.max(0, newPrice) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (entreId: string) => {
    setCart((prev) => prev.filter((item) => item.entre_id !== entreId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue('0');
    setReceivedAmount('');
    setSelectedClient(null);
  };

  // Barcode Scan Handler
  const handleBarcodeScanned = (code: string) => {
    const trimmed = (code || '').trim().toLowerCase();
    setScannerOpen(false);
    if (!trimmed) return;

    const found = products.find(
      (p) =>
        (p.barcode_value && p.barcode_value.trim().toLowerCase() === trimmed) ||
        (p.ref && p.ref.trim().toLowerCase() === trimmed)
    );

    if (found) {
      addToCart(found);
      toast.success(`Ajouté : ${found.libelle || found.categorie_libelle}`);
    } else {
      toast.error(`Aucun article trouvé pour le code "${code}"`);
    }
  };

  // Submit Sale
  const handleValidateSale = async () => {
    if (cart.length === 0) {
      toast.error('Le ticket est vide');
      return;
    }

    setIsSubmitting(true);
    try {
      const invoiceCode = `TCK-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload: SortieType[] = cart.map((item) => ({
        entre_id: item.entre_id,
        qte: item.qte,
        pu: item.pu,
        unite: item.unite,
        mode_paiement: paymentMode,
        client_id: selectedClient?.uuid || '',
        user_id: currentUser?.uuid || '',
      }));

      await onSubmitSale(payload);

      const receiptData = {
        invoiceCode,
        date: format(new Date(), 'dd/MM/yyyy HH:mm'),
        clientName: selectedClient ? `${selectedClient.nom}`.trim() : 'Client Comptoir',
        clientPhone: selectedClient?.numero || '',
        items: [...cart],
        subtotal: rawSubtotal,
        discount: discountAmount,
        netTotal,
        paymentMode,
        receivedAmount: numericReceived > 0 ? numericReceived : netTotal,
        changeToReturn: numericReceived >= netTotal ? changeToReturn : 0,
        cashier: currentUser?.first_name || currentUser?.username || 'Caisse',
      };

      setLastReceipt(receiptData);
      setReceiptOpen(true);
      onSaleCompleted(receiptData);
      clearCart();
      toast.success('Vente enregistrée avec succès !');
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l'enregistrement de la vente");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Print Receipt handler
  const handlePrintReceipt = () => {
    window.print();
  };

  // WhatsApp share
  const handleShareWhatsApp = () => {
    if (!lastReceipt) return;
    const phone = lastReceipt.clientPhone ? String(lastReceipt.clientPhone).replace(/[^0-9]/g, '') : '';
    let msg = `*TICKET DE CAISSE - ${entreprise?.nom || 'COMMERCE'}*\n`;
    msg += `Ticket : ${lastReceipt.invoiceCode}\n`;
    msg += `Date : ${lastReceipt.date}\n`;
    msg += `Client : ${lastReceipt.clientName}\n`;
    msg += `--------------------------------\n`;
    lastReceipt.items.forEach((it: CartItem) => {
      msg += `${it.libelle} x${it.qte} : ${formatNumberWithSpaces(it.pu * it.qte)} F CFA\n`;
    });
    msg += `--------------------------------\n`;
    if (lastReceipt.discount > 0) {
      msg += `Remise : -${formatNumberWithSpaces(lastReceipt.discount)} F CFA\n`;
    }
    msg += `*TOTAL NET : ${formatNumberWithSpaces(lastReceipt.netTotal)} F CFA*\n`;
    msg += `Paiement : ${lastReceipt.paymentMode}\n`;
    msg += `Merci pour votre visite !`;

    const encoded = encodeURIComponent(msg);
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const paymentMethods = [
    { value: 'Caisse', label: '💵 Espèces', color: '#10b981' },
    { value: 'Orange Money', label: '🟠 Orange Money', color: '#f97316' },
    { value: 'Wave', label: '🌊 Wave', color: '#0ea5e9' },
    { value: 'Moov', label: '🟣 Moov', color: '#8b5cf6' },
    { value: 'Sama Money', label: '🟡 Sama Money', color: '#eab308' },
    { value: 'Carte', label: '💳 Carte', color: '#6366f1' },
  ];

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      {/* ── Subheader Bar ── */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 2.5,
          p: 1.5,
          borderRadius: '16px',
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            }}
          >
            <PointOfSaleIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.2 }}>
              Caisse Enregistreuse (POS)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Mode encaissement rapide · Raccourcis : <kbd style={{ padding: '1px 5px', borderRadius: 4, background: isDark ? '#334155' : '#e2e8f0' }}>F2</kbd> Recherche · <kbd style={{ padding: '1px 5px', borderRadius: 4, background: isDark ? '#334155' : '#e2e8f0' }}>F4</kbd> Vider · <kbd style={{ padding: '1px 5px', borderRadius: 4, background: isDark ? '#334155' : '#e2e8f0' }}>Ctrl+Entrée</kbd> Valider
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          {onSwitchToHistory && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<HistoryIcon />}
              onClick={onSwitchToHistory}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              }}
            >
              Journal des ventes
            </Button>
          )}
        </Stack>
      </Box>

      {/* ── Main Split Layout ── */}
      <Grid container spacing={2.5}>
        {/* ── LEFT COLUMN: Catalog / Products Grid (~65%) ── */}
        <Grid item xs={12} lg={7.5}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '20px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: isDark ? 'rgba(30, 41, 59, 0.7)' : '#ffffff',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Search + Barcode Scanner Bar */}
            <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
              <TextField
                inputRef={searchInputRef}
                fullWidth
                size="small"
                placeholder="Rechercher par nom, référence ou code-barres... [F2]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
                  },
                }}
              />
              <Tooltip title="Scanner un code-barres par caméra">
                <Button
                  variant="outlined"
                  onClick={() => setScannerOpen(true)}
                  startIcon={<QrCode2Icon />}
                  sx={{
                    borderRadius: '12px',
                    px: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Scanner
                </Button>
              </Tooltip>
            </Stack>

            {/* Category Filter Chips */}
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                pb: 1.5,
                mb: 1.5,
                scrollbarWidth: 'thin',
                '&::-webkit-scrollbar': { height: 4 },
                '&::-webkit-scrollbar-thumb': { background: 'rgba(99,102,241,0.3)', borderRadius: 4 },
              }}
            >
              <Chip
                label={`Tous (${products.length})`}
                onClick={() => setSelectedCategory('all')}
                color={selectedCategory === 'all' ? 'primary' : 'default'}
                variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
                sx={{
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)' },
                }}
              />
              {categories.map((cat) => {
                const count = products.filter(
                  (p) => (p.categorie_libelle || 'Autres').toLowerCase() === cat.toLowerCase()
                ).length;
                const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <Chip
                    key={cat}
                    label={`${cat} (${count})`}
                    onClick={() => setSelectedCategory(cat)}
                    color={isSelected ? 'primary' : 'default'}
                    variant={isSelected ? 'filled' : 'outlined'}
                    sx={{
                      borderRadius: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': { transform: 'translateY(-1px)' },
                    }}
                  />
                );
              })}
            </Box>

            {/* Products Grid */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                maxHeight: { xs: 400, lg: 'calc(100vh - 280px)' },
                pr: 0.5,
              }}
            >
              {filteredProducts.length === 0 ? (
                <Box
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    color: 'text.secondary',
                    borderRadius: '16px',
                    border: '1px dashed',
                    borderColor: 'divider',
                    mt: 2,
                  }}
                >
                  <ReceiptLongIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Aucun produit disponible correspondant
                  </Typography>
                  <Typography variant="caption">
                    Vérifiez le filtre ou approvisionnez de nouveaux lots dans la section Stock.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={1.5}>
                  {filteredProducts.map((p) => {
                    const qte = Number(p.qte || 0);
                    const seuil = Number((p as any).seuil_critique || 5);
                    const isOutOfStock = qte <= 0;
                    const isLowStock = qte > 0 && qte <= seuil;
                    const imgUrl = p.image ? BASE(p.image) : defaultProductImg;
                    const inCartCount = cart.find((c) => c.entre_id === p.uuid)?.qte || 0;

                    return (
                      <Grid item xs={6} sm={4} md={3} key={p.uuid || p.id}>
                        <Card
                          onClick={() => addToCart(p)}
                          sx={{
                            p: 1.5,
                            borderRadius: '16px',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                            opacity: isOutOfStock ? 0.55 : 1,
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            background: isDark
                              ? inCartCount > 0
                                ? 'rgba(99, 102, 241, 0.15)'
                                : 'rgba(15, 23, 42, 0.6)'
                              : inCartCount > 0
                              ? 'rgba(99, 102, 241, 0.08)'
                              : '#ffffff',
                            border: '1px solid',
                            borderColor: inCartCount > 0
                              ? '#6366f1'
                              : isDark
                              ? 'rgba(255,255,255,0.06)'
                              : 'rgba(0,0,0,0.06)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: isOutOfStock ? 'none' : 'translateY(-3px)',
                              boxShadow: isOutOfStock
                                ? 'none'
                                : '0 8px 24px rgba(99,102,241,0.2)',
                              borderColor: isOutOfStock ? undefined : '#6366f1',
                            },
                          }}
                        >
                          {/* In-Cart Badge */}
                          {inCartCount > 0 && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: '#6366f1',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                zIndex: 2,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                              }}
                            >
                              {inCartCount}
                            </Box>
                          )}

                          {/* Image Thumbnail */}
                          <Box
                            sx={{
                              width: '100%',
                              height: 80,
                              borderRadius: '10px',
                              overflow: 'hidden',
                              bgcolor: isDark ? 'rgba(0,0,0,0.2)' : '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mb: 1.2,
                            }}
                          >
                            <img
                              src={imgUrl}
                              alt={p.libelle || ''}
                              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                            />
                          </Box>

                          {/* Product Details */}
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              lineHeight: 1.25,
                              mb: 0.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: '2.5em',
                            }}
                          >
                            {p.libelle || p.categorie_libelle}
                          </Typography>

                          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, fontSize: '0.72rem' }}>
                            {p.categorie_libelle || 'Général'}
                          </Typography>

                          <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                            {/* Stock Badge */}
                            <Chip
                              size="small"
                              label={
                                isOutOfStock
                                  ? 'Rupture'
                                  : isLowStock
                                  ? `${qte} ${p.unite || ''}`
                                  : `${qte} ${p.unite || ''}`
                              }
                              sx={{
                                height: 20,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                bgcolor: isOutOfStock
                                  ? 'rgba(239,68,68,0.15)'
                                  : isLowStock
                                  ? 'rgba(249,115,22,0.15)'
                                  : 'rgba(16,185,129,0.15)',
                                color: isOutOfStock
                                  ? '#ef4444'
                                  : isLowStock
                                  ? '#f97316'
                                  : '#10b981',
                              }}
                            />

                            {/* Price */}
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 800,
                                color: 'primary.main',
                                fontSize: '0.92rem',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {formatNumberWithSpaces(p.pu || 0)} F
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* ── RIGHT COLUMN: Ticket / Cart Register (~35%) ── */}
        <Grid item xs={12} lg={4.5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              background: isDark ? 'rgba(30, 41, 59, 0.85)' : '#ffffff',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              backdropFilter: 'blur(20px)',
              boxShadow: isDark
                ? '0 12px 32px rgba(0,0,0,0.3)'
                : '0 12px 32px rgba(99,102,241,0.08)',
            }}
          >
            {/* Ticket Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                mb: 2,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <ReceiptLongIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                  Ticket de Vente
                </Typography>
                <Chip
                  size="small"
                  label={`${totalItemsCount} art.`}
                  color="primary"
                  sx={{ height: 20, fontSize: '0.72rem', fontWeight: 800 }}
                />
              </Stack>
              {cart.length > 0 && (
                <Button
                  size="small"
                  color="error"
                  startIcon={<ClearAllIcon fontSize="small" />}
                  onClick={clearCart}
                  sx={{ textTransform: 'none', fontSize: '0.78rem', fontWeight: 600 }}
                >
                  Vider [F4]
                </Button>
              )}
            </Box>

            {/* Client Selection */}
            <Box sx={{ mb: 2 }}>
              <Autocomplete
                size="small"
                options={clients}
                getOptionLabel={(option) => `${option.nom} (${option.numero || 'S/N'})`}
                value={selectedClient}
                onChange={(_, val) => setSelectedClient(val)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Client Comptoir (ou rechercher...)"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <PersonOutlineIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        bgcolor: isDark ? 'rgba(15, 23, 42, 0.4)' : '#f8fafc',
                      },
                    }}
                  />
                )}
              />
            </Box>

            {/* Cart Items List */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                maxHeight: { xs: 260, lg: 320 },
                mb: 2,
                pr: 0.5,
              }}
            >
              {cart.length === 0 ? (
                <Box
                  sx={{
                    py: 5,
                    textAlign: 'center',
                    color: 'text.secondary',
                    borderRadius: '12px',
                    border: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Le panier est vide
                  </Typography>
                  <Typography variant="caption">
                    Cliquez sur un produit à gauche ou scannez un code-barres.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.2}>
                  {cart.map((item) => (
                    <Box
                      key={item.entre_id}
                      sx={{
                        p: 1.2,
                        borderRadius: '12px',
                        bgcolor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.8,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ pr: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                            {item.libelle}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {item.categorie_libelle} · max: {item.max_stock} {item.unite}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeFromCart(item.entre_id)}
                          sx={{ p: 0.5 }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* Line controls: Qty stepper + Unit price + Line total */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Stepper */}
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.entre_id, item.qte - 1)}
                            sx={{
                              width: 26,
                              height: 26,
                              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                            }}
                          >
                            <RemoveIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                          <input
                            type="number"
                            value={item.qte}
                            onChange={(e) => updateQuantity(item.entre_id, parseInt(e.target.value) || 0)}
                            style={{
                              width: '42px',
                              textAlign: 'center',
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              border: 'none',
                              background: 'transparent',
                              color: isDark ? '#fff' : '#000',
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.entre_id, item.qte + 1)}
                            disabled={item.qte >= item.max_stock}
                            sx={{
                              width: 26,
                              height: 26,
                              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                            }}
                          >
                            <AddIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Stack>

                        {/* Unit Price (Editable only if admin authorized manual price (!item.is_prix) or currentUser is Admin) */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {(!item.is_prix || currentUser?.role === 1) ? (
                            <TextField
                              size="small"
                              value={item.pu}
                              onChange={(e) => updatePrice(item.entre_id, parseFloat(e.target.value) || 0)}
                              type="number"
                              title={!item.is_prix ? "Prix de vente libre autorisé" : "Modification administrateur"}
                              sx={{
                                width: 80,
                                '& .MuiOutlinedInput-input': { p: '4px 6px', fontSize: '0.8rem', textAlign: 'right', fontWeight: 600 },
                              }}
                            />
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                              @{formatNumberWithSpaces(item.pu)} F
                            </Typography>
                          )}

                          <Typography variant="body2" sx={{ fontWeight: 800, minWidth: 65, textAlign: 'right' }}>
                            {formatNumberWithSpaces(item.pu * item.qte)} F
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <Divider sx={{ my: 1.5 }} />

            {/* Discount & Totals Section */}
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Sous-total ({totalItemsCount} art.)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formatNumberWithSpaces(rawSubtotal)} F CFA
                </Typography>
              </Box>

              {/* Discount Row */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Remise :
                  </Typography>
                  <Chip
                    size="small"
                    label="FCFA"
                    color={discountType === 'amount' ? 'primary' : 'default'}
                    onClick={() => setDiscountType('amount')}
                    sx={{ height: 20, fontSize: '0.68rem', cursor: 'pointer' }}
                  />
                  <Chip
                    size="small"
                    label="%"
                    color={discountType === 'percent' ? 'primary' : 'default'}
                    onClick={() => setDiscountType('percent')}
                    sx={{ height: 20, fontSize: '0.68rem', cursor: 'pointer' }}
                  />
                </Stack>
                <TextField
                  size="small"
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  sx={{
                    width: 90,
                    '& .MuiOutlinedInput-input': { p: '4px 8px', textAlign: 'right', fontSize: '0.85rem' },
                  }}
                />
              </Box>

              {/* Grand Total Net */}
              <Box
                sx={{
                  p: 1.8,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(79,70,229,0.08) 100%)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Net à payer
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    color: '#6366f1',
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: '1.45rem',
                  }}
                >
                  {formatNumberWithSpaces(netTotal)} <span style={{ fontSize: '0.85rem' }}>F CFA</span>
                </Typography>
              </Box>
            </Stack>

            {/* Payment Method Selector */}
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', mb: 1 }}>
              Mode de règlement
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.8, mb: 2 }}>
              {paymentMethods.map((method) => {
                const isSelected = paymentMode === method.value;
                return (
                  <Button
                    key={method.value}
                    size="small"
                    variant={isSelected ? 'contained' : 'outlined'}
                    onClick={() => setPaymentMode(method.value)}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      py: 0.8,
                      bgcolor: isSelected ? method.color : undefined,
                      borderColor: isSelected ? method.color : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      color: isSelected ? '#fff' : undefined,
                      '&:hover': {
                        bgcolor: isSelected ? method.color : undefined,
                      },
                    }}
                  >
                    {method.label}
                  </Button>
                );
              })}
            </Box>

            {/* Cash Calculator (Monnaie à rendre) */}
            {paymentMode === 'Caisse' && (
              <Box
                sx={{
                  p: 1.5,
                  mb: 2,
                  borderRadius: '12px',
                  bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.8 }}>
                  Montant reçu du client :
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="0"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">F CFA</InputAdornment>,
                  }}
                  sx={{
                    mb: 1,
                    '& .MuiOutlinedInput-input': { fontWeight: 800, fontSize: '1rem', color: '#10b981' },
                  }}
                />

                {/* Quick amount shortcuts */}
                <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mb: 1 }}>
                  <Chip
                    size="small"
                    label="Exact"
                    onClick={() => setReceivedAmount(String(netTotal))}
                    sx={{ cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}
                  />
                  {[1000, 2000, 5000, 10000, 20000].map((val) => {
                    if (val >= netTotal && val <= netTotal * 3) {
                      return (
                        <Chip
                          key={val}
                          size="small"
                          label={`${formatNumberWithSpaces(val)} F`}
                          onClick={() => setReceivedAmount(String(val))}
                          sx={{ cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}
                        />
                      );
                    }
                    return null;
                  })}
                </Box>

                {/* Change display */}
                {numericReceived >= netTotal && numericReceived > 0 && (
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: '8px',
                      bgcolor: 'rgba(16,185,129,0.15)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>
                      Monnaie à rendre :
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#10b981' }}>
                      {formatNumberWithSpaces(changeToReturn)} F CFA
                    </Typography>
                  </Box>
                )}

                {remainingDue > 0 && (
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: '8px',
                      bgcolor: 'rgba(239,68,68,0.12)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#ef4444' }}>
                      Reste à percevoir :
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#ef4444' }}>
                      {formatNumberWithSpaces(remainingDue)} F CFA
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Validation Action Button */}
            <Button
              fullWidth
              size="large"
              variant="contained"
              disabled={cart.length === 0 || isSubmitting}
              onClick={handleValidateSale}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutlineIcon />}
              sx={{
                py: 1.6,
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '1rem',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {isSubmitting
                ? 'Enregistrement...'
                : `Valider la vente (${formatNumberWithSpaces(netTotal)} F)`}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Camera Scanner Modal ── */}
      <Dialog open={scannerOpen} onClose={() => setScannerOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Scanner le code-barres</span>
          <IconButton onClick={() => setScannerOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, textAlign: 'center' }}>
          <BarcodeScanner onScan={handleBarcodeScanned} />
        </DialogContent>
      </Dialog>

      {/* ── Thermal Receipt / Post-Sale Modal ── */}
      <Dialog
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            bgcolor: isDark ? '#0f172a' : '#ffffff',
            backgroundImage: 'none',
          },
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          {/* Printable Ticket Area */}
          <Box
            id="thermal-receipt-print"
            sx={{
              fontFamily: '"Courier New", Courier, monospace',
              bgcolor: isDark ? '#1e293b' : '#f8fafc',
              p: 2.5,
              borderRadius: '12px',
              border: '1px dashed',
              borderColor: 'divider',
              mb: 2.5,
              color: isDark ? '#f1f5f9' : '#0f172a',
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: 1 }}>
                {entreprise?.nom || 'GESTION STOCK'}
              </Typography>
              <Typography sx={{ fontSize: '0.78rem' }}>
                {entreprise?.adresse || 'Commerce & Vente'}
              </Typography>
              <Typography sx={{ fontSize: '0.78rem' }}>
                Tél : {entreprise?.telephone || 'N/A'}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', mt: 1, borderTop: '1px dashed #cbd5e1', pt: 0.5 }}>
                TICKET : {lastReceipt?.invoiceCode}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem' }}>
                {lastReceipt?.date}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem' }}>
                Client : {lastReceipt?.clientName}
              </Typography>
            </Box>

            <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

            {/* Items */}
            <Box sx={{ my: 1.5 }}>
              {lastReceipt?.items?.map((it: CartItem, idx: number) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', mb: 0.5 }}>
                  <Box sx={{ maxWidth: '65%' }}>
                    <div>{it.libelle}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {it.qte} x {formatNumberWithSpaces(it.pu)} F
                    </div>
                  </Box>
                  <Box sx={{ fontWeight: 700 }}>
                    {formatNumberWithSpaces(it.pu * it.qte)} F
                  </Box>
                </Box>
              ))}
            </Box>

            <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

            {/* Totals */}
            <Box sx={{ fontSize: '0.82rem', mt: 1 }}>
              {lastReceipt?.discount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <span>Remise :</span>
                  <span>-{formatNumberWithSpaces(lastReceipt.discount)} F</span>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.95rem', my: 0.5 }}>
                <span>TOTAL NET :</span>
                <span>{formatNumberWithSpaces(lastReceipt?.netTotal)} F CFA</span>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span>Règlement :</span>
                <span>{lastReceipt?.paymentMode}</span>
              </Box>
              {lastReceipt?.changeToReturn > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span>Monnaie rendue :</span>
                  <span>{formatNumberWithSpaces(lastReceipt.changeToReturn)} F CFA</span>
                </Box>
              )}
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2, pt: 1, borderTop: '1px dashed #cbd5e1', fontSize: '0.75rem' }}>
              Merci pour votre fidélité !<br />
              À très bientôt.
            </Box>
          </Box>

          {/* Action buttons */}
          <Stack spacing={1}>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrintReceipt}
              fullWidth
              sx={{
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              }}
            >
              Imprimer le ticket (80mm)
            </Button>

            <Button
              variant="outlined"
              color="success"
              startIcon={<WhatsAppIcon />}
              onClick={handleShareWhatsApp}
              fullWidth
              sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none' }}
            >
              Envoyer sur WhatsApp
            </Button>

            {onNavigateToInvoice && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  setReceiptOpen(false);
                  onNavigateToInvoice(lastReceipt);
                }}
                fullWidth
                sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none' }}
              >
                Générer Facture A4
              </Button>
            )}

            <Button
              variant="text"
              onClick={() => setReceiptOpen(false)}
              fullWidth
              sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
            >
              Nouvelle vente
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
