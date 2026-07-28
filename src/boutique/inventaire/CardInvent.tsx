import { useState } from 'react';
import {
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { formatNumberWithSpaces, getBgClass, priceRow } from '../../usePerso/fonctionPerso';
import { RecupType } from '../../typescript/DataType';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { format } from 'date-fns';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useFetchUser } from '../../usePerso/fonction.user';
import img from '../../../public/icon-192x192.png';
import { BASE } from '../../_services/caller.service';
import CloseIcon from '@mui/icons-material/Close';
import QrCode2Icon from '@mui/icons-material/QrCode2';

// import { saveAs } from 'file-saver';

// const downloadImage = async (imageUrl: string, filename: string) => {
//   try {
//     const response = await fetch(imageUrl, { mode: 'cors' });
//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }
//     const blob = await response.blob();
//     const blobUrl = URL.createObjectURL(blob);

//     // Création d'un lien temporaire pour lancer le téléchargement
//     const link = document.createElement('a');
//     link.href = blobUrl;
//     link.download = filename;
//     document.body.appendChild(link);
//     link.click();

//     // Nettoyage : suppression du lien et révocation de l'URL blob
//     document.body.removeChild(link);
//     URL.revokeObjectURL(blobUrl);
//   } catch (error) {
//     console.error('Erreur lors du téléchargement de l\'image:', error);
//   }
// };

type EntreProps = {
  row: RecupType
}

export default function CardInvent({ row }: EntreProps) {
  const { unUser } = useFetchUser();
  const [open, setOpen] = useState(false);
  const functionOpen = () => {
    setOpen(true);
  };
  const closeOpen = () => {
    setOpen(false);
  };
  
  const url = row.image ? BASE(row.image) : img;
  const code_barre = row.code_barre ? BASE(row.code_barre) : img;
  const validDate = row.date ?? new Date();
  const isCritical = (row.qte ?? 0) <= (row.qte_critique ?? 0);

  if (row.qte !== undefined && row.pu_achat !== undefined) {
    const price = priceRow(row.qte, row.pu_achat);

    return (
      <>
        <TableRow
          className={getBgClass(row.qte, row?.qte_critique)}
          sx={{
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            },
            '& td': {
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            },
          }}
        >
          <TableCell align="left" sx={{ width: 88 }}>
            <Avatar
              alt={row.ref ?? 'article'}
              src={url}
              sx={{
                width: 58,
                height: 58,
                border: '2px solid rgba(255,255,255,0.18)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
              }}
            />
          </TableCell>

          <TableCell>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'white' }}>
                {row.ref}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.74)' }}>
                {row.uuid?.slice(0, 8).toUpperCase()}
              </Typography>
            </Box>
          </TableCell>

          <TableCell>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
              {format(new Date(validDate), 'dd/MM/yyyy')}
            </Typography>
          </TableCell>

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
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Aucun fournisseur
              </Typography>
            )}
          </TableCell>

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

          <TableCell align="right">
            <Chip
              label={`${row.qte} ${row.unite === 'kilos' ? '' : row.unite}`.trim()}
              color={isCritical ? 'warning' : 'success'}
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </TableCell>

          <TableCell align="right">
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 700 }}>
              {formatNumberWithSpaces(row.pu)}
            </Typography>
          </TableCell>

          {unUser.role === 1 && (
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

          {(unUser.role === 1 || unUser.role === 2) && (
            <TableCell>
              <Link to={`/entre/modif/${row.uuid}`}>
                <Tooltip title="Voir les détails">
                  <IconButton size="small" sx={{ bgcolor: 'rgba(59,130,246,0.14)', color: '#93c5fd' }}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Link>
            </TableCell>
          )}

          <TableCell>
            <Tooltip title="Voir le code QR">
              <IconButton size="small" onClick={functionOpen} sx={{ bgcolor: 'rgba(16,185,129,0.14)', color: '#6ee7b7' }}>
                <QrCode2Icon fontSize="small" />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>

        <Dialog open={open} onClose={closeOpen} fullWidth maxWidth="xs">
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Code QR / barre
            </Typography>
            <IconButton onClick={closeOpen} size="small" sx={{ color: '#2563eb' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ textAlign: 'center', py: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2,
                borderRadius: 3,
                bgcolor: 'rgba(248,250,252,0.9)',
                border: '1px solid rgba(226,232,240,0.9)',
              }}
            >
              <img src={code_barre} alt="Code barre" style={{ maxHeight: 220, maxWidth: '100%', borderRadius: 12 }} />
            </Box>

            <a href={code_barre} download style={{ textDecoration: 'none' }}>
              <Box
                component="button"
                sx={{
                  mt: 2,
                  px: 2.2,
                  py: 1.1,
                  border: 'none',
                  borderRadius: 999,
                  cursor: 'pointer',
                  bgcolor: 'linear-gradient(135deg, #2563eb, #10b981)',
                  color: '#fff',
                  fontWeight: 700,
                  boxShadow: '0 8px 20px rgba(37,99,235,0.2)',
                }}
              >
                Télécharger l’image
              </Box>
            </a>
          </DialogContent>
        </Dialog>
      </>
    );
  } else {
    return null;
  }
}
