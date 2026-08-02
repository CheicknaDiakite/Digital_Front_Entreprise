import { TableCell, TableRow } from '@mui/material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { RecupType } from '../../../../typescript/DataType';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { formatNumberWithSpaces, priceRow } from '../../../../usePerso/fonctionPerso';
import { useFetchUser } from '../../../../usePerso/fonction.user';

type EntreProps = {
  row: RecupType;
};

export default function CardClientEntrer({ row }: EntreProps) {
  const validDate = row.date ?? new Date();
  const { unUser } = useFetchUser();
  if (row.qte !== undefined && row.pu_achat !== undefined) {
    const price = priceRow(row.qte, row.pu_achat);

    return (
      <TableRow hover className="transition-colors hover:bg-slate-50/80">
        <TableCell sx={{ py: 1.5 }}>
          <Link
            to={`/entre/modif/${row.uuid}`}
            className="text-gray-800 hover:text-blue-600 font-medium hover:underline text-sm"
          >
            {format(new Date(validDate), 'dd/MM/yyyy')}
          </Link>
        </TableCell>

        <TableCell sx={{ py: 1.5 }}>
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="text-gray-800 font-medium text-sm">{row.categorie_libelle}</span>
            {row.libelle && (
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {row.libelle}
              </span>
            )}
          </div>
        </TableCell>

        <TableCell align="right" sx={{ py: 1.5, fontWeight: 600, color: '#334155' }}>
          {row.qte}
        </TableCell>

        <TableCell align="right" sx={{ py: 1.5, color: '#475569' }}>
          {formatNumberWithSpaces(row.pu_achat)} F
        </TableCell>

        <TableCell align="right" sx={{ py: 1.5, fontWeight: 700, color: '#2563eb' }}>
          {formatNumberWithSpaces(price)} F
        </TableCell>

        {(unUser.role === 1 || unUser.role === 2) && (
          <TableCell align="center" sx={{ py: 1.5 }}>
            <Link
              to={`/entre/modif/${row.uuid}`}
              className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Voir / Modifier"
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </Link>
          </TableCell>
        )}
      </TableRow>
    );
  } else {
    console.log("erreur de typage PU | QTE");
    return null;
  }
}

