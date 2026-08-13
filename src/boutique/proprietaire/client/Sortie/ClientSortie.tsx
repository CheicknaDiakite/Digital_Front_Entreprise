import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { UuType } from '../../../../typescript/Account'
import CardClientSortie from './CardClientSortie';
import MyTextField from '../../../../_components/Input/MyTextField';
import { ChangeEvent, FormEvent, SyntheticEvent, useEffect, useState, useMemo } from 'react';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import QuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CloseIcon from '@mui/icons-material/Close';
import { RecupType, SortieType } from '../../../../typescript/DataType';
import { useCreateSortie, useFetchAllSortie, useGetAllEntre } from '../../../../usePerso/fonction.entre';
import { useFetchEntreprise, useFetchUser, useUnClient } from '../../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../../usePerso/store';
import { formatNumberWithSpaces, isLicenceExpired } from '../../../../usePerso/fonctionPerso';
import Fact from '../../../factureCard/Fact';
import { useStoreCart } from '../../../../usePerso/cart_store';
import { TypeText } from '../../../sortie/Sortie';
import { format } from 'date-fns';
import BarcodeScanner from '../../../../_components/Input/BarcodeScanner';
import { useAppSettings } from '../../../../themes/AppSettingsContext';

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

export default function ClientSortie(uuid: UuType) {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDarkText = theme.palette.mode === 'dark' || showBackground;
  const { unUser } = useFetchUser()
  const top = {
    user_id: unUser.uuid,
    client_id: uuid.uuid,
  }
  const { unClient } = useUnClient(uuid.uuid!);

  // const {ajoutEntre} = useCreateEntre()
  const { ajoutSortie } = useCreateSortie()
  const entreprise_id = useStoreUuid((state) => state.selectedId)
  const { unEntreprise } = useFetchEntreprise(entreprise_id);
  // Pour la remise

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


  const selectedIds = useStoreCart(state => state.selectedIds)
  const sortiess = useStoreCart(state => state.sorties);
  const [stockError, setStockError] = useState<string>('');
  const { unEntreprise: entreprise } = useFetchEntreprise(entreprise_id!)

  const [formValues, setFormValues] = useState<SortieType>({
    user_id: '',
    qte: 0,
    pu: 0,
    entre_id: '',
  });

  const [amount, setAmount] = useState<number>(0);
  const [scannedCode, setScannedCode] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<RecupType | null>(null);
  const [open, openchange] = useState(false);

  const { entresEntreprise: ent } = useGetAllEntre(entreprise_id!)
  const entres = ent.filter(info => info.qte !== 0 && info.is_sortie);

  // const {entresEntreprise, isLoading, isError} = useGetAllEntre(connect)
  // const {sortiesEntreprise: entresEntreprise , isLoading, isError} = useGetAllSortie(connect)
  const { sorties: entresEntreprise, isLoading, isError } = useFetchAllSortie(top)
  const [stockDisponible, setStockDisponible] = useState<number>(0);
  const [showInvoice, setShowInvoice] = useState(false); // État pour afficher ou masquer la section de facture
  const setSorties = useStoreCart(state => state.setSorties)
  const top_st = {
    all: "all",
    user_id: unUser.uuid
  }

  const { sorties } = useFetchAllSortie(top_st)

  const handleOnClick = () => {
    setShowInvoice(true); // Affiche la section de facture lorsque le bouton est cliqué
  };
  const handleOpenClick = () => {
    setShowInvoice(false); // Affiche la section de facture lorsque le bouton est cliqué
  };

  const handleSaveSorties = () => {
    setSorties(sorties);
  };

  // États pour les dates de recherche
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedStartDate(event.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedEndDate(event.target.value);
    setCurrentPage(1);
  };

  const itemsPerPage = 10; // Nombre d'éléments par page

  // État pour la page courante et les éléments par page
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrage entre les deux dates sélectionnées
  const filteredBoutiques = entresEntreprise?.filter((item) => {
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

  // Inverser les boutiques pour que les plus récentes apparaissent en premier
  const reversedBoutiques = filteredBoutiques?.slice().sort((a: RecupType, b: RecupType) => {
    if (a.id === undefined) return 1;
    if (b.id === undefined) return -1;
    return Number(b.id) - Number(a.id);
  });
  const totalPages = Math.ceil(reversedBoutiques?.length / itemsPerPage);

  // Calculer la somme des "price" pour la date sélectionnée
  const totalPrice = reversedBoutiques?.reduce((acc, row: RecupType) => {
    const price = (row.qte !== undefined && row.pu !== undefined) ? row.qte * row.pu : 0;
    return acc + price;
  }, 0);

  // Récupération des éléments à afficher sur la page courante
  const displayedBoutiques = reversedBoutiques?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  // Gestion du changement de page
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    // setUserInteracted(true); // Indiquer que l'utilisateur a interagi avec la pagination
  };

  // Gestion du changement de date


  useEffect(() => {
    const calculateAmount = () => {
      setAmount(Number(formValues.pu) * Number(formValues.qte));
    };

    calculateAmount();
  }, [formValues.pu, formValues.qte]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  useEffect(() => {
    if (Number(formValues?.qte) > stockDisponible) {
      setStockError(`Stock insuffisant (disponible : ${stockDisponible})`);
    } else {
      setStockError('');
    }
  }, [formValues.qte, stockDisponible]);

  const handleAutoCompleteChange = (
    _: SyntheticEvent,
    value: string | RecupType | null
  ) => {
    if (typeof value === 'object' && value !== null) {
      setSelectedProduct(value);
      setFormValues(prev => ({
        ...prev,
        entre_id: value.uuid,
        is_prix: value.is_prix,
        pu: value.pu,
        ref: value.ref,
        qte: prev.entre_id === value.uuid ? prev.qte : 1,
      }));
      setStockDisponible(Number(value.qte));
      setStockError('');
    } else {
      setSelectedProduct(null);
      setFormValues(prev => ({
        ...prev,
        entre_id: '',
        pu: 0,
        // qte: 0, // Optionnel : laisser la quantité ou la remettre à 0
      }));
      setStockDisponible(0);
      setScannedCode("")
    }
  };

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

  const filteredEnt = useMemo(() => scannedCode
    ? entres.filter((option: any) => {
      
      return option.ref === scannedCode
    }
    )
    : entres, [scannedCode, entres]);

  useEffect(() => {
    if (scannedCode && filteredEnt && filteredEnt.length === 1) {
      handleAutoCompleteChange(null as any, filteredEnt[0]);
    }
  }, [filteredEnt, scannedCode]);
  const itemDate = format(new Date(), 'dd/MM/yyyy');

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    formValues["user_id"] = unUser.uuid
    formValues["client_id"] = uuid.uuid
    ajoutSortie(formValues)

    // window.location.reload();
  };

  if (isLoading) {
    return <Box sx={{ width: 300 }}>
      <Skeleton />
      <Skeleton animation="wave" />
      <Skeleton animation={false} />
    </Box>
  }

  if (isError) {
    window.location.reload();
    return <div>Error fetching data</div>
  }

  if (unClient.role === 1 || unClient.role === 3) {

    if (entresEntreprise) {
      return (
        <div>
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <Typography variant="h5" className="font-bold" color={isDarkText ? 'white' : 'text.primary'}>
                  Gestion des Ventes
                </Typography>
                <Typography variant="body2" className="mt-0.5" color={isDarkText ? 'white' : 'text.primary'}>
                  Client : <span className="font-semibold" color={isDarkText ? 'white' : 'text.primary'}>{unClient.nom}</span>
                </Typography>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="contained"
                  onClick={() => {
                    handleSaveSorties();
                    handleOnClick();
                  }}
                  startIcon={<ReceiptIcon />}
                  sx={{
                    backgroundColor: '#2563eb',
                    '&:hover': { backgroundColor: '#1d4ed8' },
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px 0 rgba(37, 99, 235, 0.25)',
                  }}
                >
                  Créer Facture
                </Button>
                {showInvoice && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleOpenClick}
                    startIcon={<CloseIcon />}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Masquer Facture
                  </Button>
                )}
              </div>
            </div>

            {/* Date Filter & Total Metrics */}
            <Paper
              elevation={0}
              className="p-4 rounded-xl border border-gray-200/40 bg-transparent"
              sx={{ background: 'transparent', bgcolor: 'transparent' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <TextField
                  fullWidth
                  size="small"
                  label="Date de début"
                  type="date"
                  value={selectedStartDate}
                  onChange={handleStartDateChange}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Date de fin"
                  type="date"
                  value={selectedEndDate}
                  onChange={handleEndDateChange}
                  InputLabelProps={{ shrink: true }}
                />
                {unUser.role === 1 && (
                  <Paper
                    elevation={0}
                    className="p-3 rounded-lg border border-blue-200/50 bg-blue-50/30 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <LocalAtmIcon fontSize="small" />
                      </div>
                      <div>
                        <Typography variant="caption" className="text-blue-600 font-semibold block uppercase">
                          Total des ventes
                        </Typography>
                        <Typography variant="h6" className="font-bold text-blue-900 leading-tight">
                          {formatNumberWithSpaces(totalPrice)} F
                        </Typography>
                      </div>
                    </div>
                  </Paper>
                )}
              </div>
            </Paper>

            {/* Formulaire Nouvelle Vente */}
            <Paper
              elevation={0}
              className="p-5 rounded-xl border border-gray-200/40 bg-transparent"
              sx={{ background: 'transparent', bgcolor: 'transparent' }}
            >
              <div className="flex items-center justify-between mb-4">
                <Typography variant="subtitle1" className="font-bold" color={isDarkText ? 'white' : 'text.primary'}>
                  Nouvelle Vente
                </Typography>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={functionopen}
                  startIcon={<QrCode2Icon />}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    borderColor: '#cbd5e1',
                    // color: '#475569',
                    '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                  }}
                >
                  Scanner Code-Barres
                </Button>

                <Dialog open={open} onClose={closeopen} fullWidth maxWidth="xs">
                  <DialogTitle className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold text-base" color={isDarkText ? 'white' : 'text.primary'}>Scanner de code-barres</span>
                    <IconButton onClick={closeopen} size="small">
                      <CloseIcon />
                    </IconButton>
                  </DialogTitle>
                  <DialogContent className="pt-4">
                    <BarcodeScanner onScan={handleScanResult} />
                  </DialogContent>
                </Dialog>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Typography variant="caption" className="font-semibold" color={isDarkText ? 'white' : 'text.primary'}>
                      Désignation du produit *
                    </Typography>
                    <Autocomplete
                      size="small"
                      value={selectedProduct}
                      options={filteredEnt}
                      getOptionLabel={(option) =>
                        typeof option === 'string'
                          ? option
                          : `${option.categorie_libelle} (${option.libelle}) [${option.qte}]` || ''
                      }
                      onChange={handleAutoCompleteChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          placeholder={scannedCode ? `Code : ${scannedCode}` : "Sélectionner un produit"}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Typography variant="caption" className="font-semibold" color={isDarkText ? 'white' : 'text.primary'}>
                      Quantité *
                    </Typography>
                    <MyTextField
                      size="small"
                      required
                      type="number"
                      name="qte"
                      value={formValues.qte}
                      id="quantity"
                      placeholder="Quantité"
                      onChange={onChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <QuantityLimitsIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    {stockError && (
                      <Typography variant="caption" className="font-medium block" color={isDarkText ? 'white' : 'text.primary'}>
                        {stockError}
                      </Typography>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Typography variant="caption" className="font-semibold" color={isDarkText ? 'white' : 'text.primary'}>
                      Prix Unitaire (F) *
                    </Typography>
                    <MyTextField
                      size="small"
                      disabled={formValues.is_prix}
                      variant="outlined"
                      type="number"
                      name="pu"
                      onChange={onChange}
                      value={formValues.pu}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocalAtmIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-100 gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm" color={isDarkText ? 'white' : 'text.primary'}>Montant Total :</span>
                    <span className="text-lg font-extrabold" color={isDarkText ? 'white' : 'text.primary'}>
                      {formatNumberWithSpaces(amount)} F
                    </span>
                  </div>

                  {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
                    <Typography variant="subtitle2" color="error" className="font-semibold">
                      L'abonnement de cette entreprise a expiré
                    </Typography>
                  ) : (
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        backgroundColor: '#2563eb',
                        '&:hover': { backgroundColor: '#1d4ed8' },
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                      }}
                    >
                      Ajouter la vente
                    </Button>
                  )}
                </div>
              </form>
            </Paper>

            {/* Sales Table */}
            <Paper
              elevation={0}
              className="rounded-xl border border-gray-200/40 bg-transparent overflow-hidden"
              sx={{ background: 'transparent', bgcolor: 'transparent' }}
            >
              <TableContainer
                sx={{
                  maxHeight: 500,
                  backgroundColor: isDarkText ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  border: isDarkText ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: isDarkText ? '0 8px 32px rgba(0, 0, 0, 0.35)' : '0 8px 32px rgba(31, 38, 135, 0.07)',
                }}
              >
                <Table stickyHeader aria-label="tableau des ventes">
                  <TableHead>
                    <TableRow>
                      {['Image', 'Date', 'Référence', 'Désignation', 'Quantité', 'Prix Unitaire', 'Total'].map((header, i) => (
                        <TableCell
                          key={header}
                          align={i >= 4 ? 'right' : 'left'}
                          sx={{
                            backgroundColor: isDarkText ? 'rgba(30, 41, 59, 0.85)' : 'rgba(241, 245, 249, 0.95)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            color: isDarkText ? '#f1f5f9' : '#1e293b',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            borderBottom: isDarkText ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(226, 232, 240, 0.8)',
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedBoutiques?.length > 0 ? (
                      displayedBoutiques?.map((row, index) => (
                        <CardClientSortie key={index} row={row} />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" className="py-12">
                          <Typography variant="body2" className="font-medium" color={isDarkText ? 'white' : 'text.primary'}>
                            Aucune vente enregistrée pour ce filtre
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center p-4 border-t border-gray-100 bg-gray-50/50">
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="medium"
                  />
                </div>
              )}
            </Paper>

            {/* Invoice Preview */}
            {showInvoice && entreprise && (
              <div className="mt-6">
                <Fact
                  clientName={unClient.nom}
                  clientAddress={unClient.adresse}
                  clientCoordonne={unClient.coordonne}
                  invoiceNumber={unClient.numero}
                  invoiceDate={itemDate}
                  numeroFac={texte.numeroFac}
                  notes={texte.notes}
                  post={entreprise}
                />
              </div>
            )}
          </div>
        </div>
      );
    }
  } else {
    return (
      <Paper elevation={0} className="p-8 text-center rounded-xl border border-gray-200/80 bg-gray-50/50">
        <Typography variant="body1" className="font-medium" color={isDarkText ? 'white' : 'text.primary'}>
          Ce contact a le statut de Fournisseur uniquement.
        </Typography>
      </Paper>
    );
  }
}

