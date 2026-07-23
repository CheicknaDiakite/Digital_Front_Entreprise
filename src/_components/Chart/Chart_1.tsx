import { useStockEntreprise } from '../../usePerso/fonction.user';
import { useStoreUuid } from '../../usePerso/store';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  useTheme,
  CircularProgress,
  Alert,
  useMediaQuery,
  Stack
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SimpleCharts() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const uuid = useStoreUuid((state) => state.selectedId);
  const { stockEntreprise, isLoading, isError } = useStockEntreprise(uuid || '');

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Stack sx={{ width: '100%' }} spacing={2}>
        <Alert severity="error">Problème de connexion !</Alert>
      </Stack>
    );
  }

  if (stockEntreprise?.details_sortie_par_mois) {
    const monthlyData = stockEntreprise.details_sortie_par_mois as unknown as Record<string, { somme_qte: number; somme_prix_total: string; }>;
    const chartData = Object.entries(monthlyData).map(([month, data]) => ({
      month: new Date(month).toLocaleString('default', { month: 'short', year: '2-digit' }),
      value: data.somme_qte || 0,
    }));

    // Trier les données par date réelle
    chartData.sort((a, b) => {
      // On retransforme en date complète pour trier
      const monthNames = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
      const parseMonth = (m: string) => {
        const [mois, annee] = m.split(' ');
        const monthIndex = monthNames.indexOf(mois);
        return new Date(2000 + parseInt(annee, 10), monthIndex);
      };
      return parseMonth(a.month).getTime() - parseMonth(b.month).getTime();
    });

    // Prendre les 12 derniers mois (ou 6 sur mobile)
    const last12Months = chartData.slice(isMobile ? -6 : -12);

    return (
      <Box sx={{ width: '100%', height: isMobile ? 240 : 320, pt: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={last12Months} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: isMobile ? 10 : 12, fontWeight: 600 }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tickLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: isMobile ? 10 : 12, fontWeight: 600 }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.92)', 
                backdropFilter: 'blur(12px)', 
                border: '1px solid rgba(99, 102, 241, 0.3)', 
                borderRadius: '14px', 
                color: '#e0e7ff', 
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                padding: '10px 14px' 
              }} 
              itemStyle={{ color: '#c4b5fd', fontWeight: 600, fontSize: '13px' }}
              labelStyle={{ color: '#e0e7ff', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}
            />
            <Bar dataKey="value" name="Quantité sortie" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  }

  return null;
}