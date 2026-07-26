import { Box, Grid, Typography, CircularProgress, useTheme } from '@mui/material';
import { ChartSection } from '../../../pages/dashboard/components/ChartSection';
import { useSortieUserEntreprise } from '../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../usePerso/store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Types
interface UserData {
  username: string;
  total_qte: number;
}

interface MonthlyData {
  month: string;
  details: UserData[];
}

const MAX_MONTHS_TO_DISPLAY = 12;

const MonthlyUserChart = ({ monthlyData }: { monthlyData: MonthlyData }) => {
  const theme = useTheme();

  const chartData = monthlyData.details.map((user: UserData) => ({
    name: user.username || 'Inconnu',
    value: user.total_qte || 0,
  }));

  // Trier les données par valeur décroissante
  const sortedChartData = chartData.sort((a, b) => b.value - a.value);

  return (
    <ChartSection title={monthlyData.month} className="h-full">
      <Box sx={{ height: 300, width: '100%' }}>
        <ResponsiveContainer>
          <BarChart data={sortedChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.12)" />
            <XAxis
              dataKey="name"
              stroke="#cbd5e1"
              tick={{ fill: '#e2e8f0' }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis stroke="#cbd5e1" tick={{ fill: '#e2e8f0' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#f8fafc',
                borderRadius: '12px',
              }}
            />
            <Bar dataKey="value" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </ChartSection>
  );
};

export default function VenteUsers() {
  const uuid = useStoreUuid((state) => state.selectedId);
  
  const { sortiesUser, isLoading } = useSortieUserEntreprise(uuid!);

  const monthlyData = sortiesUser?.mensuel_par_utilisateur as MonthlyData[] || [];
  const hasData = monthlyData.length > 0;

  return (
    <>
      {/* <Nav /> */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" component="h1" gutterBottom>
            Statistiques des ventes par utilisateur et par mois
          </Typography>
        </Grid>

        <Grid item xs={12}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : !hasData ? (
            <Typography
              variant="h6"
              color="text.secondary"
              align="center"
              sx={{ mt: 2 }}
            >
              Aucune donnée de vente disponible pour le moment.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {monthlyData
                .slice(-MAX_MONTHS_TO_DISPLAY) // Prendre les 12 derniers mois
                .map((monthlyData: MonthlyData, index: number) => (
                  <Grid item xs={12} md={6} lg={4} key={`${monthlyData.month}-${index}`}>
                    <MonthlyUserChart monthlyData={monthlyData} />
                  </Grid>
                ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </>
  );
}
