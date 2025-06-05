import { 
  Box, 
  Button, 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  Grid, 
  IconButton, 
  Pagination, 
  Paper, 
  Skeleton, 
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
} from '@mui/material'
import CloseIcon from "@mui/icons-material/Close"
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DescriptionIcon from '@mui/icons-material/Description';
import { ChangeEvent, FormEvent, useState } from 'react';
import { connect } from '../../../../_services/account.service';
import { useCreateFacEntre, useGetAllFacEntre } from '../../../../usePerso/fonction.facture';
import CardFacEntre from './CardFacEntre';
import MyTextField from '../../../../_components/Input/MyTextField';
import { FacSorType } from '../../../../typescript/fac';
import Nav from '../../../../_components/Button/Nav';
import { useStoreUuid } from '../../../../usePerso/store';
import { RecupType } from '../../../../typescript/DataType';
import M_Abonnement from '../../../../_components/Card/M_Abonnement';
import { useFetchEntreprise } from '../../../../usePerso/fonction.user';
import { isLicenceExpired } from '../../../../usePerso/fonctionPerso';

export default function FacEntre() {
  const uuid = useStoreUuid((state) => state.selectedId)
  const {unEntreprise} = useFetchEntreprise(uuid!)

  const {ajoutFacEntre} = useCreateFacEntre()
  const {facEntresUtilisateur, isLoading, isError}= useGetAllFacEntre(connect, uuid!)

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');

  const filteredBoutiques = facEntresUtilisateur?.filter((item) => {
    if (!item.date) return false;
    const itemDate = new Date(item.date).getTime();
    const startDate = selectedStartDate ? new Date(selectedStartDate).getTime() : null;
    const endDate = selectedEndDate ? new Date(selectedEndDate).getTime() : null;
    return (
      (startDate === null || itemDate >= startDate) &&
      (endDate === null || itemDate <= endDate)
    );
  });

  const reversedFacEntrer = filteredBoutiques?.slice().sort((a: RecupType, b: RecupType) => {
    if (a.id === undefined) return 1;
    if (b.id === undefined) return -1;
    return Number(b.id) - Number(a.id);
  });
 
  const totalPages = Math.ceil(filteredBoutiques.length / itemsPerPage);
  const facEntrerBoutic = reversedFacEntrer.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
   
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
  
  const [open, openchange]= useState(false);
  const functionopen = () => openchange(true);
  const closeopen = () => openchange(false);

  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const [formValues, setFormValues] = useState<FacSorType>({
    user_id: '',
    libelle: '',
    ref: '',
    date: '',
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    formValues["user_id"] = connect;
    formValues["facture"] = image;
    formValues["entreprise_id"] = uuid!;

    ajoutFacEntre(formValues);

    setFormValues({
      user_id: '',
      libelle: '',
      date: '',
      ref: '',
    });
    closeopen();
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', padding: 3 }}>
        <Skeleton height={60} />
        <Skeleton height={40} />
        <Skeleton height={400} />
      </Box>
    );
  }

  if (isError) {
    window.location.reload();
    return <div>Erreur lors du chargement...</div>;
  }

  if (facEntresUtilisateur) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-center">
            <Typography variant="h4" className="font-semibold text-gray-900">
              Factures d'Entrée
            </Typography>
            <Tooltip title="Ajouter une facture" arrow TransitionComponent={Fade}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={functionopen}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Nouvelle Facture
              </Button>
            </Tooltip>
          </div>

          <Paper elevation={0} className="mb-6 p-4 border rounded-lg">
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" className="mb-2 text-gray-700">
                  Filtrer par période
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Date de début"
                      type="date"
                      value={selectedStartDate}
                      onChange={handleStartDateChange}
                      InputLabelProps={{ shrink: true }}
                      className="bg-white"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Date de fin"
                      type="date"
                      value={selectedEndDate}
                      onChange={handleEndDateChange}
                      InputLabelProps={{ shrink: true }}
                      className="bg-white"
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={6} className="flex justify-end">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  className="mt-4 md:mt-0"
                />
              </Grid>
            </Grid>
          </Paper>

          <Dialog 
            open={open} 
            onClose={closeopen} 
            fullWidth 
            maxWidth="sm"
            PaperProps={{
              elevation: 0,
              className: "rounded-lg"
            }}
          >
            <DialogTitle className="flex justify-between items-center border-b pb-3">
              <Typography variant="h6">Ajouter une facture d'entrée</Typography>
              <IconButton onClick={closeopen} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
              <M_Abonnement />  
            ) : (        
              <DialogContent className="mt-4">              
                <form onSubmit={onSubmit} className="space-y-4 p-2">
                  <MyTextField
                    required
                    fullWidth
                    label="Libellé"
                    name="libelle"
                    onChange={onChange}
                    InputProps={{
                      startAdornment: <DescriptionIcon className="mr-2 text-gray-400" />,
                    }}
                  />
                  
                  <MyTextField
                    required
                    fullWidth
                    label="Référence"
                    name="ref"
                    onChange={onChange}
                    InputProps={{
                      startAdornment: <ReceiptIcon className="mr-2 text-gray-400" />,
                    }}
                  />
                  
                  <MyTextField
                    required
                    fullWidth
                    label="Date"
                    name="date"
                    type="date"
                    onChange={onChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <DateRangeIcon className="mr-2 text-gray-400" />,
                    }}
                  />
                  
                  <MyTextField 
                    fullWidth
                    label="Facture"
                    name="facture"
                    type="file"
                    onChange={handleImageChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <ReceiptIcon className="mr-2 text-gray-400" />,
                    }}
                  />
                  
                  <div className="pt-4 border-t flex justify-end">
                    <Button
                      type="submit"
                      variant="contained"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </DialogContent>
            )}
          </Dialog>
      
          <TableContainer component={Paper} elevation={0} className="border rounded-lg">
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="font-semibold">Date</TableCell>
                  <TableCell className="font-semibold">Libellé</TableCell>
                  <TableCell className="font-semibold">Référence</TableCell>
                  <TableCell className="font-semibold">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {facEntrerBoutic?.length > 0 ? (
                  facEntrerBoutic?.map((row, index) => (
                    <CardFacEntre key={index} row={row} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" className="py-8 text-gray-500">
                      Aucune facture d'entrée disponible
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    );
  }
}
