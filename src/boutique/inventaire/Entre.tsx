import { ChangeEvent, FormEvent, SyntheticEvent, useState, useEffect } from 'react';
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
  InputAdornment,
  Grid
} from '@mui/material';
import { connect } from '../../_services/account.service';
import { RecupType } from '../../typescript/DataType';
import CloseIcon from "@mui/icons-material/Close";
import { useCreateEntre, useGetAllEntre } from '../../usePerso/fonction.entre';
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
import './mobile-entre.css';
import { useTheme } from "@mui/material/styles";
import { useAppSettings } from "../../themes/AppSettingsContext";

export default function Entre() {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDarkText = theme.palette.mode === 'dark' || showBackground;
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unUser } = useFetchUser();
  const { unEntreprise } = useFetchEntreprise(uuid);
  const { ajoutEntre } = useCreateEntre();
  const [ajout_terminer, setTerminer] = useState(false);
  const [is_sortie, setSortie] = useState(true);
  const [is_prix, setPrix] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const Ajout_Terminer = () => setTerminer(!ajout_terminer);
  const Is_Sortie = () => setSortie(!is_sortie);
  const Is_Prix = () => setPrix(!is_prix);

  const { entresEntreprise, isLoading, isError } = useGetAllEntre(uuid!);
  const itemsPerPage = isMobile ? 25 : 25;
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
    unite: 'kilos',
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
      unite: 'kilos',
    });
    closeopen();
  };

  if (isLoading) {
    return (
      <Box className={`${isMobile ? 'mobile-p-4' : 'p-4'}`}>
        <Skeleton variant="rectangular" height={isMobile ? 150 : 200} className="mb-4 mobile-loading" />
        <Skeleton variant="rectangular" height={isMobile ? 80 : 100} className="mb-2 mobile-loading" />
        <Skeleton variant="rectangular" height={isMobile ? 80 : 100} className="mobile-loading" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className={`${isMobile ? 'mobile-p-4' : 'p-4'}`}>
        <Typography variant={isMobile ? "h6" : "h6"} color="error" className="mobile-alert">
          Une erreur est survenue lors du chargement des données
        </Typography>
      </Box>
    );
  }

  if (entresEntreprise) {
    const filteredBoutiques = displayedBoutiques.filter((post) =>
      post?.categorie_libelle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tableColumns: Array<{ label: string; align: 'left' | 'right' }> = [
      { label: 'Image', align: 'left' },
      { label: 'Référence', align: 'left' },
      { label: 'Date', align: 'left' },
      { label: 'Fournisseurs', align: 'left' },
      { label: 'Désignations', align: 'left' },
      { label: 'Quantité', align: 'right' },
      { label: 'Prix Unitaire (vente)', align: 'right' },
      ...(unUser.role === 1 ? [
        { label: 'Prix Unitaire (achat)', align: 'right' as const },
        { label: 'Total', align: 'right' as const },
      ] : []),
    ];

    return (
      <div>

        <Paper
          elevation={0}
          // className={`${isMobile ? 'mobile-header-container' : 'mt-6 rounded-lg overflow-hidden'}`}
          sx={{
            // background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
            // backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            marginTop: '24px',
            bgcolor: 'rgba(255,255,255,0.06)',
          }}
        >
          <Box className={`${isMobile ? 'mobile-p-4' : 'p-6'}`}>
            {/* Header */}
            <div className={`${isMobile ? 'flex flex-col space-y-4' : 'flex justify-between items-center'} border-b pb-6 mb-6`}>
              <div>
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  className={'font-semibold text-gray-50'}
                >
                  Gestion des Entrées
                </Typography>
                <Typography variant="body2" className={`${isMobile ? 'text-gray-200 mt-2' : 'text-gray-200 mt-1'}`}>
                  Gérez votre inventaire et vos approvisionnements
                </Typography>
              </div>
              <Button
                onClick={functionopen}
                variant="contained"
                startIcon={<AddIcon />}
                className={`${isMobile ? 'mobile-button' : 'bg-blue-600 hover:bg-blue-700'}`}
                sx={isMobile ? {
                  borderRadius: '12px',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                    background: 'linear-gradient(135deg, #1d4ed8, #1e40af)'
                  }
                } : {
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  color: 'white',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                }}
              >
                Nouvelle Entrée
              </Button>
            </div>

            {/* Search and Filters */}
            <Grid
              container
              spacing={isMobile ? 2 : 3}
              
              sx={{
                '& .MuiGrid-item': {
                  padding: isMobile ? '8px' : '12px'
                }
              }}
            >
              <Grid item xs={12} md={6} lg={3}>
                <TextField
                  fullWidth
                  placeholder="Rechercher par désignations"
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  // className={`${isMobile ? 'mobile-search-container' : 'bg-white'}`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon  />
                      </InputAdornment>
                    ),
                  }}
                  
                />
              </Grid>

              <Grid item xs={6} md={6} lg={3}>
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
                        <DateRangeIcon />
                      </InputAdornment>
                    ),
                  }}
                  
                />
              </Grid>

              <Grid item xs={6} md={6} lg={3}>
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
                        <DateRangeIcon />
                      </InputAdornment>
                    ),
                  }}
                  
                />
              </Grid>

              <Grid item xs={6} md={6} lg={3}>
                <Paper
                  elevation={0}
                  className={`p-4 flex items-center justify-between`}
                  
                >
                  <div>
                    <Typography variant="subtitle2" >
                      Total Entrées
                    </Typography>
                    <Typography variant="h6">
                      {filteredBoutiques.length}
                    </Typography>
                  </div>
                  <InventoryIcon />
                </Paper>
              </Grid>

              {/* Table */}
              <Grid item xs={12} md={12} lg={12}>
                <Paper
                  elevation={0}
                  className={`rounded-lg`}
                  // sx={isMobile ? {
                  //   borderRadius: '16px',
                  //   overflow: 'hidden',
                  //   background: 'rgba(255, 255, 255, 0.95)',
                  //   backdropFilter: 'blur(10px)',
                  //   border: '1px solid rgba(255, 255, 255, 0.2)',
                  //   marginTop: '16px'
                  // } : {}}
                >
                  <TableContainer 
                    component={Paper}
                    sx={{
                      maxHeight: 560,
                      borderRadius: '14px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(15,23,42,0.7)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                      overflowY: 'auto',
                      overflowX: 'auto',
                    }}
                  >
                    <Table aria-label="sticky table" stickyHeader>
                      <TableHead>
                        <TableRow>
                          {tableColumns.map((col) => (
                            <TableCell
                              key={col.label}
                              align={col.align as 'left' | 'right'}
                              sx={{
                                // background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                                // color: '#64748b',
                                fontWeight: 700,
                                fontSize: '0.68rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                borderBottom: '1px solid rgba(255,255,255,0.08)',
                                py: 1.5,
                              }}
                            >
                              {col.label}
                            </TableCell>
                          ))}
                          <TableCell
                            sx={{
                              // background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                              borderBottom: '1px solid rgba(255,255,255,0.08)',
                            }}
                          />
                          <TableCell
                            sx={{
                              // background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                              borderBottom: '1px solid rgba(255,255,255,0.08)',
                            }}
                          />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredBoutiques?.length > 0 ? (
                          filteredBoutiques?.map((row, index) => (
                            <CardInvent key={index} row={row} />
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={11} align="center" className={`${isMobile ? 'mobile-empty-card py-8' : 'py-8'}`}>
                              <Typography variant="body1" className="text-gray-500">
                                Aucune entrée enregistrée
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}

                        {unUser.role === 1 && filteredBoutiques?.length > 0 && (
                          <>
                            <TableRow className={isMobile ? 'mobile-total-row' : ''}>
                              <TableCell colSpan={5} />
                              <TableCell align="right" className="font-medium text-gray-100">Total Quantité:</TableCell>
                              <TableCell align="right" className="font-medium text-gray-100">{totalQte}</TableCell>
                              <TableCell />
                              <TableCell align="right" className="font-medium text-gray-100">
                                {formatNumberWithSpaces(totalPrice)} <LocalAtmIcon color="primary" fontSize="small" />
                              </TableCell>
                              <TableCell />
                              <TableCell />
                            </TableRow>
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                {/* Pagination */}
                <Box className={`flex justify-center mt-6`}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? "medium" : "large"}
                    
                  />
                </Box>
              </Grid>
            </Grid>




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
            className: "rounded-10",
            sx: isMobile ? {
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            } : {}
          }}
        >
          <DialogTitle className={`flex justify-between items-center bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 text-white border-b pb-3`}>
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
            <DialogContent className={`${isMobile ? 'mobile-p-4' : 'mt-4'}`}>
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
    );
  }

  return null;
}
