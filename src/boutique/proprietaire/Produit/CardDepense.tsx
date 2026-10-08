import { Chip, TableCell, TableRow, useTheme, IconButton, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import { DepenseType } from '../../../typescript/DataType';
import { format } from 'date-fns';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { formatNumberWithSpaces } from '../../../usePerso/fonctionPerso';
import { useAppSettings } from '../../../themes/AppSettingsContext';
import { BASE } from '../../../_services/caller.service';

type EntreProps = {
  row: DepenseType;
};

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  Loyer: { bg: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' },
  Salaires: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  'Électricité & Eau': { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  Transport: { bg: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' },
  Télécoms: { bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' },
  Fournitures: { bg: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' },
  Entretien: { bg: 'rgba(20, 184, 166, 0.15)', color: '#14b8a6' },
  Autre: { bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b' },
};

export default function CardDepense({ row }: EntreProps) {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const validDate = row.date ?? new Date();
  const match = (row.libelle || '').match(/^\[(.*?)\]\s*(.*)$/);
  const category = match ? match[1] : 'Général';
  const description = match ? match[2] : row.libelle;

  const catStyle = CATEGORY_COLORS[category] || {
    bg: 'rgba(99, 102, 241, 0.12)',
    color: '#818cf8',
  };

  return (
    <TableRow
      sx={{
        transition: 'background-color 0.2s ease',
        '&:hover': {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
        },
        '& .MuiTableCell-root': {
          color: isDark ? '#f1f5f9' : '#334155',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(226, 232, 240, 0.7)',
          py: 1.5,
        },
      }}
    >
      {/* Date */}
      <TableCell sx={{ fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {format(new Date(validDate), 'dd/MM/yyyy')}
      </TableCell>

      {/* Catégorie */}
      <TableCell>
        <Chip
          size="small"
          label={category}
          sx={{
            height: 22,
            fontSize: '0.72rem',
            fontWeight: 700,
            bgcolor: catStyle.bg,
            color: catStyle.color,
            borderRadius: '6px',
          }}
        />
      </TableCell>

      {/* Libellé / Description */}
      <TableCell sx={{ fontWeight: 600, fontSize: '0.88rem' }}>
        {description}
      </TableCell>

      {/* Montant */}
      <TableCell align="right" sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', fontSize: '0.95rem' }}>
        <span style={{ color: '#ef4444' }}>- {formatNumberWithSpaces(row.somme)}</span>
        <span style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginLeft: 4 }}>F CFA</span>
      </TableCell>

      {/* Justificatif */}
      <TableCell align="center">
        {row.facture ? (
          <Tooltip title="Voir le justificatif">
            <IconButton
              size="small"
              component="a"
              href={typeof row.facture === 'string' ? BASE(row.facture) : '#'}
              target="_blank"
              rel="noreferrer"
              color="primary"
              sx={{ p: 0.5 }}
            >
              <ReceiptLongIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <span style={{ fontSize: '0.72rem', color: isDark ? '#64748b' : '#94a3b8' }}>—</span>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell align="center">
        <Tooltip title="Détail / Modifier">
          <IconButton
            size="small"
            component={Link}
            to={`/entreprise/depense/${row.uuid}`}
            color="info"
            sx={{ p: 0.5 }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
