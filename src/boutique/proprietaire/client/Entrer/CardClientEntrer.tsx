import { TableCell, TableRow, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { RecupType } from '../../../../typescript/DataType';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { formatNumberWithSpaces, priceRow } from '../../../../usePerso/fonctionPerso';
import { useFetchUser } from '../../../../usePerso/fonction.user';
import { useAppSettings } from '../../../../themes/AppSettingsContext';

type EntreProps = {
  row: RecupType;
};

export default function CardClientEntrer({ row }: EntreProps) {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const validDate = row.date ?? new Date();
  const { unUser } = useFetchUser();
  if (row.qte !== undefined && row.pu_achat !== undefined) {
    const price = priceRow(row.qte, row.pu_achat);

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
        <TableCell sx={{ py: 1.5 }}>
          <Link
            to={`/entre/modif/${row.uuid}`}
            style={{ color: isDark ? '#93c5fd' : '#1e293b' }}
            className="font-medium hover:underline text-sm"
          >
            {format(new Date(validDate), 'dd/MM/yyyy')}
          </Link>
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
          {formatNumberWithSpaces(row.pu_achat)} F
        </TableCell>

        <TableCell align="right" sx={{ py: 1.5, fontWeight: 700, color: isDark ? '#60a5fa' : '#2563eb' }}>
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

