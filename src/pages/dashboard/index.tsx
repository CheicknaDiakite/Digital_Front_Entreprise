import { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Grid,
  Alert,
  useTheme,
  Button,
} from '@mui/material';
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  differenceInCalendarDays,
  getDay,
} from 'date-fns';
import { useAppSettings } from '../../themes/AppSettingsContext';
import { useStoreUuid } from '../../usePerso/store';
import {
  useFetchEntreprise,
  useFetchUser,
  useRestructionUsers,
  useSortieUserEntreprise,
} from '../../usePerso/fonction.user';
import {
  useGetAllEntre,
  useGetAllSortie,
  useGetAllDepense,
} from '../../usePerso/fonction.entre';
import {
  isAccessAllowed,
  isInDateRange,
} from '../../usePerso/fonctionPerso';

// Sub-components
import { DashboardQuickActions } from './components/DashboardQuickActions';
import { DashboardPeriodSelector } from './components/DashboardPeriodSelector';
import { DashboardKpis, SalesKpiData, ProfitabilityKpiData, StockKpiData } from './components/DashboardKpis';
import { DashboardTrendChart, MonthlyTrendPoint } from './components/DashboardTrendChart';
import { DashboardTopProducts, TopProductItem } from './components/DashboardTopProducts';
import { DashboardSalesDistribution, DistributionSlice } from './components/DashboardSalesDistribution';
import { DashboardDayOfWeekChart, DayOfWeekData } from './components/DashboardDayOfWeekChart';
import { DashboardStockAlertsTable } from './components/DashboardStockAlertsTable';
import { DashboardRecentSalesTable } from './components/DashboardRecentSalesTable';
import { DashboardExpensesCategory, ExpenseCategorySlice } from './components/DashboardExpensesCategory';
import { DashboardSellerPerformance, SellerPerformanceItem } from './components/DashboardSellerPerformance';

export default function DashboardDefault() {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  // ── Global Period State (Default: Ce mois-ci) ──
  const now = useMemo(() => new Date(), []);
  const defaultStart = useMemo(() => format(startOfMonth(now), 'yyyy-MM-dd'), [now]);
  const defaultEnd = useMemo(() => format(endOfMonth(now), 'yyyy-MM-dd'), [now]);

  const [startDate, setStartDate] = useState<string>(defaultStart);
  const [endDate, setEndDate] = useState<string>(defaultEnd);

  // ── Queries ──
  const { unUser, isLoading: isUserLoading } = useFetchUser();
  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise, isLoading: isEntrepriseLoading } = useFetchEntreprise(entreprise_uuid || '');

  const {
    sortiesEntreprise = [],
    isLoading: isSortiesLoading,
    refetch: refetchSorties,
  } = useGetAllSortie(entreprise_uuid || '');

  const {
    entresEntreprise = [],
    isLoading: isStockLoading,
    refetch: refetchStock,
  } = useGetAllEntre(entreprise_uuid || '');

  const {
    depensesEntreprise = [],
    isLoading: isDepensesLoading,
    refetch: refetchDepenses,
  } = useGetAllDepense(entreprise_uuid || '');

  const { sortiesUser } = useSortieUserEntreprise(entreprise_uuid || '');
  const { getRestruction } = useRestructionUsers();

  const userRole = unUser?.role ?? 3;
  const isOwner = userRole === 1;
  const isManager = userRole === 2;
  const canViewFinancials = isOwner || isManager;

  // ── Période Précédente (pour le calcul des variations %) ──
  const prevPeriod = useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.max(1, differenceInCalendarDays(end, start) + 1);

    const prevEnd = subDays(start, 1);
    const prevStart = subDays(prevEnd, diffDays - 1);
    return {
      startStr: format(prevStart, 'yyyy-MM-dd'),
      endStr: format(prevEnd, 'yyyy-MM-dd'),
    };
  }, [startDate, endDate]);

  // ── 1. Filtrage des Sorties et Ventes sur la période ──
  const filteredSorties = useMemo(() => {
    return sortiesEntreprise.filter((s) => {
      const d = s.date || (s as any).created_at;
      if (!startDate && !endDate) return true;
      return isInDateRange(d, startDate, endDate);
    });
  }, [sortiesEntreprise, startDate, endDate]);

  // Sorties sur la période précédente (pour comparaison)
  const prevSorties = useMemo(() => {
    if (!prevPeriod) return [];
    return sortiesEntreprise.filter((s) => {
      const d = s.date || (s as any).created_at;
      return isInDateRange(d, prevPeriod.startStr, prevPeriod.endStr);
    });
  }, [sortiesEntreprise, prevPeriod]);

  // ── 2. Filtrage des Dépenses sur la période ──
  const filteredDepenses = useMemo(() => {
    return depensesEntreprise.filter((dep) => {
      if (!startDate && !endDate) return true;
      return isInDateRange(dep.date, startDate, endDate);
    });
  }, [depensesEntreprise, startDate, endDate]);

  const prevDepenses = useMemo(() => {
    if (!prevPeriod) return [];
    return depensesEntreprise.filter((dep) => {
      return isInDateRange(dep.date, prevPeriod.startStr, prevPeriod.endStr);
    });
  }, [depensesEntreprise, prevPeriod]);

  // ── 3. Métriques Ventes (Sales KPIs) ──
  const salesMetrics: SalesKpiData = useMemo(() => {
    const currentRevenue = filteredSorties.reduce((sum, s) => {
      const total = s.prix_total ?? ((s.qte || 1) * (s.pu || 0));
      return sum + Number(total || 0);
    }, 0);

    const prevRevenue = prevSorties.reduce((sum, s) => {
      const total = s.prix_total ?? ((s.qte || 1) * (s.pu || 0));
      return sum + Number(total || 0);
    }, 0);

    const salesCount = filteredSorties.length;
    const prevSalesCount = prevSorties.length;

    const calcVar = (curr: number, prev: number) => {
      if (prev <= 0) return curr > 0 ? 100 : 0;
      return Number((((curr - prev) / prev) * 100).toFixed(1));
    };

    return {
      revenue: currentRevenue,
      revenueVariation: prevPeriod ? calcVar(currentRevenue, prevRevenue) : undefined,
      salesCount,
      salesCountVariation: prevPeriod ? calcVar(salesCount, prevSalesCount) : undefined,
      averageBasket: salesCount > 0 ? Math.round(currentRevenue / salesCount) : 0,
    };
  }, [filteredSorties, prevSorties, prevPeriod]);

  // ── 4. Métriques Rentabilité (Profitability KPIs) ──
  const profitabilityMetrics: ProfitabilityKpiData | undefined = useMemo(() => {
    if (!canViewFinancials) return undefined;

    // Coût d'achat total des marchandises vendues
    const costOfGoodsSold = filteredSorties.reduce((sum, s) => {
      const puAchat = s.pu_achat ?? 0;
      const qte = s.qte ?? 1;
      return sum + (Number(puAchat) * Number(qte));
    }, 0);

    const grossMargin = Math.max(0, salesMetrics.revenue - costOfGoodsSold);
    const marginRate = salesMetrics.revenue > 0 ? (grossMargin / salesMetrics.revenue) * 100 : 0;

    const currentExpenses = filteredDepenses.reduce((sum, d) => sum + Number(d.somme || 0), 0);
    const prevExpensesTotal = prevDepenses.reduce((sum, d) => sum + Number(d.somme || 0), 0);

    const calcVar = (curr: number, prev: number) => {
      if (prev <= 0) return curr > 0 ? 100 : 0;
      return Number((((curr - prev) / prev) * 100).toFixed(1));
    };

    const netProfit = grossMargin - currentExpenses;

    return {
      grossMargin,
      marginRate,
      totalExpenses: currentExpenses,
      expensesVariation: prevPeriod ? calcVar(currentExpenses, prevExpensesTotal) : undefined,
      netProfit,
    };
  }, [canViewFinancials, filteredSorties, salesMetrics.revenue, filteredDepenses, prevDepenses, prevPeriod]);

  // ── 5. Métriques Stock (Stock KPIs) ──
  const stockMetrics: StockKpiData = useMemo(() => {
    let stockValueVente = 0;
    let stockValueAchat = 0;
    let outOfStockCount = 0;
    let criticalStockCount = 0;

    entresEntreprise.forEach((e) => {
      const qte = e.qte || 0;
      const puVente = e.pu || 0;
      const puAchat = e.pu_achat || 0;
      const seuil = e.qte_critique ?? 5;

      stockValueVente += qte * puVente;
      stockValueAchat += qte * puAchat;

      if (qte <= 0) {
        outOfStockCount++;
      } else if (qte <= seuil) {
        criticalStockCount++;
      }
    });

    return {
      stockValueVente,
      stockValueAchat,
      outOfStockCount,
      criticalStockCount,
      totalRefs: entresEntreprise.length,
    };
  }, [entresEntreprise]);

  // ── 6. Tendance 12 mois chronologique (DashboardTrendChart) ──
  const monthlyTrendData: MonthlyTrendPoint[] = useMemo(() => {
    const months: MonthlyTrendPoint[] = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = subMonths(currentDate, i);
      const mKey = format(d, 'yyyy-MM');
      const label = format(d, 'MMM yy');

      // Ventes de ce mois
      const monthRevenue = sortiesEntreprise
        .filter((s) => {
          const dateStr = s.date || (s as any).created_at || '';
          return dateStr.startsWith(mKey);
        })
        .reduce((sum, s) => {
          const total = s.prix_total ?? ((s.qte || 1) * (s.pu || 0));
          return sum + Number(total || 0);
        }, 0);

      // Dépenses de ce mois
      const monthExpenses = depensesEntreprise
        .filter((dep) => dep.date && dep.date.startsWith(mKey))
        .reduce((sum, dep) => sum + Number(dep.somme || 0), 0);

      months.push({
        monthKey: mKey,
        label,
        revenue: monthRevenue,
        expenses: monthExpenses,
        netProfit: monthRevenue - monthExpenses,
      });
    }

    return months;
  }, [sortiesEntreprise, depensesEntreprise]);

  // ── 7. Top 10 Produits (DashboardTopProducts) ──
  const topProducts: TopProductItem[] = useMemo(() => {
    const productMap = new Map<string, TopProductItem>();

    filteredSorties.forEach((s) => {
      const name = s.libelle || 'Article';
      const qte = Number(s.qte || 1);
      const total = Number(s.prix_total ?? (qte * (s.pu || 0)));
      const categorie = s.categorie_libelle;

      if (productMap.has(name)) {
        const item = productMap.get(name)!;
        item.totalQte += qte;
        item.totalRevenue += total;
      } else {
        productMap.set(name, {
          libelle: name,
          categorie,
          totalQte: qte,
          totalRevenue: total,
        });
      }
    });

    return Array.from(productMap.values());
  }, [filteredSorties]);

  // ── 8. Répartition des Ventes (Paiements & Catégories) ──
  const { paymentDistribution, categoryDistribution } = useMemo(() => {
    const payMap = new Map<string, { value: number; count: number }>();
    const catMap = new Map<string, { value: number; count: number }>();

    filteredSorties.forEach((s) => {
      const total = Number(s.prix_total ?? ((s.qte || 1) * (s.pu || 0)));
      const mode = s.mode_paiement || 'Caisse';
      const cat = s.categorie_libelle || 'Divers';

      // Modes de paiement
      if (payMap.has(mode)) {
        const cur = payMap.get(mode)!;
        cur.value += total;
        cur.count += 1;
      } else {
        payMap.set(mode, { value: total, count: 1 });
      }

      // Catégories
      if (catMap.has(cat)) {
        const cur = catMap.get(cat)!;
        cur.value += total;
        cur.count += 1;
      } else {
        catMap.set(cat, { value: total, count: 1 });
      }
    });

    const paymentData: DistributionSlice[] = Array.from(payMap.entries()).map(([name, data]) => ({
      name,
      value: data.value,
      count: data.count,
    }));

    const categoryData: DistributionSlice[] = Array.from(catMap.entries()).map(([name, data]) => ({
      name,
      value: data.value,
      count: data.count,
    }));

    return { paymentDistribution: paymentData, categoryDistribution: categoryData };
  }, [filteredSorties]);

  // ── 9. Activité par Jour de Semaine (DashboardDayOfWeekChart) ──
  const dayOfWeekData: DayOfWeekData[] = useMemo(() => {
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    // Ordre français classique : Lundi (1) -> Dimanche (0)
    const orderedIndices = [1, 2, 3, 4, 5, 6, 0];

    const acc = [0, 1, 2, 3, 4, 5, 6].map((dayIdx) => ({
      dayName: dayNames[dayIdx],
      revenue: 0,
      count: 0,
    }));

    filteredSorties.forEach((s) => {
      const dateStr = s.date || (s as any).created_at;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return;
      const dayIdx = getDay(d);
      const total = Number(s.prix_total ?? ((s.qte || 1) * (s.pu || 0)));

      acc[dayIdx].revenue += total;
      acc[dayIdx].count += 1;
    });

    return orderedIndices.map((idx) => acc[idx]);
  }, [filteredSorties]);

  // ── 10. Répartition des Dépenses par Famille ──
  const expensesCategoryData: ExpenseCategorySlice[] = useMemo(() => {
    const catMap = new Map<string, { value: number; count: number }>();

    filteredDepenses.forEach((dep) => {
      const somme = Number(dep.somme || 0);
      let catName = 'Autre';
      const match = (dep.libelle || '').match(/^\[(.*?)\]/);
      if (match && match[1]) {
        catName = match[1];
      }

      if (catMap.has(catName)) {
        const cur = catMap.get(catName)!;
        cur.value += somme;
        cur.count += 1;
      } else {
        catMap.set(catName, { value: somme, count: 1 });
      }
    });

    return Array.from(catMap.entries()).map(([name, d]) => ({
      name,
      value: d.value,
      count: d.count,
    }));
  }, [filteredDepenses]);

  // ── 11. Performance par Vendeur ──
  const sellerPerformance: SellerPerformanceItem[] = useMemo(() => {
    if (!isOwner) return [];
    if (sortiesUser?.total_par_utilisateur && sortiesUser.total_par_utilisateur.length > 0) {
      return sortiesUser.total_par_utilisateur.map((u) => {
        const matchingSales = sortiesUser.total_nombre_vente?.find((v) => v.user_id === u.user_id);
        return {
          userId: u.user_id,
          username: u.username || 'Collaborateur',
          totalSales: matchingSales?.total || 0,
          totalRevenue: u.total_montant || 0,
        };
      });
    }

    // Fallback à partir des sorties filtrées
    const userMap = new Map<string, { sales: number; rev: number }>();
    filteredSorties.forEach((s) => {
      const username = s.username || (s as any).created_by || 'Vendeur';
      const total = Number(s.prix_total ?? ((s.qte || 1) * (s.pu || 0)));
      if (userMap.has(username)) {
        const cur = userMap.get(username)!;
        cur.sales += 1;
        cur.rev += total;
      } else {
        userMap.set(username, { sales: 1, rev: total });
      }
    });

    return Array.from(userMap.entries()).map(([username, d]) => ({
      username,
      totalSales: d.sales,
      totalRevenue: d.rev,
    }));
  }, [isOwner, sortiesUser, filteredSorties]);

  // ── Vérification restriction horaire ──
  if (getRestruction && !isAccessAllowed(getRestruction)) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert
          severity="warning"
          sx={{
            p: 3,
            bgcolor: 'rgba(234,179,8,0.1)',
            color: '#fde68a',
            border: '1px solid rgba(234,179,8,0.3)',
            borderRadius: '20px',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            Accès restreint en dehors des heures de service
          </Typography>
          <Typography variant="body1">
            Votre profil est soumis à une plage horaire autorisée : de {getRestruction.hour_start} à {getRestruction.hour_end}.
          </Typography>
        </Alert>
      </Container>
    );
  }

  // ── Chargement initial ──
  const isLoading = isUserLoading || isEntrepriseLoading || isSortiesLoading || isStockLoading || isDepensesLoading;

  if (isLoading && !unEntreprise) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <CircularProgress size={50} sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 6, pt: 1 }}>
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        {/* ── En-tête Principal & Bienvenue ── */}
        <Box
          sx={{
            p: { xs: 2.2, sm: 3 },
            mb: 3,
            borderRadius: '22px',
            bgcolor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.18)',
            boxShadow: isDark
              ? '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.15)'
              : '0 8px 28px rgba(99, 102, 241, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
              <Typography
                variant="caption"
                sx={{
                  bgcolor: isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.1)',
                  color: isDark ? '#c4b5fd' : '#4f46e5',
                  px: 1.2,
                  py: 0.3,
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  border: '1px solid rgba(99,102,241,0.25)',
                }}
              >
                {unEntreprise?.nom || 'Entreprise'} · {isOwner ? 'Propriétaire' : isManager ? 'Gérant' : 'Point de Vente (Vendeur)'}
              </Typography>
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.45rem', sm: '1.85rem', md: '2.1rem' },
                color: isDark ? '#ffffff' : '#0f172a',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              Tableau de Bord
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b', mt: 0.4, fontSize: { xs: '0.82rem', sm: '0.9rem' } }}
            >
              Vue globale des ventes, des niveaux de stock et de la rentabilité de votre établissement
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                refetchSorties();
                refetchStock();
                refetchDepenses();
              }}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                color: isDark ? '#ffffff' : '#334155',
                '&:hover': {
                  borderColor: '#6366f1',
                  bgcolor: 'rgba(99,102,241,0.1)',
                },
              }}
            >
              Actualiser
            </Button>
          </Box>
        </Box>

        {/* ── 1. Sélecteur de Période Global ── */}
        <DashboardPeriodSelector
          startDate={startDate}
          endDate={endDate}
          onChangeRange={(s, e) => {
            setStartDate(s);
            setEndDate(e);
          }}
        />

        {/* ── 2. Accès Rapides (4 Boutons Majeurs) ── */}
        <DashboardQuickActions
          userRole={userRole}
          isLicenceSimple={unEntreprise?.licence_type === 'Stock Simple'}
        />

        {/* ── 3. Bandes d'Indicateurs Clés (KPIs Ventes, Marge, Stock) ── */}
        <DashboardKpis
          sales={salesMetrics}
          profitability={profitabilityMetrics}
          stock={stockMetrics}
          userRole={userRole}
        />

        {/* ── 4. Graphiques Majeurs : Tendance 12 mois + Top 10 Produits ── */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} lg={8}>
            <DashboardTrendChart
              data={monthlyTrendData}
              canViewFinancials={canViewFinancials}
            />
          </Grid>
          <Grid item xs={12} lg={4}>
            <DashboardTopProducts products={topProducts} />
          </Grid>
        </Grid>

        {/* ── 5. Deuxième rangée : Répartition des Ventes + Jour de Semaine ── */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <DashboardSalesDistribution
              paymentData={paymentDistribution}
              categoryData={categoryDistribution}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DashboardDayOfWeekChart data={dayOfWeekData} />
          </Grid>
        </Grid>

        {/* ── 6. Troisième rangée (Dépenses par famille + Vendeurs si rôle autorisé) ── */}
        {canViewFinancials && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={isOwner ? 6 : 12}>
              <DashboardExpensesCategory data={expensesCategoryData} />
            </Grid>
            {isOwner && (
              <Grid item xs={12} md={6}>
                <DashboardSellerPerformance sellers={sellerPerformance} />
              </Grid>
            )}
          </Grid>
        )}

        {/* ── 7. Tableaux d'Action Directe (Alertes de Stock & Dernières Ventes) ── */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <DashboardStockAlertsTable stockItems={entresEntreprise} />
          </Grid>
          <Grid item xs={12} lg={6}>
            <DashboardRecentSalesTable sales={sortiesEntreprise} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
