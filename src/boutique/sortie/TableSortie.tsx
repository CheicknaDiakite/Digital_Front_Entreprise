import { ToastContainer } from 'react-toastify'
import { Autocomplete, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import CardTableSortie from './CardTableSortie';
import { useGetAllEntre } from '../../usePerso/fonction.entre';
import { connect } from '../../_services/account.service';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import QuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import { Money } from '../../_components/icons/Money';
import MyTextField from '../../_components/Input/MyTextField';
import { ABType } from '../../typescript/Account';
import { useAllClients, useFetchEntreprise } from '../../usePerso/fonction.user';
import { useStoreUuid } from '../../usePerso/store';
import { isLicenceExpired } from '../../usePerso/fonctionPerso';



export default function TableSortie({onSubmit, amount, list, handleAutoCompleteChange, handleAutoClientChange, onChange, formValues}: any) {
  const entreprise_uuid = useStoreUuid((state) => state.selectedId)
  const {unEntreprise} = useFetchEntreprise(entreprise_uuid!)
  const {entresEntreprise: entres} = useGetAllEntre(connect, entreprise_uuid!)
  
  const { getClients } = useAllClients(entreprise_uuid!);
  const clients = getClients.filter(info => info.role == 1 || info.role == 3);
  
  const sortedList = list?.sort((a: ABType, b: ABType) => {
    if (a.id === undefined) return 1;
    if (b.id === undefined) return -1;
    return b.id - a.id;
  });
  return (
    <>
      <ToastContainer position="top-right" theme="colored" />

      <form onSubmit={onSubmit}>
        <div className="flex flex-col md:mt-1 py-3">
          <div>        
            <Autocomplete
              id="free-solo-demo"
              freeSolo
              options={clients}
              getOptionLabel={(option) => (typeof option === 'string' ? option : option.nom || '')}
              onChange={handleAutoClientChange}
              renderInput={(params) => <TextField {...params} label="Client" />}
            />
          </div>

          <div className='mt-3'>        
            <Autocomplete
              id="free-solo-demo"
              freeSolo
              options={entres}
              getOptionLabel={(option) => (typeof option === 'string' ? option : (`${option.categorie_libelle} (${option.libelle}) [${option.qte}]`)  || '')}
              onChange={handleAutoCompleteChange}
              renderInput={(params) => <TextField {...params} label="Designation" />}
            />
          </div>
        </div>

        <div className="md:grid grid-cols-3 gap-10">
          <div className="flex flex-col">
           
            <Typography variant="h5" className='mb-2'>
              Quantite <QuantityLimitsIcon fontSize='large' />
            </Typography>
            <MyTextField 
              type="text"
              name="qte"
              value={formValues.qte}
              id="quantity"
              placeholder="Quantity"
              onChange={onChange}
            />
          </div>

          <div className="flex flex-col">
            
            <Typography variant="h5" className='mb-2'>
            Prix Unitaire <LocalAtmIcon fontSize='large' />
            </Typography>
            <MyTextField 
              type="text"
              name="pu"
              value={formValues.pu}
              id="price"
              placeholder="Price"
              onChange={onChange}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="amount">Somme <Money size={40} className='inline' /></label>
            <p>{amount}</p>
          </div>
        </div>
        {isLicenceExpired(unEntreprise.licence_date_expiration) ? (
          <Typography variant="h5" color="error" sx={{ mt: 1 }}>
            L'abonnement de cet Entreprise a expiré !
          </Typography>)
          :
        <button
          type="submit"
          className="bg-blue-500 mb-5 text-white font-bold mt-2 py-2 px-8 rounded hover:bg-blue-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-blue-400"
        >
          Ajouter
        </button>
        }
        
      </form>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="spanning table">
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Quantite</TableCell>
              <TableCell>Prix unitaire</TableCell>
              <TableCell>Somme</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            
            {sortedList.map((row: any, index: number ) => {
          
              return <CardTableSortie key={index} row={row} />
                
            })} 
          </TableBody>
        </Table>
      </TableContainer>

      <div>
        <h2 className="flex items-end justify-end text-gray-800 text-4xl font-bold">
          {/* CFA. {totalPrix} */}
          {/* <Money size={40} className='inline' /> */}
        </h2>
      </div>
    </>
  )
}
