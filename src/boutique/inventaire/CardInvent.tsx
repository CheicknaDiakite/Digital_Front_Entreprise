import { Stack, TableCell, TableRow } from '@mui/material'

import { Link } from 'react-router-dom';
import { formatNumberWithSpaces, getBgClass, priceRow } from '../../usePerso/fonctionPerso';
import { RecupType } from '../../typescript/DataType';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { format } from 'date-fns';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useFetchUser } from '../../usePerso/fonction.user';
import img from '../../../public/icon-192x192.png'
import { connect } from '../../_services/account.service';
import { BASE } from '../../_services/caller.service';

type EntreProps = {
  row: RecupType
}

export default function CardInvent({ row }: EntreProps) {
  const {unUser} = useFetchUser(connect)
  
  const url = row.image ? BASE(row.image) : img;
  const validDate = row.date ?? new Date();
  if (row.qte !== undefined && row.pu_achat !== undefined) {
    const price = priceRow(row.qte, row.pu_achat);

  return (
    <TableRow className={getBgClass(row.qte)}>
            
        <TableCell align="right"><img src={url} alt="img" className="h-16 w-16" /></TableCell>        
       
        <TableCell>
          {/* {row.date} */}
          {row.ref}
        </TableCell>
        <TableCell>
          {/* {row.date} */}
          {format(new Date(validDate), 'dd/MM/yyyy')}
        </TableCell>
        <TableCell>
          {row.client && 
            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
              {row.client}
            </span>
          }           
        </TableCell>
        <TableCell>
          {row.categorie_libelle}{" "}
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            {row.libelle}
          </span>           
        </TableCell>
        <TableCell align="right">{row.qte}</TableCell>
        <TableCell align="right">{formatNumberWithSpaces(row.pu)}</TableCell>
        {unUser.role === 1 &&  
        <>        
          <TableCell align="right">{formatNumberWithSpaces(row.pu_achat)}</TableCell>
          <TableCell align="right">{formatNumberWithSpaces(price)} <LocalAtmIcon color="primary" fontSize='small' /></TableCell>
        </>
        }

        {(unUser.role === 1 || unUser.role === 2) &&     
          <TableCell className={row.is_sortie ? 'bg-white' : 'bg-white'} >
            <Link to={`/entre/modif/${row.uuid}`}>
              <Stack direction="row" spacing={2}>
                {/* <Item>Modifier</Item> */}
                <VisibilityIcon color={row.is_sortie ? 'info' : 'error'} fontSize="medium" />
              </Stack>
            </Link>
          </TableCell>        
        }
    </TableRow>
  )
} else {
  console.log("erreur de typage PU | QTE")
}
}
