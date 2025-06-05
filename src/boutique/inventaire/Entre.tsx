import { ChangeEvent, FormEvent, SyntheticEvent, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CardInvent from './CardInvent';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogContent, 
  DialogTitle,
  IconButton, 
  Pagination, 
  Skeleton, 
  TextField, 
  Typography,
  InputAdornment
} from '@mui/material';
import { connect } from '../../_services/account.service';
import { RecupType } from '../../typescript/DataType';
import CloseIcon from "@mui/icons-material/Close";
import { useCreateEntre, useGetAllEntre } from '../../usePerso/fonction.entre';
import Nav from '../../_components/Button/Nav';
import { EntreFormType } from '../../typescript/FormType';
import { AjoutEntreForm, useFormValues } from '../../usePerso/useEntreprise';
import { formatNumberWithSpaces, isLicenceExpired } from '../../usePerso/fonctionPerso';
import { useStoreUuid } from '../../usePerso/store';
import { useFetchEntreprise, useFetchUser } from '../../usePerso/fonction.user';
import M_Abonnement from '../../_components/Card/M_Abonnement';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DateRangeIcon from '@mui/icons-material/DateRange';
import InventoryIcon from '@mui/icons-material/Inventory';

export default function Entre() {
  const uuid = useStoreUuid((state) => state.selectedId);
  const {unUser} = useFetchUser(connect);
  const {unEntreprise} = useFetchEntreprise(uuid!);
  const {ajoutEntre} = useCreateEntre();
  const [ajout_terminer, setTerminer] = useState(false);
  const [is_sortie, setSortie] = useState(true);
  const [is_prix, setPrix] = useState(true);

  const Ajout_Terminer = () => setTerminer(!ajout_terminer);
  const Is_Sortie = () => setSortie(!is_sortie);
  const Is_Prix = () => setPrix(!is_prix);
  
  const {entresEntreprise, isLoading, isError} = useGetAllEntre(connect, uuid!);
  const itemsPerPage = 25;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');

  const filteredBoutiques = entresEntreprise?.filter((item) => {
    if (!item.date) return false;
    const itemDate = new Date(item.date).getTime();
    const startDate = selectedStartDate ? new Date(selectedStartDate).getTime() : null;
    const endDate = selectedEndDate ? new Date(selectedEndDate).getTime() : null;
    return (startDate === null || itemDate >= startDate) && (endDate === null || itemDate <= endDate);
  });

  const reversedBoutiques = filteredBoutiques?.slice().sort((a: RecupType, b: RecupType) => {
    if (a.id === undefined) return 1;
    if (b.id === undefined) return -1;
    return Number(b.id) - Number(a.id);
  });

  const totalPages = Math.ceil(reversedBoutiques?.length / itemsPerPage);
  const totalPrice = reversedBoutiques?.reduce((acc, row: RecupType) => {
    const price = (row.qte !== undefined && row.pu_achat !== undefined) ? row.qte * row.pu_achat : 0;
    return acc + price;
  }, 0);

  const totalQte = reversedBoutiques?.reduce((acc, row: RecupType) => {
    return acc + (row.qte || 0);
  }, 0);

  const displayedBoutiques = reversedBoutiques?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
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
  const functionopen = () => setOpen(true);
  const closeopen = () => setOpen(false);

  const [formValues, handleInputChange, setFormValues] = useFormValues<EntreFormType>({
    libelle: '',
    cumuler_quantite: false,
    user_id: '',
    date: '',
    pu: 0,
    pu_achat: 0,
    qte: 0,
  });
  
  const handleAutoCompleteChange = (_: SyntheticEvent<Element, Event>, value: string | RecupType | null) => {
    if (typeof value === 'object' && value !== null) {
      setFormValues({
        ...formValues,
        categorie_slug: value.uuid ?? '',
      });
    } else {
      setFormValues({
        ...formValues,
        categorie_slug: '',
      });
    }
  };

  const handleAutoFourChange = (_: SyntheticEvent<Element, Event>, value: string | RecupType | null) => {
    if (typeof value === 'object' && value !== null) {
      setFormValues({
        ...formValues,
        client_id: value.uuid ?? '',
      });
    } else {
      setFormValues({
        ...formValues,
        client_id: '',
      });
    }
  };

  const [searchTerm, setSearchTerm] = useState<string>('');
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    formValues["cumuler_quantite"] = ajout_terminer;
    formValues["is_sortie"] = is_sortie;
    formValues["is_prix"] = is_prix;
    formValues["user_id"] = connect;
    ajoutEntre(formValues);
    
    setTerminer(false);
    setSortie(true);
    setPrix(true);
    setFormValues({
      libelle: '',
      cumuler_quantite: false,
      is_sortie: true,
      is_prix: true,
      user_id: '',
      date: '',
      pu: 0,
      pu_achat: 0,
      qte: 0,
    });
    closeopen();
  };

  if (isLoading) {
    return (
      <Box className="p-4">
        <Skeleton variant="rectangular" height={200} className="mb-4" />
        <Skeleton variant="rectangular" height={100} className="mb-2" />
        <Skeleton variant="rectangular" height={100} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className="p-4">
        <Typography variant="h6" color="error">
          Une erreur est survenue lors du chargement des données
        </Typography>
      </Box>
    );
  }

  if (entresEntreprise) {
    const filteredBoutiques = displayedBoutiques.filter((post) =>
      post?.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
    ); 

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
                    Gestion des Entrées
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 mt-1">
                    Gérez votre inventaire et vos approvisionnements
                  </Typography>
                </div>
                <Button
                  onClick={functionopen}
                  variant="contained"
                  startIcon={<AddIcon />}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Nouvelle Entrée
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <TextField
                  fullWidth
                  placeholder="Rechercher par libellé ou référence"
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="bg-white"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Date de début"
                  type="date"
                  value={selectedStartDate}
                  onChange={handleStartDateChange}
                  InputLabelProps={{ shrink: true }}
                  className="bg-white"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRangeIcon className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Date de fin"
                  type="date"
                  value={selectedEndDate}
                  onChange={handleEndDateChange}
                  InputLabelProps={{ shrink: true }}
                  className="bg-white"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRangeIcon className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Paper elevation={0} className="p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                  <div>
                    <Typography variant="subtitle2" className="text-gray-600">
                      Total Entrées
                    </Typography>
                    <Typography variant="h6" className="text-gray-900">
                      {filteredBoutiques.length}
                    </Typography>
                  </div>
                  <InventoryIcon className="text-blue-500" />
                </Paper>
              </div>

              {/* Table */}
              <Paper elevation={0} className="overflow-hidden rounded-lg">
                <TableContainer>
                  <Table sx={{ minWidth: 700 }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                        <TableCell>Image</TableCell>
                        <TableCell>Référence</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Fournisseurs</TableCell>
                        <TableCell>Désignations</TableCell>
                        <TableCell align="right">Quantité</TableCell>
                        <TableCell align="right">Prix Unitaire (vente)</TableCell>
                        {unUser.role === 1 && (
                          <>              
                            <TableCell align="right">Prix Unitaire (achat)</TableCell>
                            <TableCell align="right">Total</TableCell>
                          </>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredBoutiques?.length > 0 ? (
                        filteredBoutiques?.map((row, index) => (
                          <CardInvent key={index} row={row} />
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} align="center" className="py-8">
                            <Typography variant="body1" className="text-gray-500">
                              Aucune entrée enregistrée
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}

                      {unUser.role === 1 && filteredBoutiques?.length > 0 && (
                        <>
                          <TableRow>
                            <TableCell colSpan={5} />
                            <TableCell align="right" className="font-medium">Total Quantité:</TableCell>
                            <TableCell align="right" className="font-medium">{totalQte}</TableCell>
                            <TableCell />
                            <TableCell align="right" className="font-medium">
                              {formatNumberWithSpaces(totalPrice)} <LocalAtmIcon color="primary" fontSize="small" />
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Pagination */}
              <Box className="flex justify-center mt-6">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            </Box>
          </Paper>

          {/* Add Entry Dialog */}
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
              <Typography variant="h6" className="font-semibold">
                Nouvelle Entrée
              </Typography>
              <IconButton onClick={closeopen} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
              <M_Abonnement />
            ) : (
              <DialogContent className="mt-4">
                <AjoutEntreForm
                  onSubmit={onSubmit}
                  formValues={formValues}
                  onChange={handleInputChange}
                  handleAutoCompleteChange={handleAutoCompleteChange}
                  handleAutoFourChange={handleAutoFourChange}
                  Ajout_Terminer={Ajout_Terminer}
                  Is_Sortie={Is_Sortie}
                  Is_Prix={Is_Prix}
                />
              </DialogContent>
            )}
          </Dialog>
        </div>
      </div>
    );
  }

  return null;
}
