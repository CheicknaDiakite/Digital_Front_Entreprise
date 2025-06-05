import { useEffect, useRef, useState } from 'react'
import ReactToPrint from 'react-to-print'
import Header from './component/Header';
// import MainDetails from './component/MainDetails';
// import ClientDetails from './component/ClientDetails';
// import Dates from './component/Dates';
import Notes from './component/Notes';
// import Footer from './component/Footer';
import RemoveIcon from '@mui/icons-material/Remove';
import PrintIcon from '@mui/icons-material/Print';
import { useStoreCart } from '../../usePerso/cart_store';
import TableFact from './TableFact';
import backgroundImage from '../../../public/assets/img/img.jpg'
import "./print.css";
// import { generateOrderNumber } from '../../usePerso/fonctionPerso';
import { BASE } from '../../_services/caller.service';
import { RecupType } from '../../typescript/DataType';
import { Paper } from '@mui/material';

export default function Fact({clientName, invoiceNumber, invoiceDate, notes, numeroFac, post, discountedTotal, payerTotal}: RecupType | any) {
  // let url = BASE(post.image);
  
    const url = post.image ? BASE(post.image) : backgroundImage;
  
  
  const selectedIds = useStoreCart(state => state.selectedIds)
  const reset = useStoreCart(state => state.reset)
  const sorties = useStoreCart(state => state.sorties);
  const selectSorties = sorties.filter((sor) => sor.id !== undefined && selectedIds.has(sor.id as number));
  // const totalPrix = selectSorties.reduce((sum, sor) => sum + sor.prix_total, 0);

  const totalPrix = selectSorties?.reduce((acc, sortie) => {
    // Convertir prix_total en nombre ou utiliser 0 si invalide
    const prixTotal = sortie.prix_total ? parseFloat(String(sortie.prix_total)) : 0;
    return acc + prixTotal;
  }, 0);
    
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <Paper elevation={0} className="bg-white rounded-lg overflow-hidden">
          <div className="p-6">
            {/* Actions Bar */}
            <div className="flex items-center justify-end space-x-4 mb-6">
              <button 
                onClick={() => reset()}
                className="inline-flex items-center px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors duration-200"
              >
                <RemoveIcon className="w-5 h-5 mr-2" />
                <span>Annuler</span>
              </button>
              
              <ReactToPrint
                trigger={() => (
                  <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200">
                    <PrintIcon className="w-5 h-5 mr-2" />
                    <span>Imprimer / Télécharger</span>
                  </button>
                )}
                content={() => componentRef.current}
              />
            </div>

            {/* Invoice Content */}
            <div 
              ref={componentRef} 
              className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 print-container"
            >
              <Header
              // orderNumber={orderNumber}
              nom={post.nom}
              numeroFac={numeroFac}
              url={url}
              email={post.email}
              address={post.adresse}
              numero={post.numero}
              coordonne={post.coordonne}
              clientName={clientName}
              invoiceDate={invoiceDate}
              invoiceNumber={invoiceNumber}
              />

              <TableFact
              list={selectSorties}
              total={totalPrix}
              discountedTotal={discountedTotal}
              payerTotal={payerTotal}
              />

              <Notes 
              notes={notes}
              />

            </div>
          </div>
        </Paper>
      </div>
    </div>
  )
}
