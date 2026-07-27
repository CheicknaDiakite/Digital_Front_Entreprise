import { useFetchEntreprise, useSortieUserEntreprise } from '../../usePerso/fonction.user';
import { useStoreUuid } from '../../usePerso/store';
import { 
  Box,
  useTheme, 
  CircularProgress,
} from '@mui/material';
import { ChartSection } from '../../pages/dashboard/components/ChartSection';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UserData {
  username: string | null;
  total_qte: number;
}

interface MonthlyData {
  month: string;
  details: UserData[];
}

export default function Chart_3() {
  const theme = useTheme();
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise  } = useFetchEntreprise(uuid);
  const { sortiesUser } = useSortieUserEntreprise(uuid!);
  
  if (!uuid || !unEntreprise) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (sortiesUser) {
    // Récupérer le mois le plus récent
    const monthlyData = sortiesUser.mensuel_par_utilisateur as MonthlyData[];
    const latestMonth = monthlyData[monthlyData.length - 1];
    
    if (!latestMonth) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      );
    }

    const chartData = latestMonth.details.map((user: UserData) => ({
      name: user.username || 'Inconnu',
      value: user.total_qte || 0,
    }));

    // Trier les données par valeur décroissante et prendre les 15 premiers
    const topChartData = chartData
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);

    return (
      <ChartSection title={`Quantités totales vendues par utilisateur - ${latestMonth.month}`} className="h-full">
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer>
            <BarChart data={topChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="#cbd5e1"
                tick={{ fill: '#e2e8f0' }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                stroke="#cbd5e1"
                tick={{ fill: '#e2e8f0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#f8fafc',
                  borderRadius: '12px',
                }}
              />
              <Bar 
                dataKey="value" 
                fill={theme.palette.primary.main}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </ChartSection>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <CircularProgress />
    </Box>
  );
}
