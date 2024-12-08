import { Checkbox, Stack, TableCell, TableRow } from '@mui/material'
import { ChangeEvent, Fragment, useState } from 'react'
import { useStoreCart } from '../../usePerso/cart_store';
import { format } from 'date-fns';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { Link } from 'react-router-dom';
import { useFetchUser } from '../../usePerso/fonction.user';
import { connect } from '../../_services/account.service';
import { formatNumberWithSpaces } from '../../usePerso/fonctionPerso';
import { BASE } from '../../_services/caller.service';
import img from '../../../public/icon-192x192.png'
export default function CardTableSortie({row}: any) {
  console.log("test ...", row);
  const url = row.image ? BASE(row.image) : img;
  const [checked, setChecked] = useState(false);
  const {unUser} = useFetchUser(connect)
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
  setChecked(event.target.checked);
  };
  const addId = useStoreCart(state => state.toggleId)
  const id = row.id ?? 0;

  return <Fragment >
  <TableRow>            
    <TableCell align="right"><img src={url} alt="img" className="h-16 w-16" /></TableCell>        
    <TableCell>
      <Checkbox
        onClick={() => addId(id)}
        checked={checked}
        onChange={handleChange}
        inputProps={{ 'aria-label': 'controlled' }}
      />
      {format(new Date(row.date), 'dd/MM/yyyy')}
    </TableCell>

    <TableCell>
      {row.client && 
        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
          {row.client}
        </span>
      }           
    </TableCell>
    
    <TableCell>
      {row.categorie_libelle}
    </TableCell>
    <TableCell >{row.qte}</TableCell>
    <TableCell >{row.pu}</TableCell>        
    <TableCell >{formatNumberWithSpaces(row.prix_total)} <LocalAtmIcon color="primary" fontSize='small' /></TableCell>
    {/* {ccyFormat(price)} */}
    {(unUser.role === 1 || unUser.role === 2) &&     
    <TableCell>
      <Link to={`/sortie/modif/${row.uuid}`}>
        <Stack direction="row" spacing={2}>
          {/* <Item>Modifier</Item> */}
          <VisibilityIcon color="info" fontSize="medium" />
        </Stack>
      </Link>
    </TableCell>        
    }       
  </TableRow>
</Fragment>
}
