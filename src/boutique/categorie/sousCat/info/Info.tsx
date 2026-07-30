import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RouteParams } from "../../../../typescript/DataType";
import { 
  Box, 
  Button,
  CircularProgress, 
  InputAdornment,
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TextField, 
  Typography,
  Tooltip,
  Fade,
  useTheme,
  useMediaQuery,
  IconButton,
  Chip,
  Pagination
} from "@mui/material";
import CardInfo from "./CardInfo";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';
import { useFetchSousCate, useInfoSousCate } from "../../../../usePerso/fonction.categorie";
import { formatNumberWithSpaces } from "../../../../usePerso/fonctionPerso";
import { useFetchUser } from "../../../../usePerso/fonction.user";
import { motion } from "framer-motion";
import '../mobile-souscat.css';

export default function Info() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const { uuid } = useParams<RouteParams>();
  const { unUser } = useFetchUser();
  const { unSousCate } = useFetchSousCate(uuid || '');
  const { infos, isLoading } = useInfoSousCate({ slug: uuid });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');
  const itemsPerPage = 25;

  // Filtrage par Recherche (Client ou Produit) et par Plage de Dates
  const filteredInfos = infos?.filter((item) => {
    // Filtre texte
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchClient = item.client?.toLowerCase().includes(q);
      const matchProduct = item.libelle?.toLowerCase().includes(q);
      if (!matchClient && !matchProduct) return false;
    }

    // Filtre date
    if (!item.date) return false;
    const itemDate = new Date(item.date).getTime();
    const startDate = selectedStartDate ? new Date(selectedStartDate).getTime() : null;
    const endDate = selectedEndDate ? new Date(selectedEndDate).getTime() : null;
    return (startDate === null || itemDate >= startDate) && (endDate === null || itemDate <= endDate);
  });

  const reversedInfos = filteredInfos?.slice().sort((a, b) => {
    if (a.id === undefined) return 1;
    if (b.id === undefined) return -1;
    return Number(b.id) - Number(a.id);
  });

  const totalPages = Math.ceil((reversedInfos?.length || 0) / itemsPerPage);
  const displayedInfos = reversedInfos?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const totalPrice = reversedInfos?.reduce((acc, row) => {
    return acc + ((row.qte !== undefined && row.pu !== undefined) ? row.qte * row.pu : 0);
  }, 0) || 0;

  const totalQte = reversedInfos?.reduce((acc, row) => {
    return acc + (row.qte !== undefined ? row.qte : 0);
  }, 0) || 0;

  const ent = infos?.filter(info => info.sortie !== undefined && info.sortie !== null)
    .flatMap(info => info.sortie);

  const sumQteStock = infos?.filter(info => info.libelle !== undefined)
    .reduce((sum, sor) => sum + (sor.qte || 0), 0) || 0;

  // Presets de date rapides
  const handleQuickDateFilter = (type: 'today' | '7days' | 'month') => {
    const today = new Date();
    const endDateStr = today.toISOString().split('T')[0];
    let startDate = new Date();

    if (type === 'today') {
      startDate = today;
    } else if (type === '7days') {
      startDate.setDate(today.getDate() - 7);
    } else if (type === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    setSelectedStartDate(startDateStr);
    setSelectedEndDate(endDateStr);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedStartDate('');
    setSelectedEndDate('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 2 }}>
        <CircularProgress size={48} thickness={4} sx={{ color: '#3b82f6' }} />
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Chargement des détails et statistiques...
        </Typography>
      </Box>
    );
  }

  if (!infos) return null;

  const hasActiveFilters = Boolean(selectedStartDate || selectedEndDate || searchQuery);

  return (
    <Box sx={{ minHeight: '100vh', pb: 6 }}>
      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
        
        {/* EN-TÊTE MODERNE */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 1.5 }}>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
              <div>
                <Typography 
                  variant="h4" 
                  className="text-gray-50"
                  sx={{ 
                    fontWeight: 800, 
                    // color: '#0f172a',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2
                  }}
                >
                  {unSousCate?.libelle || 'Nom du catégorie indisponible'}
                </Typography>
                <Typography 
                  variant="body2" 
                  className="text-gray-300"
                  sx={{ mt: 0.5, fontSize: { xs: '0.875rem', sm: '0.95rem' } }}
                >
                  Aperçu détaillé du stock disponible et des historiques de vente
                </Typography>
              </div>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} >
                <Chip 
                  icon={<ReceiptLongIcon sx={{ fontSize: '16px !important' }} />}
                  label={`${reversedInfos?.length || 0} Ventes enregistrées`}
                  variant="outlined"
                  className="text-gray-100"
                  sx={{ borderRadius: '8px', fontWeight: 600, borderColor: '#cbd5e1' }}
                />
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* CARTES KPIS & D'INFORMATIONS */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5, mb: 4 }}>
          {/* Carte 1: Chiffre d'Affaires et Ventes */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5, 
                borderRadius: '16px', 
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 24px -10px rgba(59, 130, 246, 0.3)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Total des ventes
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e3a8a', my: 0.5 }}>
                    {sumQteStock}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                    <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700 }}>
                      CA : {formatNumberWithSpaces(totalPrice)} F
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ bgcolor: '#ffffff', p: 1.25, borderRadius: '12px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)', color: '#2563eb' }}>
                  <ShoppingCartIcon />
                </Box>
              </Box>
            </Paper>
          </motion.div>

          {/* Carte 2: Quantité sélectionnée dans le filtre */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.15 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2.5, 
                borderRadius: '16px', 
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 24px -10px rgba(34, 197, 94, 0.3)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Quantité Vendue (Filtre)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#14532d', my: 0.5 }}>
                    {totalQte} <Typography component="span" variant="body2" sx={{ color: '#166534', fontWeight: 600 }}>unités</Typography>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#15803d', display: 'block', mt: 1 }}>
                    Montant total: {formatNumberWithSpaces(totalPrice)} F
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: '#ffffff', p: 1.25, borderRadius: '12px', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)', color: '#16a34a' }}>
                  <LocalAtmIcon />
                </Box>
              </Box>
            </Paper>
          </motion.div>

          {/* Stock restant et informations détaillées d'admin */}
          {ent?.map((p, index) => {
            if (p.qte !== 0) {
              return (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ duration: 0.3, delay: 0.2 + (index * 0.05) }}
                >
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2.5, 
                      borderRadius: '16px', 
                      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                      border: '1px solid rgba(168, 85, 247, 0.2)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 24px -10px rgba(168, 85, 247, 0.3)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ color: '#7e22ce', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Stock {p.libelle ? `(${p.libelle})` : 'restant'}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#581c87', my: 0.5 }}>
                          {p.qte}
                        </Typography>
                        
                        {unUser.role === 1 && (
                          <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed rgba(168, 85, 247, 0.3)', display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                            <Typography variant="caption" sx={{ color: '#6b21a8', fontWeight: 500 }}>
                              Prix d'achat: <strong>{formatNumberWithSpaces(p.pu_achat)} F</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 600 }}>
                              Valeur totale: <strong>{formatNumberWithSpaces(p.prix_total)} F</strong>
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ bgcolor: '#ffffff', p: 1.25, borderRadius: '12px', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.15)', color: '#9333ea' }}>
                        <InventoryIcon />
                      </Box>
                    </Box>
                  </Paper>
                </motion.div>
              );
            }
            return null;
          })}
        </Box>

        {/* RECHERCHE ET BARRE DE FILTRES */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 2.5, 
            mb: 3, 
            borderRadius: '16px', 
            // bgcolor: '#ffffff', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
              
              {/* Barre de Recherche */}
              <TextField
                placeholder="Rechercher par client ou produit..."
                size="small"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                sx={{ 
                  flexGrow: 1,
                  maxWidth: { md: 360 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    // bgcolor: '#f8fafc',
                    '& fieldset': { borderColor: '#cbd5e1' },
                    '&:hover fieldset': { borderColor: '#94a3b8' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <ClearIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {/* Filtres de Dates */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
                <TextField
                  label="Date de début"
                  type="date"
                  size="small"
                  value={selectedStartDate}
                  onChange={(e) => {
                    setSelectedStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      // bgcolor: '#f8fafc',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Date de fin"
                  type="date"
                  size="small"
                  value={selectedEndDate}
                  onChange={(e) => {
                    setSelectedEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      // bgcolor: '#f8fafc',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>

            {/* Presets rapides & Bouton de réinitialisation */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', pt: 1.5, borderTop: '1px solid #f1f5f9', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, mr: 0.5 }}>
                  Filtres rapides:
                </Typography>
                <Chip 
                  label="Aujourd'hui" 
                  size="small" 
                  onClick={() => handleQuickDateFilter('today')}
                  clickable
                  variant="outlined"
                  sx={{ borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, '&:hover': { bgcolor: '#eff6ff' } }}
                />
                <Chip 
                  label="7 derniers jours" 
                  size="small" 
                  onClick={() => handleQuickDateFilter('7days')}
                  clickable
                  variant="outlined"
                  sx={{ borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, '&:hover': { bgcolor: '#eff6ff' } }}
                />
                <Chip 
                  label="Ce mois" 
                  size="small" 
                  onClick={() => handleQuickDateFilter('month')}
                  clickable
                  variant="outlined"
                  sx={{ borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, '&:hover': { bgcolor: '#eff6ff' } }}
                />
              </Box>

              {hasActiveFilters && (
                <Button
                  size="small"
                  startIcon={<RestartAltIcon fontSize="small" />}
                  onClick={handleResetFilters}
                  sx={{ color: '#ef4444', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* TABLEAU DE DONNÉES ET TRANSACTION */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: '16px', 
            overflow: 'hidden', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            // bgcolor: '#ffffff'
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { py: 2, fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5 } }}>
                  <TableCell>Date</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Produit</TableCell>
                  <TableCell align="right">Quantité</TableCell>
                  <TableCell align="right">Prix Unitaire</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {displayedInfos && displayedInfos.length > 0 ? (
                  displayedInfos.map((row, index) => (
                    <CardInfo key={row.id || index} row={row} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <FilterAltIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
                        <Typography variant="h6" sx={{ color: '#475569', fontWeight: 600 }}>
                          Aucune donnée disponible
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8', maxWidth: 360 }}>
                          Aucune transaction ne correspond à vos critères de recherche ou filtres de date actuels.
                        </Typography>
                        {hasActiveFilters && (
                          <Button 
                            variant="outlined" 
                            size="small" 
                            startIcon={<RestartAltIcon />} 
                            onClick={handleResetFilters}
                            sx={{ mt: 1, borderRadius: '8px', textTransform: 'none' }}
                          >
                            Effacer les filtres
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )}

                {/* TOTAUX FINANCIERS */}
                {displayedInfos && displayedInfos.length > 0 && (
                  <TableRow sx={{ '& td': { py: 2, fontWeight: 700, borderColor: '#cbd5e1' } }}>
                    <TableCell colSpan={3} align="right" sx={{ fontSize: '0.9rem' }}>
                      TOTAL DE LA SÉLECTION :
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                        {totalQte}
                      </Typography>
                    </TableCell>
                    <TableCell />
                    <TableCell align="right">
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75, bgcolor: '#ffffff', px: 1.5, py: 0.75, borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#15803d' }}>
                          {formatNumberWithSpaces(totalPrice)} F
                        </Typography>
                        <LocalAtmIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', p: 2.5, borderTop: '1px solid #e2e8f0', bgcolor: '#ffffff', gap: 2 }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                Page <strong>{currentPage}</strong> sur <strong>{totalPages}</strong> ({reversedInfos?.length || 0} transactions au total)
              </Typography>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                shape="rounded"
                size={isMobile ? "small" : "medium"}
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: '8px',
                    fontWeight: 600
                  }
                }}
              />
            </Box>
          )}
        </Paper>

      </Box>
    </Box>
  );
}

