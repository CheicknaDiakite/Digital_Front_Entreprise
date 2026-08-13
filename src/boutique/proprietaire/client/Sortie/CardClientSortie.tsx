import { Checkbox, TableCell, TableRow, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { RecupType } from '../../../../typescript/DataType';
import { formatNumberWithSpaces, priceRow } from '../../../../usePerso/fonctionPerso';
import { useStoreCart } from '../../../../usePerso/cart_store';
import { ChangeEvent, useState } from 'react';
import { BASE } from '../../../../_services/caller.service';
import img from '../../../../../public/icon-192x192.png';
import { useAppSettings } from '../../../../themes/AppSettingsContext';

type EntreProps = {
  row: RecupType;
};

export default function CardClientSortie({ row }: EntreProps | any) {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const id = row.id ?? 0;
  const url = row.image ? BASE(row.image) : img;

  const validDate = row.date ?? new Date();
  const [checked, setChecked] = useState(false);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  const addId = useStoreCart((state) => state.toggleId);
  if (row.qte !== undefined && row.pu !== undefined) {
    const price = priceRow(row.qte, row.pu);

    return (
      <TableRow 
        hover 
        sx={{
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.03)',
          },
          '& .MuiTableCell-root': {
            color: isDark ? '#f1f5f9' : '#334155',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)',
          },
        }}
      >
        <TableCell align="center" sx={{ width: 64, py: 1.5 }}>
          <img
            src={url}
            alt="produit"
            className="h-10 w-10 rounded-lg object-cover border border-gray-200 shadow-sm mx-auto"
          />
        </TableCell>

        <TableCell sx={{ py: 1.5 }}>
          <div className="flex items-center space-x-2">
            <Checkbox
              size="small"
              onClick={() => addId(id)}
              checked={checked}
              onChange={handleChange}
              inputProps={{ 'aria-label': 'sélectionner vente' }}
            />
            <Link
              to={`/sortie/modif/${row.uuid}`}
              style={{ color: isDark ? '#93c5fd' : '#1e293b' }}
              className="font-medium hover:underline text-sm"
            >
              {format(new Date(validDate), 'dd/MM/yyyy')}
            </Link>
          </div>
        </TableCell>

        <TableCell sx={{ py: 1.5 }}>
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            {row.ref}
          </span>
        </TableCell>

        <TableCell sx={{ py: 1.5 }}>
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span style={{ color: isDark ? '#f1f5f9' : '#1e293b' }} className="font-medium text-sm">{row.categorie_libelle}</span>
            {row.libelle && (
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {row.libelle}
              </span>
            )}
          </div>
        </TableCell>

        <TableCell align="right" sx={{ py: 1.5, fontWeight: 600, color: isDark ? '#f1f5f9' : '#334155' }}>
          {row.qte}
        </TableCell>

        <TableCell align="right" sx={{ py: 1.5, color: isDark ? 'rgba(255, 255, 255, 0.75)' : '#475569' }}>
          {formatNumberWithSpaces(row.pu)} F
        </TableCell>

        <TableCell align="right" sx={{ py: 1.5, fontWeight: 700, color: isDark ? '#60a5fa' : '#1d4ed8' }}>
          {formatNumberWithSpaces(price)} F
        </TableCell>
      </TableRow>
    );
  } else {
    console.log("erreur de typage PU | QTE");
    return null;
  }
}

