import { Box, Button, Pagination, Paper, Skeleton, TextField, Typography, Grid } from "@mui/material";
import { ChangeEvent, FormEvent, SyntheticEvent, useEffect, useState } from "react";
import { RecupType, SortieType } from "../../typescript/DataType";
import { connect } from "../../_services/account.service";
import { useStoreCart } from "../../usePerso/cart_store";
import { useCreateSortie, useGetAllEntre, useGetAllSortie } from "../../usePerso/fonction.entre";
import Fact from "../factureCard/Fact";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import TableSortie from "./TableSortie";
import QuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import { useFetchEntreprise, useFetchUser } from "../../usePerso/fonction.user";
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

      const [amount, setAmount] = useState<number>(0);

      useEffect(() => {
        const calculateAmount = () => {
          setAmount(formValues.pu && formValues.qte ? Number(formValues.pu) * Number(formValues.qte) : 0 );
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
          qte: '',
          pu: '',
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

        const [discountedTotal] = useState(total); // Total avec remise
        const [payerTotal] = useState(total); // Total avec remise
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
          <div>            

            <Paper 
              elevation={0} 
              // className={`${isMobile ? 'mobile-header-container' : 'rounded-lg overflow-hidden'}`}
              sx={ {
                
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
                
                {/* Date Filter Section */}
                {(unUser.role === 1 || unUser.role === 2) && (
                  
                  <Grid 
                    container 
                    spacing={isMobile ? 2 : 3} 
                    // className={isMobile ? 'mobile-grid' : ''}
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

              </div>
            </Paper>

            {/* Invoice Preview Section */}
            {showInvoice && entreprise && (
              <div className={`${isMobile ? 'mobile-preview-section' : 'mt-8'}`}>
                <Fact              
                invoiceDate={itemDate}
                post={entreprise}
                discountedTotal={discountedTotal}
                payerTotal={payerTotal}
                />
              </div>
            )}
          </div>
          
        );
      }
}
