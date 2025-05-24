import { Autocomplete, Box, Button, Grid, Modal, Pagination, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { UuType } from '../../../../typescript/Account'
import CardClientSortie from './CardClientSortie';
import MyTextField from '../../../../_components/Input/MyTextField';
import { connect } from '../../../../_services/account.service';
import { ChangeEvent, FormEvent, SyntheticEvent, useEffect, useState } from 'react';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import QuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import { RecupType, SortieType } from '../../../../typescript/DataType';
import { useCreateSortie, useFetchAllSortie, useGetAllEntre } from '../../../../usePerso/fonction.entre';
import { Money } from '../../../../_components/icons/Money';
import { useFetchEntreprise, useUnClient } from '../../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../../usePerso/store';
import { formatNumberWithSpaces, isLicenceExpired } from '../../../../usePerso/fonctionPerso';
import Fact from '../../../factureCard/Fact';
import { useStoreCart } from '../../../../usePerso/cart_store';
import { TypeText } from '../../../sortie/Sortie';
import { format } from 'date-fns';

export default function ClientSortie(uuid: UuType) {
  const top = {
    user_id: connect,
    client_id: uuid.uuid,
  }
  const {unClient} = useUnClient(uuid.uuid!);
  
    // const {ajoutEntre} = useCreateEntre()
    const {ajoutSortie} = useCreateSortie()
    const entreprise_id = useStoreUuid((state) => state.selectedId)
    const { unEntreprise } = useFetchEntreprise(entreprise_id!);
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

    const onChan = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setNom({
        ...texte,
        [name]: value,
      });
    };
            
    const selectedIds = useStoreCart(state => state.selectedIds)
    const sortiess = useStoreCart(state => state.sorties);
    const selectSorties = sortiess.filter((sor) => sor.id !== undefined && selectedIds.has(sor.id as number));
    
    const {unEntreprise: entreprise} = useFetchEntreprise(entreprise_id!)
    
    const {entresEntreprise: entres} = useGetAllEntre(connect, entreprise_id!)
    // const {entresEntreprise, isLoading, isError} = useGetAllEntre(connect)
    // const {sortiesEntreprise: entresEntreprise , isLoading, isError} = useGetAllSortie(connect)
    const {sorties: entresEntreprise , isLoading, isError} = useFetchAllSortie(top)

    const [showInvoice, setShowInvoice] = useState(false); // État pour afficher ou masquer la section de facture
    const setSorties = useStoreCart(state => state.setSorties)
    const top_st = {
      all: "all",
      user_id: connect
    }
    
    const {sorties} = useFetchAllSortie(top_st)

    const handleOnClick = () => {
      setShowInvoice(true); // Affiche la section de facture lorsque le bouton est cliqué
    };
    const handleOpenClick = () => {
      setShowInvoice(false); // Affiche la section de facture lorsque le bouton est cliqué
    };

    const handleSaveSorties = () => {
      setSorties(sorties);
    };

    // Ouvrir/fermer le modal
    // Normaliser la saisie (remplace ',' par '.')
    const normalizeInput = (value: string) => value.replace(",", ".");

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

    const toggleModal = () => setIsModalOpen(!isModalOpen);
    const toggleModalPay = () => setIsModalOpenPay(!isModalOpenPay);

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
  
    // Calcul du nombre total de pages en fonction des résultats filtrés
    // const filteredBoutiques = entresEntreprise?.filter((item) => {
    //   return selectedDate ? item.date === selectedDate : true;
    // });
  
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

    const itemDate = format(new Date(), 'dd/MM/yyyy');
    
    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
  
      formValues["user_id"] = connect
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
          <>

          <main
            className="m-5 p-5 gap-10 xl:items-start"
            style={{
              maxWidth: "1920px",
              margin: "auto",
            }}
          >

            <section className="invoice__preview bg-white p-5 rounded-2xl border-4 border-blue-300">
              <div className="bg-white p-5 rounded shadow">
                <div className="flex flex-col justify-center">
                  
                  <article className="md:grid grid-cols-2 gap-10">
                    <div className="flex flex-col">
                          
                      <Typography variant="h5">
                        Numero de la facture
                      </Typography>
                      <MyTextField 
                      type="text"
                      name="numeroFac"
                      placeholder="Numero de la facture"
                      autoComplete="off"
                      // value={bankName}
                      onChange={onChan}
                      />
                    </div>
                  </article>

                  {/* This is our table form */}
                  <article>
                    <div className="mb-5">
                      <Button 
                        variant="outlined" 
                        onClick={() => {
                          handleSaveSorties();
                          handleOnClick();
                        }}
                        className="bg-green-500 text-white font-bold mt-5 py-2 px-8 rounded hover:bg-green-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-green-400">
                          Facture
                      </Button>

                      <Button variant="outlined" onClick={handleOpenClick} className="bg-red-500 mx-3 text-white font-bold mt-5 py-2 px-8 rounded hover:bg-red-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-red-400">
                        Off.
                      </Button>

                      <Button variant="contained" color="primary" onClick={toggleModal} className="bg-indigo-500 mx-3 text-white font-bold mt-5 py-2 px-8 rounded hover:bg-indigo-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-indigo-400">
                        Remise
                      </Button>

                      <Button variant="contained" color="primary" onClick={toggleModalPay} className="bg-orange-500 mx-3 text-white font-bold mt-5 py-2 px-8 rounded hover:bg-orange-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-orange-400">
                        Payer
                      </Button>               

                      {/* Modal */}
                      <Modal open={isModalOpen} onClose={toggleModal}>
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: 4,
                            borderRadius: 2,
                            minWidth: 300,
                          }}
                        >
                          <h2>Ajouter une remise</h2>
                          <TextField
                            label="Montant fixe (ex: 1500 ou 85.45)"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={fixedDiscount}
                            onChange={(e) => setFixedDiscount(normalizeInput(e.target.value))}
                          />
                          <TextField
                            label="Pourcentage (ex: 2% ou 5%)"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={percentageDiscount}
                            onChange={(e) => setPercentageDiscount(normalizeInput(e.target.value))}
                          />
                          <div className="flex justify-end mt-4">
                            <Button variant="outlined" onClick={toggleModal} sx={{ mr: 2 }}>
                              Annuler
                            </Button>
                            <Button variant="contained" color="primary" onClick={handleApplyDiscount}>
                              Appliquer
                            </Button>
                          </div>
                        </Box>
                      </Modal>

                      {/* Modal Payer */}
                      <Modal open={isModalOpenPay} onClose={toggleModalPay}>
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: 4,
                            borderRadius: 2,
                            minWidth: 300,
                          }}
                        >
                          <h2>Ajouter le montant payer</h2>
                          <TextField
                            label="Montant fixe (ex: 1500 ou 85.45)"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={payDiscount}
                            onChange={(e) => setPayDiscount(normalizeInput(e.target.value))}
                          />
                          
                          <div className="flex justify-end mt-4">
                            <Button variant="outlined" onClick={toggleModalPay} sx={{ mr: 2 }}>
                              Annuler
                            </Button>
                            <Button variant="contained" color="primary" onClick={handleApplyPayer}>
                              Appliquer
                            </Button>
                          </div>
                        </Box>
                      </Modal>

                    </div>                
                    
                    <div className="flex justify-center mt-4">

                    
                      <>                
                        {/* <Grid item className='mx-2'>
                          <TextField
                            className='bg-sky-300'
                            label="Date de début"
                            type="date"
                            value={selectedStartDate}
                            onChange={handleStartDateChange}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid> */}

                        
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

                        
                        <Typography variant="h4" className='mx-2'>
                          Somme total = {formatNumberWithSpaces(totalPrice)} <LocalAtmIcon color="primary" fontSize='medium' />
                        </Typography>
                      </>
                    

                                     
                      {/* <Grid item>
                        <Typography variant="h5" className='mx-2'>
                          Chiffre d'affaire = {formatNumberWithSpaces(totalPrice)} <LocalAtmIcon fontSize='medium' color="primary" />
                        </Typography>
                        <Typography variant="h5" className='mx-2'>
                          Qte = {formatNumberWithSpaces(totalQte)} <QuantityLimitsIcon fontSize='medium' color="primary" />
                        </Typography>
                      </Grid> */}
                                   
                      
                    </div>

                    
                    <form onSubmit={onSubmit}>
                      <div className="my-2">
                        <Autocomplete
                          id="free-solo-demo"
                          freeSolo
                          options={entres}
                          getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.categorie_libelle} (${option.libelle}) [${option.qte}]`  || '')}
                          onChange={handleAutoCompleteChange}
                          renderInput={(params) => <TextField {...params} label="Designation" />}
                        />
                        
                      </div>
                      <div className="md:grid grid-cols-3 gap-10">
                        {/* <div className="my-2">
                          <Typography variant="h5" className="mb-2">
                            Designation 
                          </Typography>
                          <Select
                            required
                            options={ent} // Ici, vous pouvez également filtrer si besoin
                            value={selectedOption}
                            onChange={handleChange}
                            placeholder="Designation"
                            isClearable
                            getOptionLabel={(option: any) =>
                              `${option.categorie_libelle} (${option.libelle}) [${option.qte}]`
                            }
                            getOptionValue={(option: any) => option.uuid.toString()}
                          />
                        </div> */}
                        <div className="flex flex-col">
                          <Typography variant="h5" className="mb-2">
                            Quantite <QuantityLimitsIcon fontSize="large" />
                          </Typography>
                          <MyTextField
                            required
                            type="number"
                            name="qte"
                            value={formValues.qte}
                            id="quantity"
                            placeholder="Quantity"
                            onChange={onChange}
                          />
                        </div>

                        <div className="flex flex-col">
                          <Typography variant="h5" className="mb-2">
                            Prix Unitaire <LocalAtmIcon fontSize="large" />
                          </Typography>
                          {formValues.is_prix ? 
                            <MyTextField
                              disabled
                              variant="outlined"
                              type="number"
                              inputProps={{
                                step: '0.01',
                                min: '0',
                                max: '9999999999.99',
                              }}
                              name="pu"
                              onChange={onChange}
                              value={formValues.pu}
                              sx={{
                                '& .MuiFormLabel-asterisk': {
                                  color: 'red',
                                },
                              }}
                            /> 
                            : 
                            <MyTextField
                              disabled={formValues.is_prix}
                              variant="outlined"
                              type="number"
                              inputProps={{
                                step: '0.01',
                                min: '0',
                                max: '9999999999.99',
                              }}
                              name="pu"
                              onChange={onChange}
                              value={formValues.pu}
                              sx={{
                                '& .MuiFormLabel-asterisk': {
                                  color: 'red',
                                },
                              }}
                            />
                          }
                          
                        </div>

                        <div className="flex flex-col">
                          <label htmlFor="amount">
                            Somme <Money size={40} className="inline" />
                          </label>
                          <p>{amount}</p>
                        </div>
                      </div>

                      {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
                        <Typography variant="h5" color="error" sx={{ mt: 1 }}>
                          L'abonnement de cet Entreprise a expiré !
                        </Typography>
                      ) : (
                        <button
                          type="submit"
                          className="bg-blue-500 mb-5 text-white font-bold mt-2 py-2 px-8 rounded hover:bg-blue-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-blue-400"
                        >
                          Ajouter
                        </button>
                      )}                   
                    </form>
                    <TableContainer component={Paper} className='mt-3'>
                      <Table sx={{ minWidth: 700 }} aria-label="spanning table">
                        <TableHead>
                          
                          <TableRow>
                            <TableCell>Image</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Ref</TableCell>
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
                            : "Pas de vente !"
                          }
                    
                        </TableBody>
                      </Table>
                      
                    </TableContainer>

                    {/* Composant de pagination */}
                    <div className="flex justify-center mt-4">
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                      />
                    </div>
                  </article>

                  <Grid item>
                    <Typography variant="h5">Ajouter une note</Typography>
                  </Grid>
                  <textarea
                    name="notes"
                    className="mt-2"
                    cols={30}
                    rows={10}
                    placeholder="Ajouter une note pour plus de details pour ce facture"
                    maxLength={500}
                    // value={notes}
                    onChange={onChan}
                  ></textarea>
                </div>
              </div>
              
            </section>

          </main>      
          <div className='py-8'>
            {/* <FactureCard /> */}
            
            {(showInvoice && entreprise) && (
            <Fact               
            clientName={unClient.nom}
            clientAddress={unClient.adresse}
            clientCoordonne={unClient.coordonne}
            invoiceNumber={unClient.numero}
            invoiceDate={itemDate}
            numeroFac={texte.numeroFac}
            notes={texte.notes}
            post={entreprise}
            discountedTotal={discountedTotal}
            payerTotal={payerTotal}
            />
          )}

          </div>
          </>
        );
      }
    } else {
      return <Typography variant="h6" className='mx-2'>
        Celui-ci est un fournisseur 
      </Typography>
    }
}
