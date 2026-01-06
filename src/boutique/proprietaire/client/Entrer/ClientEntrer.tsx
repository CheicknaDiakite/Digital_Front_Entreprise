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
} from '@mui/material';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from '@mui/icons-material/Add';
import { connect } from '../../../../_services/account.service';
import { RecupType } from '../../../../typescript/DataType';
import { EntreFormType } from '../../../../typescript/FormType';
import { useCreateEntre, useFetchAllEntre } from '../../../../usePerso/fonction.entre';
import CardClientEntrer from './CardClientEntrer';
import { useFetchEntreprise, useUnClient } from '../../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../../usePerso/store';
import { formatNumberWithSpaces, isLicenceExpired } from '../../../../usePerso/fonctionPerso';
import { AjoutEntreForm, useFormValues } from '../../../../usePerso/useEntreprise';
import M_Abonnement from '../../../../_components/Card/M_Abonnement';

export default function ClientEntrer(uuid: UuType) {

  const top = {
    user_id: connect,
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
    formValues["user_id"] = connect;
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
    // window.location.reload();
    return <div>Non autoriser !</div>
  }

  if (unClient.role === 2 || unClient.role === 3 || unClient.role === 1) {
    if (entresEntreprise) {
      return (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <Typography variant="h5" className="font-semibold text-gray-50">
              Gestion des Entrées
            </Typography>
            <Button
              variant="contained"
              onClick={functionopen}
              startIcon={<AddIcon />}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Nouvelle Entrée
            </Button>
          </div>

          {/* Filters Section */}
          <Paper elevation={0} className="p-4 bg-white rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <TextField
                label="Recherche par date"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                className="bg-white"
              />
              
              <div className="flex items-center space-x-2">
                <LocalAtmIcon color="primary" />
                <Typography variant="h6" className="text-gray-700">
                  Total : {formatNumberWithSpaces(totalPrice)} F
                </Typography>
              </div>

              <div className="flex justify-end">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="medium"
                />
              </div>
            </div>
          </Paper>

          {/* Table Section */}
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Désignation</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Quantité</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Prix Unitaire (Achat)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedBoutiques?.length > 0 ? (
                  displayedBoutiques.map((row, index) => (
                    <CardClientEntrer key={index} row={row} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" className="py-8">
                      <Typography variant="body1" className="text-gray-500">
                        Aucun achat enregistré
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Add Entry Modal */}
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
  } else {
      return <Typography variant="h6" className='mx-2'>
        Celui-ci est un client 
      </Typography>
    }

  
}
