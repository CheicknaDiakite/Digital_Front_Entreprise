import { useGetSumDepense } from '../../usePerso/fonction.entre';
import { useStoreUuid } from '../../usePerso/store';
import { 
  Box,
  useTheme, 
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import { ChartSection } from '../../pages/dashboard/components/ChartSection';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DepenseSumType {
  mois: string;
  total: number;
}

export default function Chart_Dep() {
  const theme = useTheme()
  const uuid = useStoreUuid((state) => state.selectedId);
  const { depensesSum, isLoading, isError } = useGetSumDepense(uuid!);
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
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

  if (depensesSum && Array.isArray(depensesSum)) {
    const chartData = (depensesSum as DepenseSumType[]).slice(0, 12).map((item) => ({
      name: item.mois
        ? new Date(item.mois).toLocaleString('default', { month: 'short' })
        : 'Inconnu',
      value: item.total || 0,
    }));

    return (
      <ChartSection title="Dépenses mensuelles" className="h-full">
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
                stroke="#cbd5e1"
                tick={{ fill: '#e2e8f0' }}
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

  return null;
}
