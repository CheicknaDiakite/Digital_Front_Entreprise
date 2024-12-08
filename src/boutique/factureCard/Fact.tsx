import { useEffect, useRef, useState } from 'react'
import ReactToPrint from 'react-to-print'
import Header from './component/Header';
import MainDetails from './component/MainDetails';
import ClientDetails from './component/ClientDetails';
import Dates from './component/Dates';
import Notes from './component/Notes';
import Footer from './component/Footer';
import RemoveIcon from '@mui/icons-material/Remove';
import { useStoreCart } from '../../usePerso/cart_store';
import TableFact from './TableFact';
// import { generateOrderNumber } from '../../usePerso/fonctionPerso';
import { BASE } from '../../_services/caller.service';
import { RecupType } from '../../typescript/DataType';


export default function Fact({clientName, clientAddress, clientCoordonne, invoiceNumber, invoiceDate, dueDate, notes, numeroFac,  post}: RecupType | any) {
  let url = BASE(post.image);
  
  
  const selectedIds = useStoreCart(state => state.selectedIds)
  const reset = useStoreCart(state => state.reset)
  const sorties = useStoreCart(state => state.sorties);
  const selectSorties = sorties.filter((sor) => sor.id !== undefined && selectedIds.has(sor.id as number));
  const totalPrix = selectSorties.reduce((sum, sor) => sum + sor.prix_total, 0);
    
  const [bankName] = useState<string>("");
  const [bankAccount] = useState<string>("");
  const [website] = useState<string>("");
  const [quantity] = useState<number>(0);
  const [price] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);

  // const componentRef = useRef();
  const componentRef = useRef<HTMLDivElement>(null);

  // Calculate items amount function
  useEffect(() => {
    const calculateAmount = () => {
      setAmount(quantity * price);
    };

    calculateAmount();
  }, [amount, price, quantity, setAmount]);

  // const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // const handleClick = () => {
  //   const newOrderNumber = generateOrderNumber();
  //   setOrderNumber(newOrderNumber);
  // };

  return (
    <>
    <main
        className="m-5 p-5 xl:grid grid-cols-1 gap-10 xl:items-start"
        style={{
          maxWidth: "1920px",
          margin: "auto",
        }}
      >
        {/* Invoice Preview */}
        <div className="invoice__preview bg-white p-5 rounded-2xl border-4 border-green-300">
            <button type="button" className="bg-red-500 ml-5 text-white font-bold py-2 px-8 rounded hover:bg-red-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-red-400" onClick={()=>reset()}>
                <RemoveIcon />
            </button>
          <ReactToPrint
            trigger={() => (
              <button className="bg-green-500 ml-5 text-white font-bold py-2 px-8 rounded hover:bg-green-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-green-400">
                Print / Download
              </button>
            )}
            content={() => componentRef.current}
          />
          {/* <button onClick={handleClick} className="bg-sky-500 ml-5 text-white font-bold py-2 px-8 rounded hover:bg-sky-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-sky-400">
            Numero de la facture (Auto)
          </button> */}
          <div ref={componentRef} className="p-8 m-8">
            <Header
            // orderNumber={orderNumber}
            nom={post.nom}
            numeroFac={numeroFac}
            url={url}
            />

            <MainDetails
            name={post.nom}
            address={post.adresse}
            numero={post.numero}
            coordonne={post.coordonne}
            />

            <ClientDetails 
            clientName={clientName}
            clientAddress={clientAddress}
            clientCoordonne={clientCoordonne}
            invoiceNumber={invoiceNumber}
            />

            <Dates 
            invoiceNumber={invoiceNumber}
            invoiceDate={invoiceDate}
            dueDate={dueDate}
            />

            <TableFact
            list={selectSorties}
            total={totalPrix}
            />

            <Notes 
            notes={notes}
            />

            <Footer 
            name={post.nom}
            email={post.email}
            website={website}
            phone={post.numero}
            bankAccount={bankAccount}
            bankName={bankName}
            />
          </div>
        </div>
      </main>
    </>
  )
}
