import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Paper,
  Alert,
  Box,
  CircularProgress,
  Stack,
  Typography,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  Pagination
} from '@mui/material';
import { format } from 'date-fns';
import { useHistorySuppEntreprise } from '../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../usePerso/store';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import { HistoriqueType } from '../../../typescript/Account';
import { useState } from 'react';

// Components
const LoadingSpinner = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '200px' 
  }}>
    <CircularProgress />
  </Box>
);

const ErrorMessage = () => (
  <Stack sx={{ width: '100%', padding: 2 }} spacing={2}>
    <Alert 
      severity="error"
      sx={{ 
        '& .MuiAlert-message': { 
          fontSize: '1rem' 
        } 
      }}
    >
      Une erreur est survenue lors de la récupération des données.
    </Alert>
  </Stack>
);

const EmptyState = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 4,
      backgroundColor: '#f9fafb'
    }}
  >
    <Typography variant="body1" color="text.secondary">
      Aucun historique de suppression disponible
    </Typography>
  </Box>
);

const HistoryTable = ({ data }: { data: HistoriqueType[] }) => {
  const [descDialog, setDescDialog] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  const totalPages = Math.ceil((data?.length ?? 0) / rowsPerPage);
  const paginatedHistorique = data?.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  return <>
  
  <TableContainer 
    component={Paper} 
    sx={{ maxHeight: 600 }}
  >
    <Table 
      
      stickyHeader aria-label="sticky table"
    >
      <TableHead>
        <TableRow>
          <TableCell 
            align="center" 
            colSpan={7}
            sx={{ 
              backgroundColor: '#f8fafc',
              borderBottom: '2px solid #e2e8f0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <Typography variant="h6" component="h2">
                Historique des produits supprimés
              </Typography>
              <Chip
                label={data.length}
                color="error"
                size="small"
                sx={{ 
                  fontWeight: 'medium',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  '& .MuiChip-label': {
                    px: 2
                  }
                }}
              />
            </Box>
          </TableCell>
        </TableRow>
        <TableRow sx={{ backgroundColor: '#f8fafc' }}>
          <TableCell>Date</TableCell>
          <TableCell>Type</TableCell>
          <TableCell align="right">Quantité</TableCell>
          <TableCell align="right">Prix Unitaire</TableCell>
          <TableCell align="right">Catégorie</TableCell>
          <TableCell align="right">Description</TableCell>
          <TableCell align="right">Action</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {paginatedHistorique.map((row, index) => (
          <TableRow 
            key={`history-${index}`}
            hover
            sx={{ '& > *': { borderBottom: 'unset' } }}
          >
            <TableCell>
              {format(new Date(row.date ?? new Date()), 'dd/MM/yyyy HH:mm:ss')}
            </TableCell>
            <TableCell>
              {/* <Chip
                label={row.type}
                size="small"
                sx={{
                  backgroundColor: row.type === 'entrer' ? '#dcfce7' : '#dbeafe',
                  color: row.type === 'entrer' ? '#15803d' : '#1e40af',
                  fontWeight: 'medium'
                }}
              /> */}
              <span className={`px-2 py-1 rounded-full text-sm ${
                row.type === 'entrer'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {row.type}
              </span>
            </TableCell>
            <TableCell align="right">{row.qte}</TableCell>
            <TableCell align="right">{formatNumberWithSpaces(row.pu)}</TableCell>
            <TableCell align="right">{row.categorie}</TableCell>
            
            <TableCell align="right">
              <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                {row.libelle || '-'}
              </Typography>

              {row.description && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                  <Tooltip title="Afficher la description complète">
                    <Typography
                      variant="caption"
                      onClick={() => setDescDialog(row.description ?? null)}
                      sx={{
                        color: 'text.secondary',
                        fontStyle: 'italic',
                        maxWidth: 220,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      motif: {row.description.length > 80 ? `${row.description.slice(0, 80)}…` : row.description}
                    </Typography>
                  </Tooltip>
                </Box>
              )}
            </TableCell>
            <TableCell align="right">{row.action}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>

  {totalPages > 1 && (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }} className={`flex justify-center mt-6 mobile-pagination`}>
      <Pagination        
          count={totalPages}
          page={currentPage}
          onChange={(_, page) => setCurrentPage(page)}
          color="primary"
          size="large"
      />
    </Box>
  )}

  <Dialog open={!!descDialog} onClose={() => setDescDialog(null)} maxWidth="sm" fullWidth>
    <DialogTitle>Motif</DialogTitle>
    <DialogContent>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {descDialog}
      </Typography>
    </DialogContent>
  </Dialog>
  </>
};

export default function HistoriqueSupp() {
  const uuid = useStoreUuid((state) => state.selectedId);
  const { suppH, isLoading, isError } = useHistorySuppEntreprise(uuid!);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage />;
  if (!suppH || suppH.length === 0) return <EmptyState />;

  return (
    <div>
      {/* <Nav /> */}
      <Paper elevation={0} className="mt-6">
        <HistoryTable data={suppH} />
      </Paper>
      
    </div>
  );
}

