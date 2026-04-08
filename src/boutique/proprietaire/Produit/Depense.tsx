import { ChangeEvent, FormEvent, useState, useEffect } from 'react';
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
import Chart_Dep from '../../../_components/Chart/Chart_Dep';
import './mobile-produit.css';

export default function Depense() {
  const {ajoutDepense} = useCreateDepense();
  const uuid = useStoreUuid((state) => state.selectedId);
  const {unEntreprise} = useFetchEntreprise(uuid);
  
  const {depensesEntreprise, isLoading, isError} = useGetAllDepense(uuid!);
  const [isMobile, setIsMobile] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMobile ? 10 : 25;

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      <Box className={`${isMobile ? 'mobile-p-4' : 'p-8'}`}>
        <Card elevation={0} className={isMobile ? 'mobile-header-container' : ''}>
          <CardContent>
            <div className={`${isMobile ? 'mobile-loading' : 'animate-pulse'} space-y-4`}>
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
      <Box className={`${isMobile ? 'mobile-p-4' : 'p-8'}`}>
        <Alert severity="error" className={isMobile ? 'mobile-alert' : ''}>
          Une erreur est survenue lors du chargement des données
        </Alert>
      </Box>
    );
  }

  if (depensesEntreprise) {
    return (
      <div >
          {/* <Nav /> */}
          <div className={isMobile ? '' : ''}>
            <Chart_Dep />
          </div>
          <Paper 
            elevation={0} 
            className={`mt-6 rounded-lg overflow-hidden`}
            sx={ {
              background: 'transparent',   // totalement transparent
              bgcolor: 'transparent',
              backdropFilter: 'none',
              border: 'none',
            } }
          >
            <Box className={`${isMobile ? 'mobile-p-4' : 'p-6'}`}>
              {/* Header */}
              <div className={`${isMobile ? 'flex flex-col space-y-4' : 'flex justify-between items-center'} border-b pb-6 mb-6`}>
                <div>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    className={`font-semibold text-gray-50`}
                    
                  >
                    Gestion des Dépenses
                  </Typography>
                  <Typography variant="body2" className={`text-gray-100 mt-2`}>
                    Gérez les dépenses de votre entreprise
                  </Typography>
                </div>
                <Button
                  onClick={() => setOpen(true)}
                  variant="contained"
                  startIcon={<AddIcon />}
                  className={`${isMobile ? 'mobile-button mobile-button-primary' : 'bg-blue-600 hover:bg-blue-700'}`}
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
                  } : {}}
                >
                  Ajouter une dépense
                </Button>
              </div>

              {/* Filters and Summary */}
              <div className={`${isMobile ? 'mobile-filters-section' : 'mb-6 space-y-4'}`}>
                <Grid 
                  container 
                  spacing={isMobile ? 2 : 3} 
                  alignItems="center"
                  className={"p-3"}
                  sx={{
                    '& .MuiGrid-item': {
                      padding: isMobile ? '8px' : '12px'
                    }
                  }}
                >
                  <Grid item xs={6} sm={6} md={4}>
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
                      className={`${isMobile ? 'mobile-date-field' : 'bg-white'}`}
                      sx={isMobile ? {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '&:focus-within': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                          }
                        }
                      } : {}}
                    />
                  </Grid>
                  <Grid item xs={6} sm={6} md={4}>
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
                      className={`${isMobile ? 'mobile-date-field' : 'bg-white'}`}
                      sx={isMobile ? {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '&:focus-within': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                          }
                        }
                      } : {}}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper 
                      elevation={0} 
                      className={`${isMobile ? 'mobile-stats-card' : 'p-4 bg-blue-50 border border-blue-100 rounded-lg'}`}
                      sx={isMobile ? {
                        borderRadius: '16px',
                        backdropFilter: 'blur(10px)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s ease',
                        animation: 'scaleIn 0.6s ease-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)'
                        }
                      } : {}}
                    >
                      <Typography variant="subtitle2" className="text-blue-900 mb-1">
                        Total des dépenses
                      </Typography>
                      <Typography variant={isMobile ? "h5" : "h4"} className="text-blue-700 flex items-center">
                        {formatNumberWithSpaces(totalMontant)}
                        <LocalAtmIcon className={`${isMobile ? 'mobile-stats-icon' : ''} ml-2`} />
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  {/* Table */}
                  <Grid item xs={12} md={12}>
                    <TableContainer 
                      component={Paper} 
                      elevation={0} 
                      className={`${isMobile ? 'mobile-table-container' : 'border'}`}
                      sx={isMobile ? {
                        borderRadius: '16px',
                        overflow: 'hidden',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        marginTop: '16px'
                      } : {}}
                    >
                      <Table>
                        <TableHead className={isMobile ? 'mobile-table-header' : 'bg-gray-100'}>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Libellé</TableCell>
                            <TableCell>Montant</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {depensesBoutic?.length > 0 ? (
                            depensesBoutic.map((row, index) => (
                              <CardDepense key={index} row={row} />
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} align="center" className={`${isMobile ? 'mobile-empty-card py-8' : 'py-8'} text-gray-500`}>
                                Aucune dépense enregistrée
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </div>              

              {/* Pagination */}
              <div className={'flex justify-center mt-6'}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size={isMobile ? "medium" : "large"}
                  sx={isMobile ? {
                    '& .MuiPaginationItem-root': {
                      borderRadius: '8px',
                      margin: '0 2px'
                    }
                  } : {}}
                />
              </div>
            </Box>
          </Paper>

          {/* Add Expense Modal */}
          <Dialog 
            open={open} 
            onClose={() => setOpen(false)}
            fullWidth 
            maxWidth="xs"
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
                Ajouter une dépense
              </Typography>
              <IconButton onClick={() => setOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
              <M_Abonnement />
            ) : (
              <DialogContent className={`${isMobile ? 'mobile-p-4' : 'mt-4'}`}>
                <form onSubmit={onSubmit} className="space-y-4">
                  <MyTextField
                    required
                    fullWidth
                    label="Libellé"
                    name="libelle"
                    onChange={(e) => setFormValues({...formValues, libelle: e.target.value})}
                    value={formValues.libelle}
                    className={`${isMobile ? 'mobile-form-field' : 'bg-white'}`}
                    sx={isMobile ? {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:focus-within': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }
                      }
                    } : {}}
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
                    className={`${isMobile ? 'mobile-date-field' : 'bg-white'}`}
                    sx={isMobile ? {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:focus-within': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }
                      }
                    } : {}}
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
                    className={`${isMobile ? 'mobile-form-field' : 'bg-white'}`}
                    sx={isMobile ? {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:focus-within': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }
                      }
                    } : {}}
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
                    className={`${isMobile ? 'mobile-file-field' : 'bg-white'}`}
                    sx={isMobile ? {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        border: '2px dashed rgba(59, 130, 246, 0.3)',
                        '&:focus-within': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          borderColor: 'rgba(59, 130, 246, 0.6)'
                        }
                      }
                    } : {}}
                  />

                  <div className={`${isMobile ? 'mobile-action-buttons' : 'flex justify-end space-x-2'} pt-4`}>
                    <Button 
                      onClick={() => setOpen(false)} 
                      variant="outlined"
                      className={isMobile ? 'mobile-button' : ''}
                      sx={isMobile ? {
                        borderRadius: '12px',
                        fontWeight: 600,
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
                        }
                      } : {}}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      className={`${isMobile ? 'mobile-button mobile-button-primary' : 'bg-blue-600 hover:bg-blue-700'}`}
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
                      } : {}}
                    >
                      Ajouter
                    </Button>
                  </div>
                </form>
              </DialogContent>
            )}
          </Dialog>
        
      </div>
    );
  }

  return null;
}
