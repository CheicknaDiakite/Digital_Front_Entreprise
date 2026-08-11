import { useState } from 'react';
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
  Chip,
  Skeleton,
  useTheme,
} from '@mui/material';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useStoreUuid } from '../../../usePerso/store';
import { useHistoryClientEntreprise } from '../../../usePerso/fonction.user';
import { UuType } from '../../../typescript/Account';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import { useAppSettings } from '../../../themes/AppSettingsContext';

export default function ClientHistorique(props: UuType) {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDarkText = theme.palette.mode === 'dark' || showBackground;
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
    const itemClientUuid = typeof item.client === 'object' ? item.client?.uuid : item.client;
    if (!itemClientUuid || String(itemClientUuid).toLowerCase() !== String(uuid).toLowerCase()) return false;

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
      const type = item.type || item.action;
      if (type !== typeFilter) return false;
    }

    return true;
  });

  // Calculate total sum — mirrors the rowTotal logic in the table
  const totalSum =
    clientHistoryFiltered?.reduce((acc: number, item: any) => {
      const ancien = Number(item.ancien_qte) || 0;
      const qteRaw = Number(item.qte) || 0;

      const delta = item.cumuler_qe ? qteRaw : qteRaw - ancien;
      const qte = Math.abs(delta); // on prend la valeur absolue pour que entrées et sorties s'additionnent
      const itemType = item.type || item.action;
      const pu = itemType === 'entrer' ? (Number(item.pu_achat) || 0) : (Number(item.pu) || 0);
      return acc + qte * pu;
    }, 0) || 0;

  if (isLoading) {
    return (
      <Box className="space-y-3 p-4">
        <Skeleton variant="rectangular" height={50} className="rounded-xl" />
        <Skeleton variant="rectangular" height={250} className="rounded-xl" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Paper elevation={0} className="p-8 text-center rounded-xl border border-red-200 bg-red-50/50">
        <Typography variant="body1" color="error" className="font-semibold">
          Erreur lors du chargement de l'historique
        </Typography>
      </Paper>
    );
  }

  const renderActionChip = (action?: string) => {
    const act = (action || '').toLowerCase();
    if (act.includes('entrer') || act.includes('entrée') || act.includes('achat')) {
      return (
        <Chip
          icon={<ArrowUpwardIcon fontSize="small" />}
          label="Entrée"
          size="small"
          sx={{
            bgcolor: '#ecfdf5',
            color: '#047857',
            borderColor: '#a7f3d0',
            fontWeight: 600,
            borderRadius: '6px',
          }}
          variant="outlined"
        />
      );
    }
    return (
      <Chip
        icon={<ArrowDownwardIcon fontSize="small" />}
        label="Sortie"
        size="small"
        sx={{
          bgcolor: '#eff6ff',
          color: '#1d4ed8',
          borderColor: '#bfdbfe',
          fontWeight: 600,
          borderRadius: '6px',
        }}
        variant="outlined"
      />
    );
  };

  return (
    <Box className="space-y-6">
      {/* Search Filters & Total Card */}
      <Paper
        elevation={0}
        className="p-4 rounded-xl border border-gray-200/40 bg-transparent"
        sx={{ background: 'transparent', bgcolor: 'transparent' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <TextField
              label="Date début"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              label="Date fin"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Type d'opération</InputLabel>
              <Select
                value={typeFilter}
                label="Type d'opération"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">Toutes les opérations</MenuItem>
                <MenuItem value="entrer">Entrées uniquement</MenuItem>
                <MenuItem value="sortie">Sorties uniquement</MenuItem>
              </Select>
            </FormControl>
          </div>

          <Paper
            elevation={0}
            className="p-3 rounded-lg border border-blue-200/50 bg-blue-50/30 flex items-center space-x-3 self-start md:self-auto"
          >
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <LocalAtmIcon fontSize="small" />
            </div>
            <div>
              <Typography variant="caption" className="font-semibold block uppercase" color={isDarkText ? 'white' : 'text.primary'}>
                Total historique
              </Typography>
              <Typography variant="h6" className="font-bold" color={isDarkText ? 'white' : 'text.primary'}>
                {formatNumberWithSpaces(totalSum)} F
              </Typography>
            </div>
          </Paper>
        </div>
      </Paper>

      {/* Table Section */}
      {!clientHistoryFiltered || clientHistoryFiltered.length === 0 ? (
        <Paper
          elevation={0}
          className="p-12 text-center rounded-xl border border-gray-200/40 bg-transparent"
          sx={{ background: 'transparent', bgcolor: 'transparent' }}
        >
          <Typography variant="body1" className="font-medium" color={isDarkText ? 'white' : 'text.primary'}>
            Aucun historique trouvé pour ces critères.
          </Typography>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          className="rounded-xl border border-gray-200/40 bg-transparent overflow-hidden"
          sx={{ background: 'transparent', bgcolor: 'transparent' }}
        >
          <TableContainer sx={{ maxHeight: 550 }}>
            <Table stickyHeader aria-label="tableau d'historique">
              <TableHead>
                <TableRow sx={{ '& th': { backgroundColor: '#f8fafc', fontWeight: 700, color: '#334155' } }}>
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
                  const rowType = row.type || row.action;
                  const rowPu = rowType === 'entrer' ? (Number(row.pu_achat) || 0) : (Number(row.pu) || 0);
                  const rowTotal = Math.abs(delta) * rowPu;
                  
                  return (
                    <TableRow key={index} hover className="transition-colors hover:bg-slate-50/80">
                      <TableCell sx={{ py: 1.5, color: '#334155', fontWeight: 500 }}>
                        {row.date ? new Date(row.date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        {renderActionChip(row.type || row.action)}
                      </TableCell>
                      <TableCell sx={{ py: 1.5, fontWeight: 500, color: '#1e293b' }}>
                        {row.libelle || '-'}
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: '#475569' }}>
                        {row.categorie || '-'}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, fontWeight: 700, color: delta >= 0 ? '#047857' : '#dc2626' }}>
                        {deltaText}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, color: '#475569' }}>
                        {row.pu_achat ? `${formatNumberWithSpaces(Number(row.pu_achat))} F` : `${formatNumberWithSpaces(Number(row.pu))} F`}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, fontWeight: 700, color: '#2563eb' }}>
                        {formatNumberWithSpaces(rowTotal)} F
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}


