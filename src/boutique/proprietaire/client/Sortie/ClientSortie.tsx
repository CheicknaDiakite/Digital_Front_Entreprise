import { Autocomplete, Box, Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, Pagination, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { UuType } from '../../../../typescript/Account'
import CardClientSortie from './CardClientSortie';
import MyTextField from '../../../../_components/Input/MyTextField';
import { connect } from '../../../../_services/account.service';
import { ChangeEvent, FormEvent, SyntheticEvent, useEffect, useState } from 'react';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import QuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import CloseIcon from "@mui/icons-material/Close"
import { RecupType, SortieType } from '../../../../typescript/DataType';
import { useCreateSortie, useFetchAllSortie, useGetAllEntre } from '../../../../usePerso/fonction.entre';
import { Money } from '../../../../_components/icons/Money';
import { useUnClient } from '../../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../../usePerso/store';
import { formatNumberWithSpaces } from '../../../../usePerso/fonctionPerso';

export default function ClientSortie(uuid: UuType) {
  const top = {
    user_id: connect,
    client_id: uuid.uuid,
  }
  const {unClient} = useUnClient(uuid.uuid!);

    // const {ajoutEntre} = useCreateEntre()
    const {ajoutSortie} = useCreateSortie()
    const entreprise_id = useStoreUuid((state) => state.selectedId)
    
    const {entresEntreprise: entres} = useGetAllEntre(connect, entreprise_id!)
    // const {entresEntreprise, isLoading, isError} = useGetAllEntre(connect)
    // const {sortiesEntreprise: entresEntreprise , isLoading, isError} = useGetAllSortie(connect)
    const {sorties: entresEntreprise , isLoading, isError} = useFetchAllSortie(top)
    
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
  
    const [formValues, setFormValues] = useState<SortieType>({
      user_id: '',
      qte: 0,
      pu: 0,
      entre_id: '',
      });

      const [amount, setAmount] = useState<number>(0);
      useEffect(() => {
        const calculateAmount = () => {
          setAmount(formValues.pu * formValues.qte);
        };
    
        calculateAmount();
      }, [amount, formValues.pu, formValues.qte, setAmount]);

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
          entre_id: value.uuid ?? '',
        });
      } else {
        setFormValues({
          ...formValues,
          entre_id: '',
        });
      }
    };
    
    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
  
      formValues["user_id"] = connect
      formValues["client_id"] = uuid.uuid
      console.log("sortie ..",formValues)
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
          <>    
    
          <Grid className='py-2'>
            <Typography variant="h5">
              <Button variant="outlined" onClick={functionopen}>Ajout des sorties</Button>
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
                    options={entres}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.categorie_libelle} (${option.libelle})`  || '')}
                    onChange={handleAutoCompleteChange}
                    renderInput={(params) => <TextField {...params} label="Designation" />}
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
    
                  <div className="flex flex-col">
                    <label htmlFor="amount">Somme <Money size={40} className='inline' /></label>
                    <p>{amount}</p>
                  </div>
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
                    return <CardClientSortie key={index} row={row} />
                  })
                  : "Pas de vente pour ce client"
                }
          
              </TableBody>
            </Table>
          </TableContainer>
          </>
        );
      }
    } else {
      return <Typography variant="h6" className='mx-2'>
        Celui-ci est un fournisseur 
      </Typography>
    }
}
