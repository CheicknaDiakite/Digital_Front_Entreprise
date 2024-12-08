import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import ReactToPrint from 'react-to-print'
import Footer from '../component/Footer'
import Notes from '../component/Notes'
import Dates from '../component/Dates'
import ClientDetails from '../component/ClientDetails'
import MainDetails from '../component/MainDetails'
import Header from '../component/Header'
import TableForm from '../component/TableForm'
import toast from 'react-hot-toast'
import { uniqueId } from 'lodash'
import { useFetchEntreprise } from '../../../usePerso/fonction.user'
import { generateOrderNumber } from '../../../usePerso/fonctionPerso'
import Nav from '../../../_components/Button/Nav'
import { BASE } from '../../../_services/caller.service'
import { Box, Button, Grid, Skeleton, Typography } from '@mui/material'
import TableList from '../component/Table'
import MyTextField from '../../../_components/Input/MyTextField'
import { useStoreUuid } from '../../../usePerso/store'

type ItemType = {
  id: string;
  description?: string;
  quantity?: number;
  price?: number;
  amount: number;
};
type TypeText = {
  clientName: string,
  clientAddress: string,
  clientCoordonne: string,
  invoiceDate: string,
  dueDate: string,
  notes: string,
  invoiceNumber: number,
  description: string,
  quantity: number,
  price: number,
  bankAccount: string,
  website: string,
  bankName: string,
  
}

export default function Facture() {
  const uuid = useStoreUuid((state) => state.selectedId)

  const {unEntreprise, isLoading, isError} = useFetchEntreprise(uuid!)
  // const {userEntreprises, isLoading, isError} = useGetUserEntreprises(String(connect))
  let url = BASE(unEntreprise.image as string | File);

  const [amount, setAmount] = useState<number>(0);
  const [list, setList] = useState<Array<ItemType>>([]);
  const [total] = useState<number>(0);
  
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // const componentRef = useRef();
  const componentRef = useRef<HTMLDivElement>(null);

  const [texte, setNom] = useState<TypeText>({
    clientName: '',
    clientAddress: '',
    clientCoordonne: '',
    invoiceDate: '',
    dueDate: '',
    notes: '',
    invoiceNumber: 0,
    description: '',
    quantity: 0,
    price: 0,
    bankAccount: '',
    website: '',
    bankName: '',
    
  });

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNom({
      ...texte,
      [name]: value,
    });
  };

  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const handleClick = () => {
    const newOrderNumber = generateOrderNumber();
    setOrderNumber(newOrderNumber);
  };

  const [showInvoice, setShowInvoice] = useState(false); // État pour afficher ou masquer la section de facture

  const handleInvoiceClick = () => {
    setShowInvoice(true); // Affiche la section de facture lorsque le bouton est cliqué
  };
  const handleFermerClick = () => {
    setShowInvoice(false); // Affiche la section de facture lorsque le bouton est cliqué
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!texte.description || !texte.quantity || !texte.price) {
      toast.error("Please fill in all inputs");
    } else {
      const newItems: ItemType = {
        id: uniqueId(),
        amount,
      };
      newItems["description"] = texte.description;
      newItems["quantity"] = texte.quantity;
      newItems["price"] = texte.price;
      // setQuantity("");
      // setPrice("");
      setAmount(0);
      setList([...list, newItems]);
      setIsEditing(false);
      console.log(list);
    }
  };

  // Calculate items amount function
  useEffect(() => {
    const calculateAmount = () => {
      setAmount(texte.quantity * texte.price);
    };

    calculateAmount();
  }, [amount, texte.price, texte.quantity, setAmount]);

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

  if (unEntreprise) {
    return (
      <>
      <Nav />
      <main
          className="m-5 p-5 gap-10 xl:items-center"
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
                      Bank de l'entreprise
                    </Typography>
                    <MyTextField 
                    type="text"
                    name="bankName"
                    placeholder="Nom de la bank de l'entreprise"
                    autoComplete="off"
                    // value={bankName}
                    onChange={onChange}
                    />
                  </div>
  
                  <div className="flex flex-col">
                    
                    <Typography variant="h5">
                      Numero de Bank
                    </Typography>
                    <MyTextField 
                    type="text"
                    name="bankAccount"
                    id="bankAccount"
                    placeholder="Bank numero"
                    autoComplete="off"
                    // value={bankAccount}
                    onChange={onChange}
                    />
                  </div>
                </article>
  
                <article className="md:grid grid-cols-2 gap-10 p-2">
                  <div className="flex flex-col">
                    
                    <Typography variant="h5">
                      Nom du client
                    </Typography>
                    <MyTextField 
                    type="text"
                    name="clientName"
                    placeholder="Nom du client"                    
                    autoComplete="off"
                    // value={clientName}
                    onChange={onChange}
                    />
                  </div>
  
                  <div className="flex flex-col">
                    
                    <Typography variant="h5">
                      Adresse du client
                    </Typography>
                    <MyTextField 
                    type="text"
                    name="clientAddress"
                    placeholder="Adresse du client"
                    autoComplete="off"
                    // value={clientAddress}
                    onChange={onChange}
                    />
                  </div>

                  <div className="flex flex-col">
                    
                    <Typography variant="h5">
                      Coordonne du client
                    </Typography>
                    <MyTextField 
                    type="text"
                    name="clientCoordonne"
                    placeholder="Coordonne du client"
                    autoComplete="off"
                    // value={clientCoordonne}
                    onChange={onChange}
                    />
                  </div>
                </article>
  
                <article className="md:grid grid-cols-3 gap-10">
                  <div className="flex flex-col">
                    
                    <Typography variant="h5">
                      Numero du client
                    </Typography>
                    <MyTextField 
                    type="number"
                    name="invoiceNumber"
                    placeholder="Numero du client"
                    autoComplete="off"
                    // value={invoiceNumber}
                    onChange={onChange}
                    />
                  </div>
  
                  <div className="flex flex-col">
                    
                    <Typography variant="h5">
                      Date de la facture
                    </Typography>
                    <MyTextField 
                    type="date"
                    name="invoiceDate"
                    placeholder="Date"
                    autoComplete="off"
                    // value={invoiceDate}
                    onChange={onChange}
                    />
                  </div>
  
                </article>

                <article className="md:grid grid-cols-3 mb-3 gap-10 mt-5">
                  <Button
                    variant="outlined"
                    className="bg-green-500 text-white font-bold rounded hover:bg-green-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-green-400"
                    onClick={handleInvoiceClick} // Appel du gestionnaire d'événements
                  >
                    Facture.
                  </Button>
                  <Button
                    variant="outlined"
                    className="bg-red-500 mx-3 text-white font-bold rounded hover:bg-red-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-red-400"
                    onClick={handleFermerClick} // Appel du gestionnaire d'événements
                  >
                    OFF.
                  </Button>
                </article>
  
                {/* This is our table form */}
                <article>
                  <TableForm 
                  isEditing={isEditing}
                  onChange={onChange}
                  handleSubmit={handleSubmit}
                  amount={amount}
                  list={list}
                  total={total}
                  />
                </article>
  
                {/* <label htmlFor="notes">Description des marchandises:</label> */}
                <Grid item>
                  <Typography variant="h5">Ajouter une notes: Description des marchandises</Typography>
                </Grid>
                <textarea
                  name="notes"
                  className="mt-2"
                  cols={30}
                  rows={10}
                  placeholder="Ajouter une note pour plus de details pour ce facture"
                  maxLength={500}
                  // value={notes}
                  onChange={onChange}
                ></textarea>
              </div>
            </div>
            {/* <article className="mt-5">
              <DonateButton />
            </article> */}
          </section>
  
          {(showInvoice && unEntreprise) && (
            
            
            <div className="invoice__preview bg-white p-5 mt-5 rounded-2xl border-4 border-green-300">
            <ReactToPrint
              trigger={() => (
                
                <Grid container>
                  <Grid >
                    <button className="bg-green-500 ml-5 text-white font-bold py-2 px-8 rounded hover:bg-green-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-green-400">
                      Print / Download
                    </button>
                  </Grid>
                                      
                </Grid>
                
                
              ) 
              }
              content={() => componentRef.current}
            />

            
            <Grid container className='pt-1'>
              <Grid >
              <button onClick={handleClick} className="bg-sky-500 ml-5 text-white font-bold py-2 px-8 rounded hover:bg-sky-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-sky-400">
                Numero de la facture
              </button>
              </Grid>
                                  
            </Grid>
            
            
            <div ref={componentRef} className="p-8 m-8">
                {/* <button onClick={handleClick} className="bg-green-500 ml-5 text-white font-bold py-2 px-8 rounded hover:bg-green-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-green-400">
                  Ordo-
                </button> */}
              <Header 
              orderNumber={orderNumber}
              nom={unEntreprise.nom}
              url={url}
              />
  
              <MainDetails
              name={unEntreprise.nom}
              address={unEntreprise.adresse}
              numero={unEntreprise.numero}
              coordonne={unEntreprise.coordonne}
              // url={url}
              />
  
              <ClientDetails 
              clientName={texte.clientName}
              clientAddress={texte.clientAddress}
              clientCoordonne={texte.clientCoordonne}
              invoiceNumber={texte.invoiceNumber}
              />
  
              <Dates 
              invoiceNumber={texte.invoiceNumber}
              invoiceDate={texte.invoiceDate}
              dueDate={texte.dueDate}
              />
  
              <TableList 
              list={list}
              total={total}
              />
  
              <Notes 
              notes={texte.notes}
              />
  
              <Footer 
              name={unEntreprise.nom}
              email={unEntreprise.email}
              website={texte.website}
              phone={unEntreprise.numero}
              bankAccount={texte.bankAccount}
              bankName={texte.bankName}
              />
            </div>
          </div>
          )}
          

      </main>
      </>
    )
  }

  
}
