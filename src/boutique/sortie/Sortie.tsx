import { Box, Button, Grid, Pagination, Skeleton, TextField, Typography } from "@mui/material";
import { ChangeEvent, FormEvent, SyntheticEvent, useEffect, useState } from "react";
import { RecupType, SortieType } from "../../typescript/DataType";
import { connect } from "../../_services/account.service";
import { useStoreCart } from "../../usePerso/cart_store";
import { useCreateSortie, useFetchAllSortie, useGetAllSortie } from "../../usePerso/fonction.entre";
import Fact from "../factureCard/Fact";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import TableSortie from "./TableSortie";
import { useFetchEntreprise, useFetchUser } from "../../usePerso/fonction.user";
import Nav from "../../_components/Button/Nav";
import MyTextField from "../../_components/Input/MyTextField";
import { useStoreUuid } from "../../usePerso/store";
import { formatNumberWithSpaces } from "../../usePerso/fonctionPerso";
 
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

  const totalPrice = reversedSorties?.reduce((acc, row: RecupType) => {
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
    
      const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        formValues["user_id"]= connect
       
        ajoutSortie(formValues)

        setFormValues({
          user_id: '',
          qte: 0,
          pu: 0,
          entre_id: '',
        })
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


                </div>
                {unUser.role === 1 && 
                
                <div className="flex justify-center mt-4">
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

                  <Grid item>
                    <Typography variant="h5" className='mx-2'>
                      Chiffre d'affaire = {formatNumberWithSpaces(totalPrice)} <LocalAtmIcon fontSize='medium' color="primary" />
                    </Typography>
                  </Grid>

                </div>
                }
                
                <TableSortie 
                onSubmit={onSubmit}
                onChange={onChange}
                formValues={formValues}
                amount={amount}
                handleAutoCompleteChange={handleAutoCompleteChange}
                handleAutoClientChange={handleAutoClientChange}
                handleSaveSorties={handleSaveSorties}
                list={sortiesBoutic}
                
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
                <Typography variant="h5">Ajouter une notes</Typography>
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
              clientName={texte.clientName}
              clientAddress={texte.clientAddress}
              clientCoordonne={texte.clientCoordonne}
              invoiceNumber={texte.invoiceNumber}
              invoiceDate={texte.invoiceDate}
              numeroFac={texte.numeroFac}
              dueDate={texte.dueDate}
              notes={texte.notes}
              post={entreprise}
              />
            )
            
            }
          </div>
      
          </>
        );
      }
}
