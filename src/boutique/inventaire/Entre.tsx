import { FormEvent, SyntheticEvent, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CardInvent from './CardInvent';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, Pagination, Skeleton, TextField, Typography } from '@mui/material';
import { connect } from '../../_services/account.service';
import { RecupType } from '../../typescript/DataType';
import CloseIcon from "@mui/icons-material/Close"
import { useCreateEntre, useGetAllEntre } from '../../usePerso/fonction.entre';
import Nav from '../../_components/Button/Nav';
import { EntreFormType } from '../../typescript/FormType';
import { AjoutEntreForm, useFormValues } from '../../usePerso/useEntreprise';
import { formatNumberWithSpaces, isLicenceExpired } from '../../usePerso/fonctionPerso';
import { useStoreUuid } from '../../usePerso/store';
import { useFetchEntreprise } from '../../usePerso/fonction.user';
import M_Abonnement from '../../_components/Card/M_Abonnement';


export default function Entre() {
  const uuid = useStoreUuid((state) => state.selectedId)

  const {unEntreprise} = useFetchEntreprise(uuid!)

  // const {entres} = useFetchAllEntre(top)
  const {ajoutEntre} = useCreateEntre()
  
  // const { getClients } = useAllClients(connect);
  // const fournisseurs = getClients.filter(info => info.role == 2 || info.role == 3);
   
  const [ajout_terminer, setTerminer] = useState(false);

  const Ajout_Terminer = () => {
    ajout_terminer ? setTerminer(false) : setTerminer(true);
  };

  const [is_sortie, setSortie] = useState(true);

  const Is_Sortie = () => {
    is_sortie ? setSortie(false) : setSortie(true);
  };
  
  const {entresEntreprise, isLoading, isError} = useGetAllEntre(connect, uuid!)
  const itemsPerPage = 25; // Nombre d'éléments par page

  // État pour la page courante et les éléments par page
  const [currentPage, setCurrentPage] = useState(1);

  // États pour les dates de recherche
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');

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

  const totalQte = reversedBoutiques?.reduce((acc, row: RecupType) => {
    const price = (row.qte !== undefined ) ? row.qte : 0;
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

  // Gestion du changement des dates
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedStartDate(event.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedEndDate(event.target.value);
    setCurrentPage(1);
  };
  
  const [open, openchange]= useState(false);
  const functionopen = () => {
    openchange(true)
  }
  const closeopen = () => {
    openchange(false)
  }

  const [formValues, handleInputChange, setFormValues] = useFormValues<EntreFormType>({
    libelle: '',
    cumuler_quantite: false,
    categorie_slug: '',
    user_id: '',
    date: '',
    pu: 0,
    qte: 0,
  });
  
  const handleAutoCompleteChange = (_: SyntheticEvent<Element, Event>,
    value: string | RecupType | null,
    // reason: AutocompleteChangeReason
    ) => {
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

  const handleAutoFourChange = (_: SyntheticEvent<Element, Event>,
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
  
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    formValues["cumuler_quantite"] = ajout_terminer
    formValues["is_sortie"] = is_sortie
    formValues["user_id"] = connect
    // formValues["categorie_slug"] = validSlug
    
    ajoutEntre(formValues)
    setTerminer(false);
    setSortie(true);
    setFormValues({
      libelle: '',
      cumuler_quantite: false,
      is_sortie: true,
      categorie_slug: '',
      user_id: '',
      date: '',
      pu: 0,
      qte: 0,
    });
    closeopen();
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

  if (entresEntreprise) {
    return (
      <>    

      <Nav />
      <Grid className='py-2'>
        <Typography variant="h5">
          <Button variant="outlined" onClick={functionopen}>Ajout des entrer</Button>
        </Typography>
      </Grid>

      <div className="flex justify-center mt-4">
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          
        />

        <Grid item className='mx-2'>
          <TextField
            className='bg-sky-300'
            label="Date de début"
            type="date"
            value={selectedStartDate}
            onChange={handleStartDateChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item>
          <TextField
            className='bg-sky-300'
            label="Date de fin"
            type="date"
            value={selectedEndDate}
            onChange={handleEndDateChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </div>
      {/* Modal */}
      <Dialog open={open} onClose={closeopen} fullWidth maxWidth="xs">
        <DialogTitle>Ajout des entrer<IconButton onClick={closeopen} style={{float: "right"}}><CloseIcon color="primary"></CloseIcon></IconButton> </DialogTitle>
        {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
        <M_Abonnement />  
        )
          :
        <DialogContent>

          <AjoutEntreForm
            onSubmit={onSubmit}
            formValues={formValues}
            onChange={handleInputChange}
            handleAutoCompleteChange={handleAutoCompleteChange}
            handleAutoFourChange={handleAutoFourChange}
            Ajout_Terminer={Ajout_Terminer}
            Is_Sortie={Is_Sortie}

          />          
         
        </DialogContent>
        }
      </Dialog>
  
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="spanning table">
          <TableHead>
  
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Fournisseurs</TableCell>
              <TableCell>Designations</TableCell>
              <TableCell align="right">Quantite</TableCell>
              <TableCell align="right">Prix Unitaire</TableCell>
              <TableCell align="right">Somme</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedBoutiques?.length > 0 ? 
            
            displayedBoutiques?.map((row, index) => {
                  
                return <CardInvent key={index} row={row} />
              })
              : "Pas d'entrer"
            }

          <TableRow>
            <TableCell></TableCell>
            <TableCell align="right"></TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>

          <TableRow>
            <TableCell rowSpan={4} />
            <TableCell colSpan={3}>Total :</TableCell>
            <TableCell colSpan={0}>{totalQte}</TableCell>
            <TableCell align="right">{formatNumberWithSpaces(totalPrice)} <LocalAtmIcon color="primary" fontSize='small' /></TableCell>
          </TableRow>
      
          </TableBody>
        </Table>
      </TableContainer>
      </>
    );
  }
}
