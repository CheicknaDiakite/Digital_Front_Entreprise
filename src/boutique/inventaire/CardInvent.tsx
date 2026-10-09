import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { formatNumberWithSpaces, priceRow } from '../../usePerso/fonctionPerso';
import { RecupType } from '../../typescript/DataType';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { format } from 'date-fns';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useFetchUser } from '../../usePerso/fonction.user';
import img from '../../../public/icon-192x192.png';
import { BASE } from '../../_services/caller.service';
import CloseIcon from '@mui/icons-material/Close';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import DownloadIcon from '@mui/icons-material/Download';

type EntreProps = {
  row: RecupType;
};

type StockStatus = 'out_of_stock' | 'critical' | 'warning' | 'normal';

const getStockStatus = (qte: number = 0, qteCritique: number = 0): StockStatus => {
  if (qte <= 0) return 'out_of_stock';
  if (qteCritique > 0 && qte <= qteCritique) return 'critical';
  if (qteCritique > 0 && qte <= qteCritique * 1.5) return 'warning';
  if (!qteCritique && qte <= 5) return 'warning';
  return 'normal';
};

export default function CardInvent({ row }: EntreProps) {
  const { unUser } = useFetchUser();
  const isOwner = unUser.role === 1 || !unUser.role || unUser.role === 0;
  const isManager = unUser.role === 2;
  const canManageStock = isOwner || isManager;
  const [open, setOpen] = useState(false);

  const functionOpen = () => setOpen(true);
  const closeOpen = () => setOpen(false);

  const url = row.image ? BASE(row.image) : img;
  const code_barre = row.code_barre ? BASE(row.code_barre) : img;
  const validDate = row.date ?? new Date();

  const qte = row.qte ?? 0;
  const qteCritique = row.qte_critique ?? 0;
  const puAchat = row.pu_achat ?? 0;
  const price = priceRow(qte, puAchat);
  const stockStatus = getStockStatus(qte, qteCritique);

  // Configuration visuelle professionnelle par statut
  const statusConfig = {
    out_of_stock: {
      borderColor: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.08)',
      hoverBg: 'rgba(239, 68, 68, 0.14)',
      chipColor: 'error' as const,
      chipLabel: 'Rupture de stock',
      tooltip: 'Quantité nulle ou épuisée',
    },
    critical: {
      borderColor: '#f97316',
      bg: 'rgba(249, 115, 22, 0.06)',
      hoverBg: 'rgba(249, 115, 22, 0.12)',
      chipColor: 'warning' as const,
      chipLabel: `Critique (≤ ${qteCritique})`,
      tooltip: `Quantité en-dessous du seuil critique (${qteCritique})`,
    },
    warning: {
      borderColor: '#eab308',
      bg: 'rgba(234, 179, 8, 0.04)',
      hoverBg: 'rgba(234, 179, 8, 0.09)',
      chipColor: 'warning' as const,
      chipLabel: 'Stock faible',
      tooltip: qteCritique ? `Approche du seuil critique (${qteCritique})` : 'Stock bas',
    },
    normal: {
      borderColor: 'transparent',
      bg: 'transparent',
      hoverBg: 'rgba(255, 255, 255, 0.05)',
      chipColor: 'success' as const,
      chipLabel: '',
      tooltip: 'Stock disponible',
    },
  }[stockStatus];

  if (row.qte === undefined) {
    return null;
  }

  const unitLabel = row.unite === 'kilos' ? 'kg' : row.unite || '';

  return (
    <>
      <TableRow
        sx={{
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          bgcolor: statusConfig.bg,
          borderLeft: `4px solid ${statusConfig.borderColor}`,
          '&:hover': {
            bgcolor: statusConfig.hoverBg,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
          },
          '& td': {
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          },
        }}
      >
        {/* Image / Avatar */}
        <TableCell align="left" sx={{ width: 88 }}>
          <Avatar
            alt={row.ref ?? 'article'}
            src={url}
            sx={{
              width: 54,
              height: 54,
              border: '2px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
            }}
          />
        </TableCell>

        {/* Date */}
        <TableCell>
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
            {format(new Date(validDate), 'dd/MM/yyyy')}
          </Typography>
        </TableCell>

        {/* Fournisseur */}
        <TableCell>
          {row.client ? (
            <Chip
              label={row.client}
              size="small"
              sx={{
                bgcolor: 'rgba(129,140,248,0.16)',
                color: '#e0e7ff',
                border: '1px solid rgba(129,140,248,0.28)',
                fontWeight: 600,
              }}
            />
          ) : (
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Aucun fournisseur
            </Typography>
          )}
        </TableCell>

        {/* Catégorie et Libellé */}
        <TableCell>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
              {row.categorie_libelle}
            </Typography>
            {row.libelle && (
              <Chip
                label={row.libelle}
                size="small"
                sx={{
                  bgcolor: 'rgba(59,130,246,0.16)',
                  color: '#dbeafe',
                  border: '1px solid rgba(59,130,246,0.28)',
                  width: 'fit-content',
                }}
              />
            )}
          </Box>
        </TableCell>

        {/* Quantité & Statut Professionnel */}
        <TableCell align="right">
          <Tooltip title={statusConfig.tooltip} arrow placement="top">
            <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.4 }}>
              <Chip
                label={`${qte} ${unitLabel}`.trim()}
                color={statusConfig.chipColor}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  boxShadow: stockStatus === 'out_of_stock' ? '0 0 10px rgba(239, 68, 68, 0.4)' : 'none',
                }}
              />
              {statusConfig.chipLabel && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    color: statusConfig.borderColor,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {statusConfig.chipLabel}
                </Typography>
              )}
            </Box>
          </Tooltip>
        </TableCell>

        {/* Prix unitaire de vente */}
        <TableCell align="right">
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 700 }}>
            {formatNumberWithSpaces(row.pu)}
          </Typography>
        </TableCell>

        {/* Données administrateur (Prix d'achat et Total) */}
        {isOwner && (
          <>
            <TableCell align="right">
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                {formatNumberWithSpaces(row.pu_achat)}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.6 }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 700 }}>
                  {formatNumberWithSpaces(price)}
                </Typography>
                <LocalAtmIcon color="primary" fontSize="small" />
              </Box>
            </TableCell>
          </>
        )}

        {/* Action : Voir les détails */}
        {canManageStock && (
          <TableCell>
            <Link to={`/entre/modif/${row.uuid}`}>
              <Tooltip title="Voir les détails">
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: 'rgba(59,130,246,0.14)',
                    color: '#93c5fd',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: 'rgba(59,130,246,0.25)', transform: 'scale(1.05)' },
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Link>
          </TableCell>
        )}

        {/* Action : Code QR */}
        <TableCell>
          <Tooltip title="Voir le code QR">
            <IconButton
              size="small"
              onClick={functionOpen}
              sx={{
                bgcolor: 'rgba(16,185,129,0.14)',
                color: '#6ee7b7',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'rgba(16,185,129,0.25)', transform: 'scale(1.05)' },
              }}
            >
              <QrCode2Icon fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {/* Modal Dialog pour Code QR / Code barre */}
      <Dialog
        open={open}
        onClose={closeOpen}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            bgcolor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
            Code QR / barre
          </Typography>
          <IconButton onClick={closeOpen} size="small" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white' } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            }}
          >
            <img src={code_barre} alt="Code barre" style={{ maxHeight: 220, maxWidth: '100%', borderRadius: 8 }} />
          </Box>

          <Typography variant="body2" sx={{ mt: 2, fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>
            Code : {row.barcode_value || row.ref}
          </Typography>
          {row.categorie_libelle && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 1.5 }}>
              {row.categorie_libelle} {row.libelle ? `(${row.libelle})` : ''}
            </Typography>
          )}

          <Button
            component="a"
            href={code_barre}
            download={`code-barre-${row.ref || 'produit'}.png`}
            startIcon={<DownloadIcon />}
            variant="contained"
            sx={{
              mt: 1.5,
              borderRadius: '999px',
              textTransform: 'none',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2563eb, #10b981)',
              boxShadow: '0 8px 20px rgba(37,99,235,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8, #059669)',
              },
            }}
          >
            Télécharger l’image
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
