import { Box, Button, Modal, Pagination, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Grid } from "@mui/material";
import { ChangeEvent, FormEvent, Fragment, SyntheticEvent, useEffect, useState } from "react";
import { RecupType, SortieType } from "../../typescript/DataType";
import { connect } from "../../_services/account.service";
import { useStoreCart } from "../../usePerso/cart_store";
import { useCreateSortie, useGetAllEntre, useGetAllSortie, useUpdateSortie } from "../../usePerso/fonction.entre";
import Fact from "../factureCard/Fact";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import TableSortie from "./TableSortie";
import QuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import { useFetchEntreprise, useFetchUser } from "../../usePerso/fonction.user";
import Nav from "../../_components/Button/Nav";
import { useStoreUuid } from "../../usePerso/store";
import { formatNumberWithSpaces } from "../../usePerso/fonctionPerso";
import { SingleValue } from 'react-select';
import { format } from "date-fns";
import './mobile-sortie.css';

 
export type TypeText = {
  clientName: string,
  clientAddress: string,
  numeroFac: string,
  clientCoordonne: string,
  invoiceDate: string,
  dueDate: string,
  notes: string,
  invoiceNumber?: number,
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '600px',
  bgcolor: 'background.paper',
  borderRadius: '8px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  p: 4,
};

function ChildModal() {
  const reset = useStoreCart(state => state.reset)
  const {updateSortie} = useUpdateSortie()
  const selectedIds = useStoreCart(state => state.selectedIds)
  const sortiess = useStoreCart(state => state.sorties);
  const selectSorties = sortiess.filter((sor) => sor.id !== undefined && selectedIds.has(sor.id as number));
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    const idsToUpdate = selectSorties.map(sor => sor.id);
    updateSortie(idsToUpdate)
    reset()
    setOpen(false);
  };

  return (
    <Fragment>
      <Button onClick={handleOpen}>Confirmer</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: 200 }}>
          <h1 id="child-modal-title">Confirmer la remie</h1>
          {/* <p id="child-modal-description">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit.
          </p> */}
          <Button onClick={handleClose}>Oui</Button>
        </Box>
      </Modal>s
    </Fragment>
  );
}

export default function Sortie() {
  
  const entreprise_uuid = useStoreUuid((state) => state.selectedId)
  const {unUser} = useFetchUser()
  const [isMobile, setIsMobile] = useState(false);
  
  const [showInvoice, setShowInvoice] = useState(false); // État pour afficher ou masquer la section de facture

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleOnClick = () => {
    setShowInvoice(true); // Affiche la section de facture lorsque le bouton est cliqué
  };
  const handleOpenClick = () => {
    setShowInvoice(false); // Affiche la section de facture lorsque le bouton est cliqué
  };

  const {unEntreprise: entreprise} = useFetchEntreprise(entreprise_uuid)
  
  const setSorties = useStoreCart(state => state.setSorties)

  const {sortiesEntreprise, isLoading, isError} = useGetAllSortie(entreprise_uuid!)
  
  const {ajoutSortie} = useCreateSortie()
  
  const itemsPerPage = isMobile ? 10 : 25; // Nombre d'éléments par page

  // État pour la page courante et les éléments par page
  const [currentPage, setCurrentPage] = useState(1);

  // États pour les dates de recherche
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');

  // Filtrage entre les deux dates sélectionnées
  const filteredBoutiques = sortiesEntreprise?.filter((item) => {
    if (!item.date) {
      return false; // Ignore les éléments sans date valide
    }
  
    const itemDate = new Date(item.date).getTime();
    const startDate = selectedStartDate ? new Date(selectedStartDate).getTime() : null;
    const endDate = selectedEndDate ? new Date(selectedEndDate).getTime() : null;
  
    return (
      (startDate === null || itemDate >= startDate) &&
      (endDate === null || itemDate <= endDate)
    );
  });

  const reversedSorties = filteredBoutiques?.slice().sort((a: RecupType, b: RecupType) => {
    if (a.id === undefined) return 1;
    if (b.id === undefined) return -1;
    return Number(b.id) - Number(a.id);
  });

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(reversedSorties.length / itemsPerPage);

  const reversedSort = reversedSorties.filter((info: any) => info.is_remise === false);

  const totalPrice = reversedSort?.reduce((acc, row: RecupType) => {
    const price = (row.qte !== undefined && row.pu !== undefined) ? row.qte * row.pu : 0;
    return acc + price;
  }, 0);

  const totalQte = reversedSorties?.reduce((acc, row: RecupType) => {
    const price = (row.qte !== undefined && row.pu !== undefined) ? row.qte : 0;
    return acc + price;
  }, 0);

  // Récupération des éléments à afficher sur la page courante
  const sortiesBoutic = reversedSorties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Gestion du changement des dates
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedStartDate(event.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedEndDate(event.target.value);
    setCurrentPage(1);
  };

  // Gestion du changement de page
  const handlePageChange = (_: ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

    const handleSaveSorties = () => {
      setSorties(sortiesEntreprise);
    };
    
    const [formValues, setFormValues] = useState<SortieType>({
      user_id: '',
      qte: 0,
      pu: 0,
      entre_id: '',
      client_id: '',
      });
    
      const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues({
          ...formValues,
          [name]: value,
        });
      };

      const [texte, setNom] = useState<TypeText>({
        clientName: '',
        clientAddress: '',
        clientCoordonne: '',
        invoiceDate: '',
        dueDate: '',
        notes: '',
        numeroFac: '',
      });

      const onChan = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNom({
          ...texte,
          [name]: value,
        });
      };

      const [amount, setAmount] = useState<number>(0);

      useEffect(() => {
        const calculateAmount = () => {
          setAmount(formValues.pu * formValues.qte);
        };
    
        calculateAmount();
      }, [amount, formValues.pu, formValues.qte, setAmount]);

      const handleAutoCompleteChange = (_: SyntheticEvent<Element, Event>,
        value: string | RecupType | null,
        // reason: AutocompleteChangeReason
        ) => {
        if (typeof value === 'object' && value !== null) {
          setFormValues({
            ...formValues,
            entre_id: value.uuid ?? '',
          });
        } else {
          setFormValues({
            ...formValues,
            entre_id: '',
          });
        }
      };

      const itemDate = format(new Date(), 'yyyy-dd-MM');

      const handleAutoClientChange = (_: SyntheticEvent<Element, Event>,
        value: string | RecupType | null,
        // reason: AutocompleteChangeReason
        ) => {
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

      const [selectedOption, setSelectedOption] = useState<RecupType | null >(null);
      const [selectedClient, setSelectedClient] = useState<RecupType | null >(null);

      const [clientInfo, setClientInfo] = useState({
        clientName: '',
        clientAddress: '',
        clientCoordonne: '',
        clientNumero: 0,
      });

      const handleChange = (selected: SingleValue<RecupType>) => {
        // Assurez-vous que "selected" contient la clé du prix unitaire, par exemple "pu"
        if (selected) {
            formValues["entre_id"] = selected.uuid; // Attribue l'ID sélectionné
            formValues["pu"] = selected.pu || 0;  // Met à jour le prix unitaire si disponible
            formValues["is_prix"] = selected.is_prix;  // Met à jour le prix unitaire si disponible
        } else {
            formValues["entre_id"] = ""; // Réinitialise si aucune option n'est sélectionnée
            formValues["pu"] = 0;       // Réinitialise également le prix unitaire
        }
        setSelectedOption(selected); // Met à jour l'état de l'option sélectionnée
      };

      const handleClient = (selected: SingleValue<RecupType>) => {
        formValues['client_id'] = selected?.uuid;
        setSelectedClient(selected);
    
        if (selected) {
          setClientInfo({
            clientName: selected.nom || '', // Remplacez par la clé appropriée pour le nom
            clientAddress: selected.adresse || '', // Remplacez par la clé appropriée pour l'adresse
            clientCoordonne: selected.adresse || '', // Remplacez par la clé appropriée pour l'adresse
            clientNumero: selected.numero || 0, // Remplacez par la clé appropriée pour l'adresse
          });
        } else {
          setClientInfo({ clientName: '', clientAddress: '', clientCoordonne: '', clientNumero: 0 });
        }
      };
    
      const {entresEntreprise: entres, refetch} = useGetAllEntre(entreprise_uuid!)
      
      const ent = entres.filter(info => info.qte !== 0 && info.is_sortie);
      
      const [scannedCode, setScannedCode] = useState<string>('');
      const [open, openchange] = useState(false);

      const functionopen = () => {
        openchange(true);
      };
      const closeopen = () => {
        openchange(false);
      };

      const handleScanResult = (code: string) => {
        setScannedCode(code);
        // Optionnel : fermer le dialog après scan
        openchange(false);
      };
      
      const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        formValues["user_id"]= connect

        ajoutSortie(formValues)

        setFormValues({
          user_id: '',
          qte: 0,
          pu: 0,
          entre_id: '',          
        })

        setSelectedOption(null);
        setSelectedClient(null);
        setScannedCode("")

        await refetch();
      };

      // Pour la remise
        
        const selectedIds = useStoreCart(state => state.selectedIds)
        const sortiess = useStoreCart(state => state.sorties);
        const selectSorties = sortiess.filter((sor) => sor.id !== undefined && selectedIds.has(sor.id as number));
        // const totalPrix = selectSorties.reduce((sum, sor) => sum + sor.prix_total, 0);
      
        const total = selectSorties?.reduce((acc, sortie) => {
          // Convertir prix_total en nombre ou utiliser 0 si invalide
          const prixTotal = sortie.prix_total ? parseFloat(String(sortie.prix_total)) : 0;
          return acc + prixTotal;
        }, 0);

        const [isModalOpen, setIsModalOpen] = useState(false);
        const [isModalOpenPay, setIsModalOpenPay] = useState(false);
        const [fixedDiscount, setFixedDiscount] = useState<number | string>(""); // Remise fixe
        const [payDiscount, setPayDiscount] = useState<number | string>(""); // Remise fixe
        const [percentageDiscount, setPercentageDiscount] = useState<number | string>(""); // Remise en %
        const [discountedTotal, setDiscountedTotal] = useState(total); // Total avec remise
        const [payerTotal, setPayerTotal] = useState(total); // Total avec remise
      
        // Normaliser la saisie (remplace ',' par '.')
        const normalizeInput = (value: string) => value.replace(",", ".");
      
        // Calculer le nouveau total
        const calculateDiscountedTotal = () => {
          let newTotal = total;
          const fixed = parseFloat(normalizeInput(fixedDiscount as string)) || 0;
          const percentage = parseFloat(normalizeInput(percentageDiscount as string)) || 0;
      
          if (fixed) {
            newTotal -= fixed;
          }
          if (percentage) {
            newTotal -= (percentage / 100) * total;
          }
          setDiscountedTotal(Math.max(0, newTotal)); // Empêche un total négatif
        };

        const calculatePayerTotal = () => {
          let newTotal = total;
          const fixed = parseFloat(normalizeInput(payDiscount as string)) || 0;
          
          if (fixed) {
            newTotal -= fixed;
          }
          
          setPayerTotal(Math.max(0, newTotal)); // Empêche un total négatif
        };
      
        // Ouvrir/fermer le modal
        const toggleModal = () => setIsModalOpen(!isModalOpen);
        const toggleModalPay = () => setIsModalOpenPay(!isModalOpenPay);
      
        // Pour la remise des facture
        const [openF, setOpenF] = useState(false);
        const handleOpen = () => {
          setOpenF(true);
        };
        const handleClose = () => {
          setOpenF(false);
        };
        
        // Appliquer la remise
        const handleApplyDiscount = () => {
          calculateDiscountedTotal();
          calculatePayerTotal();
          toggleModal();
        };
        const handleApplyPayer = () => {
          calculatePayerTotal();
          toggleModalPay();
        };
      // fin
      if (isLoading) {
        return (
          <Box className={`${isMobile ? 'mobile-p-4' : 'w-300'}`}>
            <Skeleton className="mobile-loading" />
            <Skeleton animation="wave" className="mobile-loading" />
            <Skeleton animation={false} className="mobile-loading" />
          </Box>
        );
      }

      if (isError) {
        window.location.reload();
        return (
          <div className={`${isMobile ? 'mobile-p-4' : ''}`}>
            <Typography variant="h6" color="error" className="mobile-alert">
              Error ...
            </Typography>
          </div>
        );
      }

      if (sortiesEntreprise) {        
        return (
          <div className={`min-h-screen ${isMobile ? '' : ''}`}>
            <div className={`${isMobile ? 'px-4 py-6' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
              <div className={`${isMobile ? 'mobile-m-4' : 'mb-8'}`}>
                {/* <Nav /> */}
              </div>

              <Paper 
                elevation={0} 
                // className={`${isMobile ? 'mobile-header-container' : 'rounded-lg overflow-hidden'}`}
                sx={ {
                  // background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                  // backdropFilter: 'blur(10px)',
                  // border: '1px solid rgba(255, 255, 255, 0.2)',
                  // borderRadius: '20px',
                  // bgcolor: 'rgba(255,255,255,0.06)', // semi-transparent. Mettre 'transparent' pour totalement transparent
                  // backdropFilter: 'blur(8px)',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  marginTop: '24px',
                  bgcolor: 'rgba(255,255,255,0.06)', 
                } }
              >
                <div className={`${isMobile ? 'mobile-p-4' : 'p-6'} space-y-6`}>
                  {/* Header Section */}
                  <div className={`${isMobile ? 'flex flex-col space-y-4' : 'flex justify-between items-center'} border-b pb-6`}>
                    <Typography 
                      variant={isMobile ? "h5" : "h4"} 
                      className={`${isMobile ? 'font-semibold text-gray-50' : 'font-semibold text-gray-50'}`}
                      // sx={isMobile ? {
                      //   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      //   WebkitBackgroundClip: 'text',
                      //   WebkitTextFillColor: 'transparent',
                      //   backgroundClip: 'text',
                      //   fontWeight: 700,
                      //   textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                      // } : {}}
                    >
                      Gestion des Sorties
                    </Typography>
                    <div className={`${isMobile ? 'mobile-action-buttons' : 'flex space-x-3'}`}>
                      <Button 
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          handleSaveSorties();
                          handleOnClick();
                        }}
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
                        Créer Facture
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleOpenClick}
                        className={`${isMobile ? 'mobile-button mobile-button-danger' : 'border-red-500 text-red-500 hover:bg-red-50'}`}
                        sx={isMobile ? {
                          borderRadius: '12px',
                          fontWeight: 600,
                          textTransform: 'none',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: 'white',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                            background: 'linear-gradient(135deg, #dc2626, #b91c1c)'
                          }
                        } : {}}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>

                  {/* Main Form Section */}
                  <div className={`${isMobile ? 'mobile-form-section' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}`}>
                    <Grid 
                      container 
                      spacing={isMobile ? 2 : 3} 
                      className={isMobile ? 'mobile-grid' : ''}
                      sx={{
                        '& .MuiGrid-item': {
                          padding: isMobile ? '8px' : '12px'
                        }
                      }}
                    >
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Numéro de Facture"
                          name="numeroFac"
                          variant="outlined"
                          onChange={onChan}
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
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Nom du Client"
                          name="clientName"
                          variant="outlined"
                          onChange={onChan}
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
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Numero du Client"
                          name="invoiceNumber"
                          variant="outlined"
                          onChange={onChan}
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
                      </Grid>

                    </Grid>
                  </div>

                  {/* Actions Section */}
                  <div className={`${isMobile ? 'mobile-actions-section' : 'flex flex-wrap gap-4 mt-6'}`}>
                    <div className={`${isMobile ? 'mobile-action-buttons' : 'flex flex-wrap gap-4'}`}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={toggleModal}
                        startIcon={<LocalAtmIcon />}
                        className={`${isMobile ? 'mobile-button mobile-button-warning' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        sx={isMobile ? {
                          borderRadius: '12px',
                          fontWeight: 600,
                          textTransform: 'none',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                            background: 'linear-gradient(135deg, #d97706, #b45309)'
                          }
                        } : {}}
                      >
                        Appliquer Remise
                      </Button>
                      <Button
                        variant="contained"
                        onClick={toggleModalPay}
                        className={`${isMobile ? 'mobile-button mobile-button-success' : 'bg-green-600 hover:bg-green-700'}`}
                        sx={isMobile ? {
                          borderRadius: '12px',
                          fontWeight: 600,
                          textTransform: 'none',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                            background: 'linear-gradient(135deg, #059669, #047857)'
                          }
                        } : {}}
                      >
                        Paiement
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleOpen}
                        className={`${isMobile ? 'mobile-button mobile-button-primary' : 'bg-purple-600 hover:bg-purple-700'}`}
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
                        Remise Facture
                      </Button>
                    </div>
                  </div>                
                  
                  {/* Date Filter Section */}
                  {(unUser.role === 1 || unUser.role === 2) && (
                    <div className={`${isMobile ? 'mobile-filters-section' : 'flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow-sm'}`}>
                      <Grid 
                        container 
                        spacing={isMobile ? 2 : 3} 
                        className={isMobile ? 'mobile-grid' : ''}
                      >
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Date de début"
                            type="date"
                            value={selectedStartDate}
                            onChange={handleStartDateChange}
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
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Date de fin"
                            type="date"
                            value={selectedEndDate}
                            onChange={handleEndDateChange}
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
                        </Grid>
                      </Grid>
                    </div>
                  )}

                  {/* Statistics Section */}
                  {unUser.role === 1 && (
                    <Paper 
                      elevation={1} 
                      className={`${isMobile ? 'mobile-stats-card' : 'p-4 bg-blue-50'}`}
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
                      <div className={`${isMobile ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
                        <div className="flex items-center space-x-2">
                          <LocalAtmIcon className={`${isMobile ? 'mobile-stats-icon' : ''}`} color="primary" />
                          <Typography variant={isMobile ? "h6" : "h6"}>
                            CA: {formatNumberWithSpaces(totalPrice)}
                          </Typography>
                        </div>
                        <div className="flex items-center space-x-2">
                          <QuantityLimitsIcon className={`${isMobile ? 'mobile-stats-icon' : ''}`} color="primary" />
                          <Typography variant={isMobile ? "h6" : "h6"}>
                            Qté: {formatNumberWithSpaces(totalQte)}
                          </Typography>
                        </div>
                      </div>
                    </Paper>
                  )}

                  {/* Table Section */}
                  <div className={`${isMobile ? 'mobile-m-4' : 'mt-6'}`}>
                    <TableSortie 
                    onSubmit={onSubmit}
                    onChange={onChange}
                    formValues={formValues}
                    amount={amount}
                    handleAutoCompleteChange={handleAutoCompleteChange}
                    handleAutoClientChange={handleAutoClientChange}
                    handleSaveSorties={handleSaveSorties}
                    handleChange={handleChange}
                    handleClient={handleClient}
                    selectedOption={selectedOption}
                    selectedClient={selectedClient}
                    list={sortiesBoutic}
                    ent={ent}
                    scannedCode={scannedCode}
                    functionopen={functionopen}
                    open={open}
                    handleScanResult={handleScanResult}
                    closeopen={closeopen}
                    />
                  </div>

                  {/* Pagination */}
                  <div className={`${isMobile ? 'mobile-pagination' : 'flex justify-center mt-6'}`}>
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

                  {/* Notes Section */}
                  <div className={`${isMobile ? 'mobile-notes-section' : 'mt-6'}`}>
                    <Typography variant={isMobile ? "h6" : "h6"} className="mb-2 text-gray-50">
                      Notes additionnelles
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={isMobile ? 3 : 4}
                      name="notes"
                      placeholder="Ajouter des notes ou commentaires pour cette facture..."
                      variant="outlined"
                      onChange={onChan}
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
                  </div>
                </div>
              </Paper>

              {/* Invoice Preview Section */}
              {showInvoice && entreprise && (
                <div className={`${isMobile ? 'mobile-preview-section' : 'mt-8'}`}>
                  <Fact               
                  clientName={clientInfo.clientName || texte.clientName}
                  clientAddress={clientInfo.clientAddress || texte.clientAddress}
                  clientCoordonne={clientInfo.clientCoordonne || texte.clientCoordonne}
                  invoiceNumber={clientInfo.clientNumero || texte.invoiceNumber}
                  invoiceDate={texte.invoiceDate || itemDate}
                  numeroFac={texte.numeroFac}
                  dueDate={texte.dueDate}
                  notes={texte.notes}
                  post={entreprise}
                  discountedTotal={discountedTotal}
                  payerTotal={payerTotal}
                  />
                </div>
              )}

              {/* Modals */}
              <Modal open={isModalOpen} onClose={toggleModal}>
                <Box 
                  sx={isMobile ? {
                    ...style,
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    animation: 'bounceIn 0.6s ease-out'
                  } : style}
                  className={isMobile ? 'mobile-modal' : ''}
                >
                  <Typography variant="h6" className="mb-4">
                    Appliquer une remise
                  </Typography>
                  <div className="space-y-4">
                    <TextField
                      fullWidth
                      label="Montant fixe"
                      variant="outlined"
                      value={fixedDiscount}
                      onChange={(e) => setFixedDiscount(normalizeInput(e.target.value))}
                      helperText="Ex: 1500 ou 85.45"
                      className={isMobile ? 'mobile-form-field' : ''}
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
                    <TextField
                      fullWidth
                      label="Pourcentage"
                      variant="outlined"
                      value={percentageDiscount}
                      onChange={(e) => setPercentageDiscount(normalizeInput(e.target.value))}
                      helperText="Ex: 2% ou 5%"
                      className={isMobile ? 'mobile-form-field' : ''}
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
                    <div className={`${isMobile ? 'mobile-action-buttons' : 'flex justify-end space-x-3 pt-4'}`}>
                      <Button 
                        variant="outlined" 
                        onClick={toggleModal}
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
                        variant="contained"
                        color="primary"
                        onClick={handleApplyDiscount}
                        className={`${isMobile ? 'mobile-button mobile-button-primary' : ''}`}
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
                        Appliquer
                      </Button>
                    </div>
                  </div>
                </Box>
              </Modal>

              <Modal open={isModalOpenPay} onClose={toggleModalPay}>
                <Box 
                  sx={isMobile ? {
                    ...style,
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    animation: 'bounceIn 0.6s ease-out'
                  } : style}
                  className={isMobile ? 'mobile-modal' : ''}
                >
                  <Typography variant="h6" className="mb-4">
                    Enregistrer le paiement
                  </Typography>
                  <TextField
                    fullWidth
                    label="Montant payé"
                    variant="outlined"
                    value={payDiscount}
                    onChange={(e) => setPayDiscount(normalizeInput(e.target.value))}
                    helperText="Ex: 1500 ou 85.45"
                    className={`${isMobile ? 'mobile-form-field mb-4' : 'mb-4'}`}
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
                  <div className={`${isMobile ? 'mobile-action-buttons' : 'flex justify-end space-x-3'}`}>
                    <Button 
                      variant="outlined" 
                      onClick={toggleModalPay}
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
                      variant="contained"
                      color="primary"
                      onClick={handleApplyPayer}
                      className={`${isMobile ? 'mobile-button mobile-button-success' : ''}`}
                      sx={isMobile ? {
                        borderRadius: '12px',
                        fontWeight: 600,
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                          background: 'linear-gradient(135deg, #059669, #047857)'
                        }
                      } : {}}
                    >
                      Confirmer
                    </Button>
                  </div>
                </Box>
              </Modal>

              {/* Confirmation Modal */}
              <Modal
                open={openF}
                onClose={handleClose}
                aria-labelledby="confirmation-modal-title"
                aria-describedby="confirmation-modal-description"
              >
                <Box sx={{
                  ...style,
                  width: '90%',
                  maxWidth: '800px',
                  maxHeight: '90vh',
                  overflow: 'auto',
                  ...(isMobile && {
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    animation: 'bounceIn 0.6s ease-out'
                  })
                }}
                className={isMobile ? 'mobile-confirmation-section' : ''}
              >
                  <div className="space-y-6">
                    {/* Header */}
                    <div className={`${isMobile ? 'mobile-modal-header' : 'border-b pb-4'}`}>
                      <Typography
                        id="confirmation-modal-title"
                        variant="h5"
                        component="h2"
                        className="font-semibold text-gray-900"
                      >
                        Confirmation de Remise
                      </Typography>
                      <Typography
                        id="confirmation-modal-description"
                        variant="subtitle1"
                        className="text-gray-600 mt-1"
                      >
                        Veuillez vérifier les détails de la remise avant de confirmer
                      </Typography>
                    </div>

                    {/* Table Container */}
                    <TableContainer
                      component={Paper}
                      elevation={0}
                      className={isMobile ? 'mobile-table-container' : ''}
                      sx={{
                        backgroundColor: 'transparent',
                        '& .MuiTable-root': {
                          borderCollapse: 'separate',
                          borderSpacing: '0 4px',
                        },
                        ...(isMobile && {
                          borderRadius: '16px',
                          overflow: 'hidden',
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        })
                      }}
                    >
                      <Table
                        sx={{
                          minWidth: '100%',
                          '& .MuiTableCell-root': {
                            borderBottom: 'none',
                            padding: '16px',
                          },
                          '& .MuiTableRow-root': {
                            backgroundColor: '#fff',
                            '&:hover': {
                              backgroundColor: '#f8fafc',
                            },
                          },
                          '& .MuiTableHead-root .MuiTableRow-root': {
                            backgroundColor: '#f1f5f9',
                          },
                        }}
                      >
                        <TableHead>
                          <TableRow className={isMobile ? 'mobile-table-header' : ''}>
                            <TableCell className={`${isMobile ? 'mobile-table-cell' : ''} font-semibold`}>Désignation</TableCell>
                            <TableCell align="right" className={`${isMobile ? 'mobile-table-cell' : ''} font-semibold`}>Quantité</TableCell>
                            <TableCell align="right" className={`${isMobile ? 'mobile-table-cell' : ''} font-semibold`}>Prix unitaire</TableCell>
                            <TableCell align="right" className={`${isMobile ? 'mobile-table-cell' : ''} font-semibold`}>Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectSorties.map((post, index) => (
                            <TableRow key={index}>
                              <TableCell className={`${isMobile ? 'mobile-table-cell' : ''} text-gray-900`}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{post.ref}</span>
                                  <span className="text-gray-500 text-sm">{post.categorie_libelle}</span>
                                </div>
                              </TableCell>
                              <TableCell align="right" className={isMobile ? 'mobile-table-cell' : ''}>{post.qte}</TableCell>
                              <TableCell align="right" className={isMobile ? 'mobile-table-cell' : ''}>{formatNumberWithSpaces(post.pu)} F</TableCell>
                              <TableCell align="right" className={`${isMobile ? 'mobile-table-cell' : ''} font-medium`}>
                                {formatNumberWithSpaces(post.prix_total)} F
                              </TableCell>
                            </TableRow>
                          ))}

                          {/* Summary Rows */}
                          <TableRow className={isMobile ? 'mobile-total-row' : ''} sx={{ backgroundColor: '#f8fafc !important' }}>
                            <TableCell rowSpan={3} />
                            <TableCell
                              colSpan={2}
                              align="right"
                              sx={{ color: '#64748b', fontWeight: 600 }}
                            >
                              Prix Total
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ color: '#0f172a', fontWeight: 600 }}
                            >
                              {formatNumberWithSpaces(total)} F
                            </TableCell>
                          </TableRow>
                          <TableRow className={isMobile ? 'mobile-total-row' : ''} sx={{ backgroundColor: '#f8fafc !important' }}>
                            <TableCell
                              colSpan={2}
                              align="right"
                              sx={{ color: '#64748b', fontWeight: 600 }}
                            >
                              Remise Appliquée
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ color: '#dc2626', fontWeight: 600 }}
                            >
                              - {formatNumberWithSpaces(total - discountedTotal)} F
                            </TableCell>
                          </TableRow>
                          <TableRow className={isMobile ? 'mobile-total-row' : ''} sx={{ backgroundColor: '#f8fafc !important' }}>
                            <TableCell
                              colSpan={2}
                              align="right"
                              sx={{ color: '#64748b', fontWeight: 600 }}
                            >
                              Montant Final
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ color: '#059669', fontWeight: 600, fontSize: '1.1em' }}
                            >
                              {formatNumberWithSpaces(discountedTotal)} F
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Actions */}
                    <div className={`${isMobile ? 'mobile-action-buttons' : 'flex justify-end space-x-3'} pt-4 border-t`}>
                      <Button
                        variant="outlined"
                        onClick={handleClose}
                        className={`${isMobile ? 'mobile-button' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
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
                      <ChildModal />
                    </div>
                  </div>
                </Box>
              </Modal> 
            </div>
          </div>
        );
      }
}
