import React, { FormEvent, SyntheticEvent, useEffect, useState } from 'react'
import { UuType } from '../../../../typescript/Account'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
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
  useTheme,
} from '@mui/material';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from '@mui/icons-material/Add';
import { RecupType } from '../../../../typescript/DataType';
import { EntreFormType } from '../../../../typescript/FormType';
import { useCreateEntre, useFetchAllEntre } from '../../../../usePerso/fonction.entre';
import CardClientEntrer from './CardClientEntrer';
import { useFetchEntreprise, useFetchUser, useUnClient } from '../../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../../usePerso/store';
import { formatNumberWithSpaces, isLicenceExpired } from '../../../../usePerso/fonctionPerso';
import { AjoutEntreForm, useFormValues } from '../../../../usePerso/useEntreprise';
import M_Abonnement from '../../../../_components/Card/M_Abonnement';
import { useAppSettings } from '../../../../themes/AppSettingsContext';

export default function ClientEntrer(uuid: UuType) {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDarkText = theme.palette.mode === 'dark' || showBackground;
  const { unUser } = useFetchUser()
  const top = {
    user_id: unUser.uuid,
    client_id: uuid.uuid,
  }
  const {unClient} = useUnClient(uuid.uuid!);
  const {ajoutEntre} = useCreateEntre()
  const entreprise_id = useStoreUuid((state) => state.selectedId)
  const {unEntreprise} = useFetchEntreprise(entreprise_id);
  const [isMobile, setIsMobile] = useState(false);
  const [ajout_terminer, setTerminer] = useState(false);
  const [is_sortie, setSortie] = useState(true);
  const [is_prix, setPrix] = useState(true);
  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // const {entresEntreprise, isLoading, isError} = useGetAllEntre(connect)
  const {entres: entresEntreprise, isLoading, isError} = useFetchAllEntre(top)
  
  const itemsPerPage = 10; // Nombre d'éléments par page

  const Ajout_Terminer = () => setTerminer(!ajout_terminer);
  const Is_Sortie = () => setSortie(!is_sortie);
  const Is_Prix = () => setPrix(!is_prix);

  // État pour la page courante et les éléments par page
  const [currentPage, setCurrentPage] = useState(1);

  // État pour la date sélectionnée par l'utilisateur
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Calcul du nombre total de pages en fonction des résultats filtrés
  const filteredBoutiques = entresEntreprise?.filter((item) => {
    return selectedDate ? item.date === selectedDate : true;
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
    const price = (row.qte !== undefined && row.pu_achat !== undefined) ? row.qte * row.pu_achat : 0;
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
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
    setCurrentPage(1); // Revenir à la première page lorsque la recherche est appliquée
    // setUserInteracted(false); // Réinitialiser l'interaction utilisateur
  };
  
  const [open, setOpen] = useState(false);
  const functionopen = () => setOpen(true);
  const closeopen = () => setOpen(false);

  const [formValues, handleInputChange, setFormValues] = useFormValues<EntreFormType>({
    libelle: '',
    cumuler_quantite: false,
    user_id: '',
    date: '',
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

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    formValues["cumuler_quantite"] = ajout_terminer;
    formValues["is_sortie"] = is_sortie;
    formValues["is_prix"] = is_prix;
    formValues["user_id"] = unUser.uuid || '';
    formValues["client_id"] = uuid.uuid;
    
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
    return <Box sx={{ width: 300 }}>
    <Skeleton />
    <Skeleton animation="wave" />
    <Skeleton animation={false} />
  </Box>
  }

  if (isError) {
    return (
      <Paper elevation={0} className="p-8 text-center rounded-xl border border-red-200 bg-red-50/50">
        <Typography variant="body1" color="error" className="font-semibold">
          Erreur lors du chargement des données.
        </Typography>
      </Paper>
    );
  }

  if (unClient.role === 2 || unClient.role === 3) {
    if (entresEntreprise) {
      return (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <Typography variant="h5" className="font-bold" color={isDarkText ? 'white' : 'text.primary'}>
                Gestion des Entrées (Achats)
              </Typography>
              <Typography variant="body2" className="mt-0.5" color={isDarkText ? 'white' : 'text.primary'}>
                Fournisseur : <span className="font-semibold">{unClient.nom}</span>
              </Typography>
            </div>
            <Button
              variant="contained"
              onClick={functionopen}
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: '#2563eb',
                '&:hover': { backgroundColor: '#1d4ed8' },
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 2px 8px 0 rgba(37, 99, 235, 0.25)',
              }}
            >
              Nouvelle Entrée
            </Button>
          </div>

          {/* Filters & Total Metrics Section */}
          <Paper
            elevation={0}
            className="p-4 rounded-xl border border-gray-200/40 bg-transparent"
            sx={{ background: 'transparent', bgcolor: 'transparent' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <TextField
                size="small"
                label="Filtrer par date"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <Paper
                elevation={0}
                className="p-3 rounded-lg border border-blue-200/50 bg-blue-50/30 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-blue-100 text-gray-700" >
                    <LocalAtmIcon fontSize="small" />
                  </div>
                  <div>
                    <Typography variant="caption" className="font-semibold block uppercase" color={isDarkText ? 'white' : 'text.primary'}>
                      Total des achats
                    </Typography>
                    <Typography variant="h6" className="font-bold leading-tight" color={isDarkText ? 'white' : 'text.primary'}>
                      {formatNumberWithSpaces(totalPrice)} F
                    </Typography>
                  </div>
                </div>
              </Paper>

              <div className="flex justify-end">
                {totalPages > 1 && (
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="medium"
                  />
                )}
              </div>
            </div>
          </Paper>

          {/* Table Section */}
          <Paper
            elevation={0}
            className="rounded-xl border border-gray-200/40 bg-transparent overflow-hidden"
            sx={{ background: 'transparent', bgcolor: 'transparent' }}
          >
            <TableContainer sx={{ maxHeight: 550 }}>
              <Table stickyHeader aria-label="tableau des entrées">
                <TableHead>
                  <TableRow sx={{ '& th': { backgroundColor: '#f8fafc', fontWeight: 700, color: '#334155' } }}>
                    <TableCell>Date</TableCell>
                    <TableCell>Désignation</TableCell>
                    <TableCell align="right">Quantité</TableCell>
                    <TableCell align="right">Prix Unitaire (Achat)</TableCell>
                    <TableCell align="right">Total</TableCell>
                    {(unClient.role === 2 || unClient.role === 3) && <TableCell align="center">Action</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedBoutiques?.length > 0 ? (
                    displayedBoutiques.map((row, index) => (
                      <CardClientEntrer key={index} row={row} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" className="py-12">
                        <Typography variant="body2" className="font-medium" color={isDarkText ? 'white' : 'text.primary'}>
                          Aucun achat enregistré pour ce contact
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

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

          {/* Add Entry Modal */}
          <Dialog
            open={open}
            onClose={closeopen}
            fullWidth
            maxWidth="sm"
            PaperProps={{
              elevation: 0,
              sx: {
                borderRadius: '16px',
                overflow: 'hidden',
                ...(isMobile
                  ? {
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.98)',
                    }
                  : {}),
              },
            }}
          >
            <DialogTitle className="flex justify-between items-center bg-gray-900 text-white p-4">
              <Typography variant="h6" className="font-bold">
                Nouvelle Entrée (Achat)
              </Typography>
              <IconButton onClick={closeopen} size="small" className="text-gray-300 hover:text-white">
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>

            {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
              <M_Abonnement />
            ) : (
              <DialogContent className="p-6">
                <AjoutEntreForm
                  onSubmit={onSubmit}
                  formValues={formValues}
                  onChange={handleInputChange}
                  handleAutoCompleteChange={handleAutoCompleteChange}
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
  }

  return (
    <Paper elevation={0} className="p-8 text-center rounded-xl border border-gray-200/80 bg-gray-50/50">
      <Typography variant="body1" className="text-gray-600 font-medium">
        Ce contact a le statut de Client uniquement.
      </Typography>
    </Paper>
  );
}

