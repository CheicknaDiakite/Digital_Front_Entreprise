import { ChangeEvent, FormEvent, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Pagination,
  TextField,
  Typography,
  Box,
  InputAdornment,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from '@mui/icons-material/Add';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { connect } from '../../../_services/account.service';
import { DepenseType } from '../../../typescript/DataType';
import { useCreateDepense, useGetAllDepense } from '../../../usePerso/fonction.entre';
import MyTextField from '../../../_components/Input/MyTextField';
import CardDepense from './CardDepense';
import Nav from '../../../_components/Button/Nav';
import { useStoreUuid } from '../../../usePerso/store';
import { formatNumberWithSpaces, isLicenceExpired } from '../../../usePerso/fonctionPerso';
import M_Abonnement from '../../../_components/Card/M_Abonnement';
import { useFetchEntreprise } from '../../../usePerso/fonction.user';

export default function Depense() {
  const {ajoutDepense} = useCreateDepense();
  const uuid = useStoreUuid((state) => state.selectedId);
  const {unEntreprise} = useFetchEntreprise(uuid!);
  const {depensesEntreprise, isLoading, isError} = useGetAllDepense(connect, uuid!);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');

  const filteredDepenses = depensesEntreprise?.filter((item) => {
    if (!item.date) return false;
    const itemDate = new Date(item.date).getTime();
    const startDate = selectedStartDate ? new Date(selectedStartDate).getTime() : null;
    const endDate = selectedEndDate ? new Date(selectedEndDate).getTime() : null;
    return (startDate === null || itemDate >= startDate) && (endDate === null || itemDate <= endDate);
  });

  const reversedDepenses = filteredDepenses?.slice().sort((a: DepenseType, b: DepenseType) => {
    if (a.id === undefined) return 1;
    if (b.id === undefined) return -1;
    return b.id - a.id;
  });
 
  const totalPages = Math.ceil((reversedDepenses?.length || 0) / itemsPerPage);     
  const depensesBoutic = reversedDepenses?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalMontant = depensesBoutic?.reduce((acc, depense) => {
    const somme = depense.somme ? parseFloat(String(depense.somme)) : 0;
    return acc + somme;
  }, 0);

  const handlePageChange = (_: ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedStartDate(event.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedEndDate(event.target.value);
    setCurrentPage(1);
  };

  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState<DepenseType>({
    libelle: '',
    date: '',
    somme: 0,
  });
  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };
  
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    formValues["user_id"] = connect;
    formValues["facture"] = image;
    formValues["entreprise_id"] = uuid!;
    
    ajoutDepense(formValues);
    setFormValues({ libelle: '', date: '', somme: 0 });
    setOpen(false);
  };

  if (isLoading) {
    return (
      <Box className="p-8">
        <Card elevation={0}>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className="p-8">
        <Alert severity="error">
          Une erreur est survenue lors du chargement des données
        </Alert>
      </Box>
    );
  }

  if (depensesEntreprise) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Nav />
          
          <Paper elevation={0} className="mt-6 rounded-lg overflow-hidden">
            <Box className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-6 mb-6">
                <div>
                  <Typography variant="h4" className="font-semibold text-gray-900">
                    Gestion des Dépenses
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 mt-1">
                    Gérez les dépenses de votre entreprise
                  </Typography>
                </div>
                <Button
                  onClick={() => setOpen(true)}
                  variant="contained"
                  startIcon={<AddIcon />}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Ajouter une dépense
                </Button>
              </div>

              {/* Filters and Summary */}
              <div className="mb-6 space-y-4">
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Date de début"
                      type="date"
                      value={selectedStartDate}
                      onChange={handleStartDateChange}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateRangeIcon className="text-gray-400" />
                          </InputAdornment>
                        ),
                      }}
                      className="bg-white"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Date de fin"
                      type="date"
                      value={selectedEndDate}
                      onChange={handleEndDateChange}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateRangeIcon className="text-gray-400" />
                          </InputAdornment>
                        ),
                      }}
                      className="bg-white"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper elevation={0} className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                      <Typography variant="subtitle2" className="text-blue-900 mb-1">
                        Total des dépenses
                      </Typography>
                      <Typography variant="h4" className="text-blue-700 flex items-center">
                        {formatNumberWithSpaces(totalMontant)}
                        <LocalAtmIcon className="ml-2" />
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </div>

              {/* Table */}
              <TableContainer component={Paper} elevation={0} className="border">
                <Table>
                  <TableHead className="bg-gray-50">
                    <TableRow>
                      <TableCell className="font-medium">Date</TableCell>
                      <TableCell className="font-medium">Libellé</TableCell>
                      <TableCell className="font-medium">Montant</TableCell>
                      <TableCell className="font-medium">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {depensesBoutic?.length > 0 ? (
                      depensesBoutic.map((row, index) => (
                        <CardDepense key={index} row={row} />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" className="py-8 text-gray-500">
                          Aucune dépense enregistrée
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <div className="flex justify-center mt-6">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </div>
            </Box>
          </Paper>

          {/* Add Expense Modal */}
          <Dialog 
            open={open} 
            onClose={() => setOpen(false)}
            fullWidth 
            maxWidth="sm"
            PaperProps={{
              elevation: 0,
              className: "rounded-lg"
            }}
          >
            <DialogTitle className="flex justify-between items-center border-b pb-3">
              <Typography variant="h6" className="font-semibold">
                Ajouter une dépense
              </Typography>
              <IconButton onClick={() => setOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
              <M_Abonnement />
            ) : (
              <DialogContent className="mt-4">
                <form onSubmit={onSubmit} className="space-y-4">
                  <MyTextField
                    required
                    fullWidth
                    label="Libellé"
                    name="libelle"
                    onChange={(e) => setFormValues({...formValues, libelle: e.target.value})}
                    value={formValues.libelle}
                    className="bg-white"
                  />

                  <MyTextField
                    required
                    fullWidth
                    type="date"
                    label="Date"
                    name="date"
                    onChange={(e) => setFormValues({...formValues, date: e.target.value})}
                    value={formValues.date}
                    InputLabelProps={{ shrink: true }}
                    className="bg-white"
                  />

                  <MyTextField
                    required
                    fullWidth
                    type="number"
                    label="Montant"
                    name="somme"
                    onChange={(e) => setFormValues({...formValues, somme: parseFloat(e.target.value)})}
                    value={formValues.somme}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalAtmIcon className="text-gray-400" />
                        </InputAdornment>
                      ),
                    }}
                    className="bg-white"
                  />

                  <MyTextField
                    fullWidth
                    type="file"
                    label="Facture"
                    onChange={handleImageChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ReceiptIcon className="text-gray-400" />
                        </InputAdornment>
                      ),
                    }}
                    className="bg-white"
                  />

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button onClick={() => setOpen(false)} variant="outlined">
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Ajouter
                    </Button>
                  </div>
                </form>
              </DialogContent>
            )}
          </Dialog>
        </div>
      </div>
    );
  }

  return null;
}
