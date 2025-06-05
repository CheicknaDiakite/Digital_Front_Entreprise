import { useParams } from "react-router-dom";
import { RecupType, RouteParams } from "../../../../typescript/DataType";
import { 
  Box, 
  Button,
  CircularProgress, 
  InputAdornment,
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TextField, 
  Typography,
  Tooltip,
  Fade
} from "@mui/material";
import CardInfo from "./CardInfo";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Nav from "../../../../_components/Button/Nav";
import { useCateSousCate, useInfoSousCate } from "../../../../usePerso/fonction.categorie";
import { connect } from "../../../../_services/account.service";
import { formatNumberWithSpaces } from "../../../../usePerso/fonctionPerso";
import { useState } from "react";
import { useFetchUser } from "../../../../usePerso/fonction.user";
import { Pagination } from '@mui/material';

export default function Info() {
  const { uuid } = useParams<RouteParams>();
  const { unUser } = useFetchUser(connect);
  const { sousCate } = useCateSousCate({ slug: uuid, user_id: connect });
  const { infos, isLoading } = useInfoSousCate({ slug: uuid });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');
  const itemsPerPage = 25;

  const filteredInfos = infos?.filter((item) => {
    if (!item.date) return false;
    const itemDate = new Date(item.date).getTime();
    const startDate = selectedStartDate ? new Date(selectedStartDate).getTime() : null;
    const endDate = selectedEndDate ? new Date(selectedEndDate).getTime() : null;
    return (startDate === null || itemDate >= startDate) && (endDate === null || itemDate <= endDate);
  });

  const reversedInfos = filteredInfos?.slice().sort((a: RecupType, b: RecupType) => {
    if (a.id === undefined) return 1;
    if (b.id === undefined) return -1;
    return Number(b.id) - Number(a.id);
  });

  const totalPages = Math.ceil((reversedInfos?.length || 0) / itemsPerPage);
  const displayedInfos = reversedInfos?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const totalPrice = reversedInfos?.reduce((acc, row: RecupType) => {
    return acc + ((row.qte !== undefined && row.pu !== undefined) ? row.qte * row.pu : 0);
  }, 0) || 0;

  const totalQte = reversedInfos?.reduce((acc, row: RecupType) => {
    return acc + (row.qte !== undefined ? row.qte : 0);
  }, 0) || 0;

  const ent = infos?.filter(info => info.sortie !== undefined && info.sortie !== null)
    .flatMap(info => info.sortie);

  const sumQteStock = infos?.filter(info => info.libelle !== undefined)
    .reduce((sum, sor) => sum + (sor.qte || 0), 0) || 0;

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (!infos) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sousCate?.map((post, index) => (
          <div key={index} className="mb-8">
            <Typography variant="h4" className="font-semibold text-gray-900">
              {post.libelle}
            </Typography>
            <Typography variant="body1" className="text-gray-500 mt-1">
              Informations détaillées des ventes et du stock
            </Typography>
          </div>
        ))}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Paper elevation={0} className="p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="subtitle2" className="text-blue-600 mb-1">
                  Total des ventes
                </Typography>
                <Typography variant="h4" className="font-semibold">
                  {sumQteStock}
                </Typography>
                <Typography variant="body2" className="text-gray-500 mt-1">
                  {formatNumberWithSpaces(totalPrice)} F
                </Typography>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <ShoppingCartIcon className="text-blue-600" />
              </div>
            </div>
          </Paper>

          {ent?.map((p, index) => {
            if (p.qte !== 0) {
              return (
                <Paper key={index} elevation={0} className="p-6 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="subtitle2" className="text-green-600 mb-1">
                        {p.libelle}
                      </Typography>
                      <Typography variant="h4" className="font-semibold">
                        {p.qte}
                      </Typography>
                      {unUser.role === 1 && (
                        <Typography variant="body2" className="text-gray-500 mt-1">
                          Prix d'achat: {formatNumberWithSpaces(p.pu_achat)} F
                        </Typography>
                      )}
                    </div>
                    <div className="bg-green-200 p-3 rounded-full">
                      <InventoryIcon className="text-green-600" />
                    </div>
                  </div>
                </Paper>
              );
            }
            return null;
          })}
        </div>

        <Paper elevation={0} className="border rounded-lg overflow-hidden mb-8">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <TextField
                  label="Date de début"
                  type="date"
                  value={selectedStartDate}
                  onChange={(e) => setSelectedStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  className="bg-white"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Date de fin"
                  type="date"
                  value={selectedEndDate}
                  onChange={(e) => setSelectedEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  className="bg-white"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>

              <Tooltip title="Nombre total de ventes" arrow TransitionComponent={Fade}>
                <Button
                  variant="outlined"
                  // startIcon={<SearchIcon />}
                  size="small"
                >
                  {displayedInfos.length} ventes
                </Button>
              </Tooltip>
            </div>
          </div>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Produit</TableCell>
                  <TableCell align="right">Quantité</TableCell>
                  <TableCell align="right">Prix Unitaire</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedInfos?.length > 0 ? (
                  displayedInfos.map((row, index) => (
                    <CardInfo key={index} row={row} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" className="py-8">
                      <Typography variant="body1" className="text-gray-500">
                        Aucune donnée disponible
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={3} align="right" className="font-medium">
                    Total :
                  </TableCell>
                  <TableCell align="right" className="font-medium">
                    {totalQte}
                  </TableCell>
                  <TableCell />
                  <TableCell align="right" className="font-medium">
                    <div className="flex items-center justify-end gap-1">
                      {formatNumberWithSpaces(totalPrice)} F
                      <LocalAtmIcon className="text-blue-600" fontSize="small" />
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <div className="flex justify-center p-4 border-t">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                size="small"
              />
            </div>
          )}
        </Paper>
      </div>
    </div>
  );
}
