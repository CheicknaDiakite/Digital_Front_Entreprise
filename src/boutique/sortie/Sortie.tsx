import { Box, Button, Grid, Modal, Pagination, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { ChangeEvent, FormEvent, Fragment, SyntheticEvent, useEffect, useState } from "react";
import { RecupType, SortieType } from "../../typescript/DataType";
import { connect } from "../../_services/account.service";
import { useStoreCart } from "../../usePerso/cart_store";
import { useCreateSortie, useFetchAllSortie, useGetAllEntre, useGetAllSortie, useUpdateSortie } from "../../usePerso/fonction.entre";
import Fact from "../factureCard/Fact";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import TableSortie from "./TableSortie";
import { useFetchEntreprise, useFetchUser } from "../../usePerso/fonction.user";
import Nav from "../../_components/Button/Nav";
import MyTextField from "../../_components/Input/MyTextField";
import { useStoreUuid } from "../../usePerso/store";
import { formatNumberWithSpaces } from "../../usePerso/fonctionPerso";
import { SingleValue } from 'react-select';

 
type TypeText = {
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
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
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
    
      // const handleClient = (selected: SingleValue<RecupType>) => {
      //   // console.log('Selected option:', selected?.uuid);
      //   formValues["client_id"]= selected?.uuid
      //   setSelectedClient(selected);
      // };

      const {entresEntreprise: entres, refetch} = useGetAllEntre(connect, entreprise_uuid!)
      
      const ent = entres.filter(info => info.qte !== 0 && info.is_sortie);
      console.log(ent)
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
        const [fixedDiscount, setFixedDiscount] = useState<number | string>(""); // Remise fixe
        const [percentageDiscount, setPercentageDiscount] = useState<number | string>(""); // Remise en %
        const [discountedTotal, setDiscountedTotal] = useState(total); // Total avec remise
      
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
      
        // Ouvrir/fermer le modal
        const toggleModal = () => setIsModalOpen(!isModalOpen);
      
        // Pour la remise des facture
        const [openF, setOpenF] = useState(false);
        const handleOpen = () => {
          setOpenF(true);
        };
        const handleClose = () => {
          setOpenF(false);
        };
        // const handleUpdate = async () => {
        //   const idsToUpdate = selectSorties.map(sor => sor.id);
        //   console.log("testing ...", selectSorties)
          
        //   updateSortie(idsToUpdate)
        // };

        // Appliquer la remise
        const handleApplyDiscount = () => {
          calculateDiscountedTotal();
          toggleModal();
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
          <>
          <main
        className="m-5 p-5 gap-10 xl:items-start"
        style={{
          maxWidth: "1920px",
          margin: "auto",
        }}
      >
        <div className='py-2'>
          <Nav />
        </div>

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

                <div className="flex flex-col">
                  <Typography variant="h5" className='mb-2'>
                    Nom du client
                  </Typography>
                  <MyTextField 
                    type="text"
                    name="clientName"
                    id="clientName"
                    placeholder="Nom du client"
                    autoComplete="off"
                    onChange={onChan}
                  />
                </div>

                <div className="flex flex-col">
                  <Typography variant="h5" className='mb-2'>
                    Adresse du client
                  </Typography>
                  <MyTextField 
                    type="text"
                    name="clientAddress"
                    id="clientAddress"
                    placeholder="Adresse du client"                  
                    autoComplete="off"
                    onChange={onChan}
                  />
                </div>
                
                <div className="flex flex-col">
                  <Typography variant="h5" className='mb-2'>
                    Coordonne du client
                  </Typography>
                  <MyTextField 
                    type="text"
                    name="clientCoordonne"
                    id="clientCoordonne"
                    placeholder="Coordonne du client"
                    autoComplete="off"
                    onChange={onChan}
                  />
                </div>

              </article>

              <article className="md:grid grid-cols-3 gap-10 mt-5">
                <div className="flex flex-col">
                  <Typography variant="h5" className='mb-2'>
                    Numero du client
                  </Typography>
                  <MyTextField 
                    type="number"
                    name="invoiceNumber"
                    id="invoiceNumber"
                    placeholder="Numero du client"
                    autoComplete="off"
                    onChange={onChan}
                  />
                </div>

                <div className="flex flex-col">
                  <Typography variant="h5" className='mb-2'>
                    Date de la facture
                  </Typography>
                  <MyTextField 
                    type="date"
                    name="invoiceDate"
                    id="invoiceDate"
                    placeholder="Date de la facture"
                    autoComplete="off"
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

                  <Button variant="contained" color="primary" onClick={handleOpen} className="bg-sky-500 mx-3 text-white font-bold mt-5 py-2 px-8 rounded hover:bg-sky-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-sky-400">
                    R_Facture
                  </Button>

                  <Modal
                    open={openF}
                    onClose={handleClose}
                    aria-labelledby="parent-modal-title"
                    aria-describedby="parent-modal-description"
                  >
                    <Box sx={{ ...style, width: 400 }}>
                      <h2 id="parent-modal-title">Il y a eu une remise sur ce facture ?</h2>
                      <p id="parent-modal-description">
                        Verifier avant de Confirmer
                      </p>
                      <TableContainer
                        component={Paper}
                        sx={{
                          width: '100%',
                          maxWidth: '100%',
                          margin: '0 auto',
                          padding: '1rem',
                          boxSizing: 'border-box',
                        }}
                      >
                        <Table
                          sx={{
                            minWidth: 700,
                            '@media (max-width: 768px)': {
                              minWidth: '100%', // S'ajuste pour les petits écrans
                              fontSize: '0.8rem',
                            },
                          }}
                          aria-label="spanning table"
                        >
                          <TableHead>
                            <TableRow>
                              {/* <TableCell>Date</TableCell> */}
                              <TableCell>Designation</TableCell>
                              <TableCell align="right">Quantite</TableCell>
                              <TableCell align="right">Prix unitaire</TableCell>
                              <TableCell align="right">Somme</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectSorties.map((post, index) => (
                              <TableRow key={index}>
                                {/* <TableCell>
                                  {format(new Date(post.date), 'dd/MM/yyyy')}
                                </TableCell> */}
                                <TableCell>
                                  {post.ref} {" - "}
                                  {post.categorie_libelle}
                                </TableCell>
                                <TableCell align="right">{post.qte}</TableCell>
                                <TableCell align="right">{formatNumberWithSpaces(post.pu)}</TableCell>
                                <TableCell align="right">{formatNumberWithSpaces(post.prix_total)}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell rowSpan={3} />
                              <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>
                                Prix
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {formatNumberWithSpaces(total)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>
                                Remise
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {formatNumberWithSpaces(total - discountedTotal)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>
                                Total
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {formatNumberWithSpaces(discountedTotal)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <ChildModal />
                    </Box>
                  </Modal>                  

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

                </div>                
                
                <div className="flex justify-center mt-4">

                {(unUser.role === 1 || unUser.role === 2) && 
                  <>                
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
                  </>
                }

                {unUser.role === 1 &&                 
                  <Grid item>
                    <Typography variant="h5" className='mx-2'>
                      Chiffre d'affaire = {formatNumberWithSpaces(totalPrice)} <LocalAtmIcon fontSize='medium' color="primary" />
                    </Typography>
                  </Grid>
                }               
                  
                </div>
                
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
              clientName={clientInfo.clientName || texte.clientName}
              clientAddress={clientInfo.clientAddress || texte.clientAddress}
              clientCoordonne={clientInfo.clientCoordonne || texte.clientCoordonne}
              invoiceNumber={clientInfo.clientNumero || texte.invoiceNumber}
              invoiceDate={texte.invoiceDate}
              numeroFac={texte.numeroFac}
              dueDate={texte.dueDate}
              notes={texte.notes}
              post={entreprise}
              discountedTotal={discountedTotal}
              />
            )
            
            }
          </div>
      
          </>
        );
      }
}
