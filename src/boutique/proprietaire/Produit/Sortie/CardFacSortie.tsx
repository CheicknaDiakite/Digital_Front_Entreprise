import { TableCell, TableRow, Chip, IconButton, Tooltip, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { format } from 'date-fns';
import { useAppSettings } from '../../../../themes/AppSettingsContext';

export default function CardFacSortie({ row }: { row: any }) {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const validDate = row.date ? new Date(row.date) : new Date();

  return (
    <TableRow
      sx={{
        transition: 'background-color 0.2s ease',
        '&:hover': {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
        },
        '& .MuiTableCell-root': {
          color: isDark ? '#f1f5f9' : '#334155',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)',
          py: 1.8,
        },
      }}
    >
      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
        {format(validDate, 'dd/MM/yyyy')}
      </TableCell>

      <TableCell>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.82rem',
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
            color: '#3b82f6',
            border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #bfdbfe',
          }}
        >
          {row.libelle || 'Facture'}
        </span>
      </TableCell>

      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem' }}>
        {row.ref || '—'}
      </TableCell>

      <TableCell>
        {row.facture ? (
          <Chip
            icon={<AttachFileIcon sx={{ fontSize: '14px !important', color: '#10b981 !important' }} />}
            label="Pièce jointe"
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.72rem',
              borderRadius: '6px',
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          />
        ) : (
          <span style={{ fontSize: '0.78rem', color: isDark ? '#64748b' : '#94a3b8' }}>
            Aucun fichier
          </span>
        )}
      </TableCell>

      <TableCell align="right">
        <Tooltip title="Consulter & modifier">
          <IconButton
            component={Link}
            to={`/entreprise/produit/sortie/modif/${row.uuid}`}
            size="small"
            sx={{
              borderRadius: '10px',
              backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#eef2ff',
              color: '#6366f1',
              border: isDark ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid #c7d2fe',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.3)' : '#e0e7ff',
              },
            }}
          >
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
