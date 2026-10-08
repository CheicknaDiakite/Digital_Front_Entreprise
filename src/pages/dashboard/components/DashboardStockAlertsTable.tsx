import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  Button,
  useTheme,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useNavigate } from 'react-router-dom';
import { RecupType } from '../../../typescript/DataType';
import { BASE } from '../../../_services/caller.service';
import defaultProductImg from '../../../../public/icon-192x192.png';
import { useAppSettings } from '../../../themes/AppSettingsContext';

interface DashboardStockAlertsTableProps {
  stockItems: RecupType[];
}

export const DashboardStockAlertsTable: React.FC<DashboardStockAlertsTableProps> = ({ stockItems }) => {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState<'all' | 'out_of_stock' | 'critical'>('all');

  // Identifier les ruptures (qte <= 0) et critiques (0 < qte <= seuil)
  const alerts = stockItems
    .map((item) => {
      const qte = item.qte || 0;
      const seuil = item.qte_critique ?? 5;
      const isOutOfStock = qte <= 0;
      const isCritical = qte > 0 && qte <= seuil;
      return { item, qte, seuil, isOutOfStock, isCritical };
    })
    .filter((a) => a.isOutOfStock || a.isCritical);

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === 'out_of_stock') return a.isOutOfStock;
    if (filterType === 'critical') return a.isCritical;
    return true;
  });

  const outOfStockCount = alerts.filter((a) => a.isOutOfStock).length;
  const criticalCount = alerts.filter((a) => a.isCritical).length;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: '20px',
        bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px)',
        border: '1px solid',
        borderColor: isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.18)',
        boxShadow: isDark
          ? '0 8px 30px rgba(0, 0, 0, 0.35)'
          : '0 4px 20px rgba(239, 68, 68, 0.06)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header & Tabs */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          pb: 1.5,
          mb: 1.5,
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.8)',
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.05rem', sm: '1.15rem' },
              color: isDark ? '#ffffff' : '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&::before': {
                content: '""',
                width: 4,
                height: 18,
                bgcolor: '#ef4444',
                borderRadius: 4,
              },
            }}
          >
            Alertes de Réapprovisionnement ({alerts.length})
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.65)' : '#64748b' }}>
            Produits nécessitant une commande immédiate
          </Typography>
        </Box>

        <Tabs
          value={filterType}
          onChange={(_, val) => setFilterType(val)}
          sx={{
            minHeight: 36,
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(241,245,249,0.9)',
            borderRadius: '12px',
            p: 0.4,
            '& .MuiTabs-indicator': {
              bgcolor: '#ef4444',
              borderRadius: '8px',
              height: '100%',
              zIndex: 0,
            },
            '& .MuiTab-root': {
              minHeight: 32,
              py: 0.5,
              px: 1.5,
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'none',
              zIndex: 1,
              color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b',
              '&.Mui-selected': {
                color: '#ffffff',
              },
            },
          }}
        >
          <Tab label={`Tous (${alerts.length})`} value="all" />
          <Tab label={`Ruptures (${outOfStockCount})`} value="out_of_stock" />
          <Tab label={`Critiques (${criticalCount})`} value="critical" />
        </Tabs>
      </Box>

      {/* Table Content */}
      {filteredAlerts.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center', my: 'auto' }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 52, color: '#10b981', mb: 1.5 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a' }}>
            Stock Optimal
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b' }}>
            Aucun article ne nécessite d'approvisionnement urgent dans cette catégorie.
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 340 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, bgcolor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#ffffff' : '#334155' }}>Produit</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, bgcolor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#ffffff' : '#334155' }}>Stock Restant</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, bgcolor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#ffffff' : '#334155' }}>Statut</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, bgcolor: isDark ? '#0f172a' : '#f8fafc', color: isDark ? '#ffffff' : '#334155' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAlerts.slice(0, 10).map(({ item, qte, seuil, isOutOfStock }, idx) => {
                const imgUrl = item.image ? BASE(item.image as string) : defaultProductImg;

                return (
                  <TableRow
                    key={idx}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      bgcolor: isOutOfStock
                        ? isDark ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.03)'
                        : undefined,
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={imgUrl}
                          variant="rounded"
                          sx={{ width: 34, height: 34, borderRadius: '8px' }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a' }}>
                            {item.libelle || 'Produit sans nom'}
                          </Typography>
                          <Typography variant="caption" noWrap sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>
                            {item.categorie_libelle || 'Général'} · Seuil: {seuil} {item.unite || 'pcs'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          color: isOutOfStock ? '#ef4444' : '#f59e0b',
                        }}
                      >
                        {qte} {item.unite || 'pcs'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        icon={isOutOfStock ? <ErrorOutlineIcon fontSize="small" /> : <WarningAmberIcon fontSize="small" />}
                        label={isOutOfStock ? 'Rupture' : 'Critique'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          bgcolor: isOutOfStock ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                          color: isOutOfStock ? '#ef4444' : '#f59e0b',
                          border: `1px solid ${isOutOfStock ? '#ef444440' : '#f59e0b40'}`,
                        }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddShoppingCartIcon />}
                        onClick={() => navigate('/entre')}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderRadius: '8px',
                          borderColor: '#6366f1',
                          color: '#6366f1',
                          py: 0.3,
                          px: 1.2,
                          '&:hover': {
                            bgcolor: '#6366f1',
                            color: '#ffffff',
                          },
                        }}
                      >
                        Approvisionner
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};
