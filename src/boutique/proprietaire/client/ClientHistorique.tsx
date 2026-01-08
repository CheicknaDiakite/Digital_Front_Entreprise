import { useState } from 'react'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Box,
  Chip
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useStoreUuid } from '../../../usePerso/store';
import { useHistoryClientEntreprise } from '../../../usePerso/fonction.user';
import { UuType } from '../../../typescript/Account';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';

export default function ClientHistorique(props: UuType) {
  const { uuid } = props;
  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { clientH, isLoading, isError } = useHistoryClientEntreprise(entreprise_uuid!);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Handle potential structure mismatch where clientH might be { historique: [...] }
  const historyList = (clientH as any)?.historique || (Array.isArray(clientH) ? clientH : []);

  // Filter first by client, then by date and type
  const clientHistoryFiltered = historyList?.filter((item: any) => {
    // 1. Filter by client UUID
    if (item.client !== uuid) return false;

    // 2. Filter by Date Range
    if (startDate) {
      const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      if (itemDate < start) return false;
    }
    if (endDate) {
      const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(0, 0, 0, 0);
      if (itemDate > end) return false;
    }

    // 3. Filter by Type (Entrer vs Sortie)
    if (typeFilter !== 'all') {
      // Assuming 'entrer' or 'sortie' values in item.type or item.action
      // Adjust property access if needed based on data structure inspection
      const type = item.type || item.action;
      if (type !== typeFilter) return false;
    }

    return true;
  });

  // Calculate total sum
  const totalSum = clientHistoryFiltered?.reduce((acc: number, item: any) => {
    const ancien = Number(item.ancien_qte) || 0;
    const qteRaw = Number(item.qte) || 0;

    const delta = item.cumuler_qe ? qteRaw : qteRaw - ancien;
    const deltaText = `${delta > 0 ? '+' : ''}${delta}`;

    const qte = Number(deltaText) || 0;
    const pu = Number(item.pu_achat) || 0;
    return acc + (qte * pu);
  }, 0) || 0;

  if (isLoading) return <div>Chargement...</div>;
  if (isError) return <div>Erreur lors du chargement de l'historique</div>;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Search Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, background: '#f8fafc' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Date début"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ bgcolor: 'white' }}
            />
            <TextField
              label="Date fin"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ bgcolor: 'white' }}
            />
            <FormControl size="small" sx={{ minWidth: 120, bgcolor: 'white' }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">Tout</MenuItem>
                <MenuItem value="entrer">Entrée</MenuItem>
                <MenuItem value="sortie">Sortie</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Chip
            icon={<AttachMoneyIcon />}
            label={`Total: ${formatNumberWithSpaces(totalSum)} `}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold', fontSize: '1rem', bgcolor: 'white' }}
          />
        </Stack>
      </Paper>

      {(!clientHistoryFiltered || clientHistoryFiltered.length === 0) ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', background: 'transparent' }}>
          <Typography>Aucun historique trouvé pour ces critères.</Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
        //  sx={{ background: 'transparent' }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell>Date</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Libellé</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell align="right">Qté</TableCell>
                <TableCell align="right">PU (Achat)</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientHistoryFiltered.map((row: any, index: number) => {
                const ancien = Number(row.ancien_qte) || 0;
                const qteRaw = Number(row.qte) || 0;

                const delta = row.cumuler_qe ? qteRaw : qteRaw - ancien;
                const deltaText = `${delta > 0 ? '+' : ''}${delta}`;
                return <TableRow key={index} hover>
                  <TableCell>{row.date ? new Date(row.date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{row.action || row.type}</TableCell>
                  <TableCell>{row.libelle}</TableCell>
                  <TableCell>{row.categorie}</TableCell>
                  <TableCell align="right" className="font-bold">{deltaText}</TableCell>
                  <TableCell align="right">{row.pu_achat ? formatNumberWithSpaces(Number(row.pu_achat)) : '-'}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {formatNumberWithSpaces(Number(deltaText || 0) * Number(row.pu_achat || 0))}
                  </TableCell>

                </TableRow>
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

