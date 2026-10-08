import React from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { KpiCard } from '../../../_components/common';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import { useAppSettings } from '../../../themes/AppSettingsContext';

export interface SalesKpiData {
  revenue: number;
  revenueVariation?: number;
  salesCount: number;
  salesCountVariation?: number;
  averageBasket: number;
}

export interface ProfitabilityKpiData {
  grossMargin: number;
  marginRate: number;
  totalExpenses: number;
  expensesVariation?: number;
  netProfit: number;
}

export interface StockKpiData {
  stockValueVente: number;
  stockValueAchat: number;
  outOfStockCount: number;
  criticalStockCount: number;
  totalRefs: number;
}

interface DashboardKpisProps {
  sales: SalesKpiData;
  profitability?: ProfitabilityKpiData;
  stock: StockKpiData;
  userRole?: number;
  onFilterAlerts?: (type: 'all' | 'critical' | 'out_of_stock') => void;
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({
  sales,
  profitability,
  stock,
  userRole = 3,
  onFilterAlerts,
}) => {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const canViewFinancials = userRole === 1 || userRole === 2;

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      {/* ── Section Ventes ── */}
      <Box sx={{ mb: 2.5 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            color: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '&::before': {
              content: '""',
              width: 4,
              height: 14,
              bgcolor: '#6366f1',
              borderRadius: 4,
            },
          }}
        >
          Performance Commerciale (Ventes)
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <KpiCard
              title="Chiffre d’Affaires"
              value={`${formatNumberWithSpaces(sales.revenue)} F`}
              subtitle="Total des encaissements"
              icon={<PaymentsIcon />}
              accentColor="#6366f1"
              variation={sales.revenueVariation}
              variationLabel="vs période préc."
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <KpiCard
              title="Volume de Ventes"
              value={formatNumberWithSpaces(sales.salesCount)}
              subtitle="Transactions enregistrées"
              icon={<ShoppingBagIcon />}
              accentColor="#3b82f6"
              variation={sales.salesCountVariation}
              variationLabel="vs période préc."
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <KpiCard
              title="Panier Moyen"
              value={`${formatNumberWithSpaces(sales.averageBasket)} F`}
              subtitle="Montant moyen par vente"
              icon={<ReceiptIcon />}
              accentColor="#8b5cf6"
            />
          </Grid>
        </Grid>
      </Box>

      {/* ── Section Rentabilité & Dépenses (Propriétaire & Gérant uniquement) ── */}
      {canViewFinancials && profitability && (
        <Box sx={{ mb: 2.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              color: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
              mb: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&::before': {
                content: '""',
                width: 4,
                height: 14,
                bgcolor: '#10b981',
                borderRadius: 4,
              },
            }}
          >
            Rentabilité & Marges Nettes
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <KpiCard
                title="Marge Brute"
                value={`${formatNumberWithSpaces(profitability.grossMargin)} F`}
                subtitle={`Taux de marge : ${profitability.marginRate.toFixed(1)}%`}
                icon={<TrendingUpIcon />}
                accentColor="#10b981"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <KpiCard
                title="Total des Dépenses"
                value={`${formatNumberWithSpaces(profitability.totalExpenses)} F`}
                subtitle="Charges d'exploitation"
                icon={<AccountBalanceWalletIcon />}
                accentColor="#f43f5e"
                variation={profitability.expensesVariation}
                variationLabel="vs période préc."
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <KpiCard
                title="Bénéfice Net Réel"
                value={`${formatNumberWithSpaces(profitability.netProfit)} F`}
                subtitle={profitability.netProfit >= 0 ? 'Marge nette positive' : 'Déficit d’exploitation'}
                icon={<PriceCheckIcon />}
                accentColor={profitability.netProfit >= 0 ? '#10b981' : '#ef4444'}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ── Section Stock & Alertes ── */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            color: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '&::before': {
              content: '""',
              width: 4,
              height: 14,
              bgcolor: '#f59e0b',
              borderRadius: 4,
            },
          }}
        >
          État des Stocks & Disponibilité
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <KpiCard
              title="Valeur Marchande du Stock"
              value={`${formatNumberWithSpaces(stock.stockValueVente)} F`}
              subtitle={
                canViewFinancials
                  ? `Coût d’achat : ${formatNumberWithSpaces(stock.stockValueAchat)} F`
                  : `${stock.totalRefs} références au catalogue`
              }
              icon={<Inventory2Icon />}
              accentColor="#06b6d4"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <KpiCard
              title="Produits en Rupture"
              value={stock.outOfStockCount}
              subtitle="0 unité restante en rayon"
              icon={<ErrorOutlineIcon />}
              accentColor="#ef4444"
              onClick={() => onFilterAlerts?.('out_of_stock')}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <KpiCard
              title="Stock Critique (Alerte)"
              value={stock.criticalStockCount}
              subtitle="Quantité inférieure au seuil"
              icon={<WarningAmberIcon />}
              accentColor="#f59e0b"
              onClick={() => onFilterAlerts?.('critical')}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
