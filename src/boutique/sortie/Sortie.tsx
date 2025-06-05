import { Box, Button, Modal, Pagination, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { ChangeEvent, FormEvent, Fragment, SyntheticEvent, useEffect, useState } from "react";
import { RecupType, SortieType } from "../../typescript/DataType";
import { connect } from "../../_services/account.service";
import { useStoreCart } from "../../usePerso/cart_store";
import { useCreateSortie, useFetchAllSortie, useGetAllEntre, useGetAllSortie, useUpdateSortie } from "../../usePerso/fonction.entre";
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

 
export type TypeText = {
  clientName: string,
  clientAddress: string,
  numeroFac: string,
  clientCoordonne: string,
  invoiceDate: string,
  dueDate: string,
  notes: string,
  invoiceNumber: number,
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
      </Modal>
    </Fragment>
  );
}

export default function Sortie() {
  
  const entreprise_uuid = useStoreUuid((state) => state.selectedId)
  const {unUser} = useFetchUser(connect)
  
  const [showInvoice, setShowInvoice] = useState(false); // État pour afficher ou masquer la section de facture

  const handleOnClick = () => {
    setShowInvoice(true); // Affiche la section de facture lorsque le bouton est cliqué
  };
  const handleOpenClick = () => {
    setShowInvoice(false); // Affiche la section de facture lorsque le bouton est cliqué
  };

  const {unEntreprise: entreprise} = useFetchEntreprise(entreprise_uuid!)
  
  const setSorties = useStoreCart(state => state.setSorties)

  const top = {
    all: "all",
    user_id: connect
  }
  // const {entres} = useEntrer(top)
  // const {entresEntreprise: entres} = useGetAllEntre(connect)
  const {sorties} = useFetchAllSortie(top)
  const {sortiesEntreprise, isLoading, isError} = useGetAllSortie(entreprise_uuid!)

  
  const {ajoutSortie} = useCreateSortie()
  
  const itemsPerPage = 25; // Nombre d'éléments par page

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
      setSorties(sorties);
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
        invoiceNumber: 0,
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
    
      const {entresEntreprise: entres, refetch} = useGetAllEntre(connect, entreprise_uuid!)
      
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
        return <Box sx={{ width: 300 }}>
        <Skeleton />
        <Skeleton animation="wave" />
        <Skeleton animation={false} />
      </Box>
      }

      if (isError) {
        window.location.reload();
        return <div>Error ...</div>
      }

      if (sortiesEntreprise) {        
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="mb-8">
              <Nav />
            </div>

              <Paper elevation={0} className="rounded-lg overflow-hidden">
                <div className="p-6 space-y-6">
                  {/* Header Section */}
                  <div className="flex justify-between items-center border-b pb-6">
                    <Typography variant="h4" className="font-semibold text-gray-900">
                      Gestion des Sorties
                        </Typography>
                    <div className="flex space-x-3">
                      <Button 
                        variant="contained"
                        color="primary"
                      onClick={() => {
                        handleSaveSorties();
                        handleOnClick();
                      }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Créer Facture
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleOpenClick}
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>

                  {/* Main Form Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <TextField
                      fullWidth
                      label="Numéro de Facture"
                      name="numeroFac"
                            variant="outlined"
                      onChange={onChan}
                      className="bg-white"
                          />
                          <TextField
                      fullWidth
                      label="Nom du Client"
                      name="clientName"
                            variant="outlined"
                      onChange={onChan}
                      className="bg-white"
                    />
                          </div>

                  {/* Actions Section */}
                  <div className="flex flex-wrap gap-4 mt-6">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={toggleModal}
                      startIcon={<LocalAtmIcon />}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Appliquer Remise
                    </Button>
                    <Button
                      variant="contained"
                      onClick={toggleModalPay}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Paiement
                            </Button>
                    <Button
                      variant="contained"
                      onClick={handleOpen}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Remise Facture
                            </Button>
                    </div>                
                    
                  {/* Date Filter Section */}
                  {(unUser.role === 1 || unUser.role === 2) && (
                    <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
                          <TextField
                            label="Date de début"
                            type="date"
                            value={selectedStartDate}
                            onChange={handleStartDateChange}
                            InputLabelProps={{ shrink: true }}
                        className="bg-white"
                          />
                          <TextField
                            label="Date de fin"
                            type="date"
                            value={selectedEndDate}
                            onChange={handleEndDateChange}
                            InputLabelProps={{ shrink: true }}
                        className="bg-white"
                      />
                    </div>
                  )}

                  {/* Statistics Section */}
                  {unUser.role === 1 && (
                    <Paper elevation={1} className="p-4 bg-blue-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <LocalAtmIcon color="primary" />
                          <Typography variant="h6">
                            CA: {formatNumberWithSpaces(totalPrice)}
                          </Typography>
                        </div>
                        <div className="flex items-center space-x-2">
                          <QuantityLimitsIcon color="primary" />
                          <Typography variant="h6">
                            Qté: {formatNumberWithSpaces(totalQte)}
                          </Typography>
                        </div>
                      </div>
                    </Paper>
                  )}

                  {/* Table Section */}
                  <div className="mt-6">
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
                  <div className="flex justify-center mt-6">
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                      size="large"
                      />
                    </div>

                  {/* Notes Section */}
                  <div className="mt-6">
                    <Typography variant="h6" className="mb-2">
                      Notes additionnelles
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                    name="notes"
                      placeholder="Ajouter des notes ou commentaires pour cette facture..."
                      variant="outlined"
                    onChange={onChan}
                      className="bg-white"
                    />
                  </div>
                </div>
              </Paper>

              {/* Invoice Preview Section */}
              {showInvoice && entreprise && (
                <div className="mt-8">
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
                <Box sx={style}>
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
                    />
                    <TextField
                      fullWidth
                      label="Pourcentage"
                      variant="outlined"
                      value={percentageDiscount}
                      onChange={(e) => setPercentageDiscount(normalizeInput(e.target.value))}
                      helperText="Ex: 2% ou 5%"
                    />
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button variant="outlined" onClick={toggleModal}>
                        Annuler
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleApplyDiscount}
                      >
                        Appliquer
                      </Button>
                    </div>
                  </div>
                </Box>
              </Modal>

              <Modal open={isModalOpenPay} onClose={toggleModalPay}>
                <Box sx={style}>
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
                    className="mb-4"
                  />
                  <div className="flex justify-end space-x-3">
                    <Button variant="outlined" onClick={toggleModalPay}>
                      Annuler
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleApplyPayer}
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
                }}>
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="border-b pb-4">
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
                      sx={{
                        backgroundColor: 'transparent',
                        '& .MuiTable-root': {
                          borderCollapse: 'separate',
                          borderSpacing: '0 4px',
                        },
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
                          <TableRow>
                            <TableCell className="font-semibold">Désignation</TableCell>
                            <TableCell align="right" className="font-semibold">Quantité</TableCell>
                            <TableCell align="right" className="font-semibold">Prix unitaire</TableCell>
                            <TableCell align="right" className="font-semibold">Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectSorties.map((post, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-gray-900">
                                <div className="flex flex-col">
                                  <span className="font-medium">{post.ref}</span>
                                  <span className="text-gray-500 text-sm">{post.categorie_libelle}</span>
                                </div>
                              </TableCell>
                              <TableCell align="right">{post.qte}</TableCell>
                              <TableCell align="right">{formatNumberWithSpaces(post.pu)} F</TableCell>
                              <TableCell align="right" className="font-medium">
                                {formatNumberWithSpaces(post.prix_total)} F
                              </TableCell>
                            </TableRow>
                          ))}

                          {/* Summary Rows */}
                          <TableRow sx={{ backgroundColor: '#f8fafc !important' }}>
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
                          <TableRow sx={{ backgroundColor: '#f8fafc !important' }}>
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
                          <TableRow sx={{ backgroundColor: '#f8fafc !important' }}>
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
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button
                        variant="outlined"
                        onClick={handleClose}
                        className="text-gray-600 border-gray-300 hover:bg-gray-50"
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
