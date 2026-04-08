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
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { UuType } from '../../../../typescript/Account'
import CardClientSortie from './CardClientSortie';
import MyTextField from '../../../../_components/Input/MyTextField';
import { connect } from '../../../../_services/account.service';
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
  const top = {
    user_id: connect,
    client_id: uuid.uuid,
  }
  const { unUser } = useFetchUser()
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
    user_id: connect
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
      // console.log('Code option :', option);
      // console.log('Code scannedCode :', scannedCode);
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

    formValues["user_id"] = connect!
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

  if (unClient.role === 1 || unClient.role === 3 || unClient.role === 2) {

    if (entresEntreprise) {
      return (
        <div >

          <Paper
            elevation={0}
            // className="rounded-lg overflow-hidden"
            sx={{
              background: 'transparent',
              bgcolor: 'transparent',
              backdropFilter: 'none',

            }}
          >
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex justify-between items-center border-b pb-6">
                <div>
                  <Typography variant="h4" className="font-semibold text-gray-50">
                    Gestion des Ventes
                  </Typography>
                  <Typography variant="body2" className="text-gray-100 mt-1">
                    Client : {unClient.nom}
                  </Typography>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="contained"
                    onClick={() => {
                      handleSaveSorties();
                      handleOnClick();
                    }}
                    startIcon={<ReceiptIcon />}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Créer Facture
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleOpenClick}
                    startIcon={<CloseIcon />}
                    className="border-red-500 text-red-500 hover:bg-red-50"
                  >
                    Annuler
                  </Button>
                </div>
              </div>

              {/* Date Filter Section */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-lg shadow-sm">
                <TextField
                  fullWidth
                  label="Date de début"
                  type="date"
                  value={selectedStartDate}
                  onChange={handleStartDateChange}
                  InputLabelProps={{ shrink: true }}
                  className="bg-white"
                />
                <TextField
                  fullWidth
                  label="Date de fin"
                  type="date"
                  value={selectedEndDate}
                  onChange={handleEndDateChange}
                  InputLabelProps={{ shrink: true }}
                  className="bg-white"
                />
                {unUser.role === 1 && (
                  <Paper elevation={0} className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <LocalAtmIcon color="primary" />
                      <Typography variant="h6" className="text-gray-900">
                        Total : {formatNumberWithSpaces(totalPrice)} F
                      </Typography>
                    </div>
                  </Paper>
                )}
              </div>

              {/* New Sale Form */}
              <Paper elevation={0} className="p-6 bg-white rounded-lg">
                <form onSubmit={onSubmit} className="space-y-6">

                  <div className="my-2">
                    <Stack direction="row" spacing={2}>
                      <QrCode2Icon onClick={functionopen} color="error" fontSize="large" />
                    </Stack>

                    <Dialog open={open} onClose={closeopen} fullWidth maxWidth="xs">
                      <DialogTitle>
                        Barre Code
                        <IconButton onClick={closeopen} style={{ float: 'right' }}>
                          <CloseIcon color="primary" />
                        </IconButton>
                      </DialogTitle>

                      <DialogContent>
                        <BarcodeScanner onScan={handleScanResult} />
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Typography variant="subtitle2">Nom du produit</Typography>
                      </div>
                      <Autocomplete
                        value={selectedProduct}
                        options={filteredEnt}
                        getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.categorie_libelle} (${option.libelle}) [${option.qte}]` || '')}
                        onChange={handleAutoCompleteChange}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={scannedCode ? `Désignation : ${scannedCode}` : "Désignation"}
                            className="bg-gray-200"
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Typography variant="subtitle2">Quantité</Typography>
                      </div>
                      <MyTextField
                        required
                        type="number"
                        name="qte"
                        className='bg-white'
                        value={formValues.qte}
                        id="quantity"
                        placeholder="Quantity"
                        onChange={onChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <QuantityLimitsIcon color="error" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Typography variant="subtitle2">Prix Unitaire</Typography>
                      </div>

                      <MyTextField
                        disabled={formValues.is_prix}
                        variant="outlined"
                        className='bg-white'
                        type="number"
                        name="pu"
                        onChange={onChange}
                        value={formValues.pu}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocalAtmIcon color="error" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiFormLabel-asterisk': {
                            color: 'red',
                          },
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Typography variant="h6" className="text-gray-700">
                      Montant Total : {formatNumberWithSpaces(amount)} F
                    </Typography>

                    {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
                      <Typography variant="subtitle1" color="error">
                        L'abonnement de cette entreprise a expiré
                      </Typography>
                    ) : (
                      <Button
                        type="submit"
                        variant="contained"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Ajouter la vente
                      </Button>
                    )}
                  </div>

                </form>
              </Paper>

              {/* Sales Table */}
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                      <TableCell>Image</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Référence</TableCell>
                      <TableCell>Désignation</TableCell>
                      <TableCell align="right">Quantité</TableCell>
                      <TableCell align="right">Prix Unitaire</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedBoutiques?.length > 0 ? (
                      displayedBoutiques?.map((row, index) => (
                        <CardClientSortie key={index} row={row} />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" className="py-8">
                          <Typography variant="body1" className="text-gray-500">
                            Aucune vente enregistrée
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <div className="flex justify-center">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </div>
            </div>
          </Paper>

          {/* Invoice Preview */}
          {(showInvoice && entreprise) && (
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
      );
    }
  } else {
    return <Typography variant="h6" className="text-gray-700 p-4">
      Celui-ci est un fournisseur
    </Typography>
  }
}
