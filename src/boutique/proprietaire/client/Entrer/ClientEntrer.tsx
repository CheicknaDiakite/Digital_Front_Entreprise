import React, { ChangeEvent, FormEvent, SyntheticEvent, useState } from 'react'
import { UuType } from '../../../../typescript/Account'
import { Autocomplete, Box, Button, Checkbox, Dialog, DialogContent, DialogTitle, FormControlLabel, Grid, IconButton, Pagination, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import QuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import CloseIcon from "@mui/icons-material/Close"
import MyTextField from '../../../../_components/Input/MyTextField';
import { connect } from '../../../../_services/account.service';
import { RecupType } from '../../../../typescript/DataType';
import { EntreFormType } from '../../../../typescript/FormType';
import { useCreateEntre, useFetchAllEntre } from '../../../../usePerso/fonction.entre';
import { useFetchAllSousCate } from '../../../../usePerso/fonction.categorie';
import CardClientEntrer from './CardClientEntrer';
import { useUnClient } from '../../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../../usePerso/store';
import { formatNumberWithSpaces } from '../../../../usePerso/fonctionPerso';

export default function ClientEntrer(uuid: UuType) {

  const top = {
    user_id: connect,
    client_id: uuid.uuid,
  }
  const {unClient} = useUnClient(uuid.uuid!);
  const {ajoutEntre} = useCreateEntre()
  const entreprise_id = useStoreUuid((state) => state.selectedId)
  const {souscategories} = useFetchAllSousCate(connect, entreprise_id!)

  const [ajout_terminer, setTerminer] = useState(false);

  const Ajout_Terminer = () => {
    ajout_terminer ? setTerminer(false) : setTerminer(true);
  };
  
  // const {entresEntreprise, isLoading, isError} = useGetAllEntre(connect)
  const {entres: entresEntreprise, isLoading, isError} = useFetchAllEntre(top)
  
  const itemsPerPage = 10; // Nombre d'éléments par page

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
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
    setCurrentPage(1); // Revenir à la première page lorsque la recherche est appliquée
    // setUserInteracted(false); // Réinitialiser l'interaction utilisateur
  };
  
  const [open, openchange]= useState(false);
  const functionopen = () => {
    openchange(true)
  }
  const closeopen = () => {
    openchange(false)
  }

  const [formValues, setFormValues] = useState<EntreFormType>({
    libelle: '',
    cumuler_quantite: false,
    categorie_slug: '',
    user_id: '',
    date: '',
    pu: 0,
    qte: 0,
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

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
  
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    formValues["cumuler_quantite"] = ajout_terminer
    formValues["user_id"] = connect
    formValues["client_id"] = uuid.uuid
    
    ajoutEntre(formValues)
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
    // window.location.reload();
    return <div>Error fetching data</div>
  }

  if (unClient.role === 2 || unClient.role === 3 || unClient.role === 1) {
    if (entresEntreprise) {
      return (
        <>    
  
        {/* <Nav /> */}
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
  
          <TextField
            label="Recherche par date"
            className='bg-sky-300'
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            InputLabelProps={{
              shrink: true, // Force le label à rester au-dessus du champ
            }}
          />
  
          <Typography variant="h4" className='mx-2'>
            Somme total = {formatNumberWithSpaces(totalPrice)} <LocalAtmIcon color="primary" fontSize='medium' />
          </Typography>
        </div>
        {/* Modal */}
        <Dialog open={open} onClose={closeopen} fullWidth maxWidth="xs">
          <DialogTitle>Ajout des entrer<IconButton onClick={closeopen} style={{float: "right"}}><CloseIcon color="primary"></CloseIcon></IconButton> </DialogTitle>
          <DialogContent>
            
            <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96" onSubmit={onSubmit}>
              <Stack spacing={2} margin={2}>
    
                <Autocomplete
                  id="free-solo-demo"
                  freeSolo
                  options={souscategories}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.libelle || '')}
                  onChange={handleAutoCompleteChange}
                  renderInput={(params) => <TextField {...params} required
                                name='categorie_slug' 
                                onChange={onChange} 
                                label="Categorie"
                                sx={{
                                  "& .MuiFormLabel-asterisk": {
                                    color: "red", // Personnalise la couleur de l'étoile en rouge
                                  },
                                }} 
                              />}
                  
                />
    
                {/* <TextField variant="outlined" label="libelle" name='libelle' onChange={onChange}></TextField> */}
                <MyTextField 
                  label={"libelle"}
                  name={"libelle"}
                  onChange={onChange}
                />
  
                <MyTextField required
                  variant="outlined" 
                  type='date' 
                  label="Date" 
                  name='date' 
                  onChange={onChange}
                  InputLabelProps={{
                    shrink: true, // Force le label à rester au-dessus du champ
                  }}
                  sx={{
                    "& .MuiFormLabel-asterisk": {
                      color: "red", // Personnalise la couleur de l'étoile en rouge
                    },
                  }}
                />
                <Typography variant="h6" className='mx-2'>
                  Quantite <QuantityLimitsIcon color="error" fontSize='small' />
                </Typography>
                <MyTextField required
                  variant="outlined" 
                  type='number'
                  name='qte' 
                  onChange={onChange}
                  sx={{
                    "& .MuiFormLabel-asterisk": {
                      color: "red", // Personnalise la couleur de l'étoile en rouge
                    },
                  }}
                />
                <Typography variant="h6" className='mx-2'>
                  Prix Unitaire <LocalAtmIcon color="error" fontSize='small' />
                </Typography>
                <MyTextField required
                  variant="outlined" 
                  type='number'
                  name='pu' 
                  onChange={onChange}
                  sx={{
                    "& .MuiFormLabel-asterisk": {
                      color: "red", // Personnalise la couleur de l'étoile en rouge
                    },
                  }}
                />
  
                <FormControlLabel
                  value="end"
                  control={<Checkbox />}
                  label="Voulez-vous ajouter aux derniers stock ?"
                  labelPlacement="end"
                  onClick={Ajout_Terminer}
                />
                <Button type="submit" color="success" variant="outlined">Envoyer</Button>
              </Stack>
            </form>
          </DialogContent>
        </Dialog>
    
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="spanning table">
            <TableHead>
              
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell align="right">Quantite</TableCell>
                <TableCell align="right">Prix Unitaire</TableCell>
                <TableCell align="right">Somme</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedBoutiques?.length > 0 ? 
              
              displayedBoutiques?.map((row, index) => {                       
                  return <CardClientEntrer key={index} row={row} />
                })
                : "Pas d'achat !"
              }
        
            </TableBody>
          </Table>
        </TableContainer>
        </>
      );
    }
  } else {
      return <Typography variant="h6" className='mx-2'>
        Celui-ci est un client 
      </Typography>
    }

  
}
