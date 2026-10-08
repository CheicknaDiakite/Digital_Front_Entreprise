import * as React from 'react';
import {
  Box,
  Paper,
  Button,
  Avatar,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ClientModif } from './ModifClient/ClientModif';
import { useDeleteClient, useFetchEntreprise, useFetchUser, useUnClient } from '../../../usePerso/fonction.user';
import { a11yProps } from '../../../usePerso/fonctionPerso';
import { CustomTabPanel } from '../../../usePerso/useEntreprise';
import ClientEntrer from './Entrer/ClientEntrer';
import ClientSortie from './Sortie/ClientSortie';
import ClientHistorique from './ClientHistorique';
import { useStoreUuid } from '../../../usePerso/store';
import { useAppSettings } from '../../../themes/AppSettingsContext';

export default function ClientInfo() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { uuid } = useParams();
  const { unClient } = useUnClient(uuid!);
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;

  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(entreprise_uuid);

  const { unUser } = useFetchUser();
  const user_id = unUser?.uuid || '';

  if (unClient) {
    unClient["user_id"] = user_id;
  }

  const { deleteClient } = useDeleteClient();
  const [value, setValue] = React.useState(unEntreprise.licence_type === "Stock Simple" ? 2 : 0);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    deleteClient(unClient);
    setShowConfirm(false);
  };

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'CL';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleBadge = (role?: number) => {
    switch (role) {
      case 1:
        return {
          label: 'Client Acheteur',
          bg: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          border: 'rgba(59, 130, 246, 0.3)',
        };
      case 2:
        return {
          label: 'Fournisseur',
          bg: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)',
          color: '#a855f7',
          border: 'rgba(168, 85, 247, 0.3)',
        };
      case 3:
        return {
          label: 'Client & Fournisseur',
          bg: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          border: 'rgba(16, 185, 129, 0.3)',
        };
      default:
        return {
          label: 'Client',
          bg: isDark ? 'rgba(100, 116, 139, 0.2)' : 'rgba(100, 116, 139, 0.1)',
          color: '#64748b',
          border: 'rgba(100, 116, 139, 0.3)',
        };
    }
  };

  const roleBadge = getRoleBadge(unClient?.role);

  const cleanPhone = (phone?: string | number) => {
    if (!phone) return '';
    return String(phone).replace(/[^0-9]/g, '');
  };

  const handleCopyPhone = () => {
    if (unClient?.numero) {
      navigator.clipboard.writeText(String(unClient.numero));
      toast.success('Numéro copié dans le presse-papier !');
    }
  };

  return (
    <Box className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4">
      {/* Bouton retour rapide */}
      <Box className="flex items-center justify-between">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/entreprise/client')}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            borderRadius: '10px',
            color: isDark ? '#94a3b8' : '#64748b',
            '&:hover': {
              color: isDark ? '#f1f5f9' : '#0f172a',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          Retour au répertoire
        </Button>
      </Box>

      {/* Modal confirmation suppression */}
      <Dialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : '#ffffff',
            backdropFilter: 'blur(16px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        <DialogTitle className="flex items-center space-x-3 text-red-500">
          <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <WarningAmberRoundedIcon />
          </Avatar>
          <Typography variant="h6" className="font-bold" sx={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
            Supprimer le contact
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: isDark ? '#94a3b8' : '#475569', fontSize: '0.95rem', mt: 1 }}>
            Êtes-vous sûr de vouloir supprimer définitivement le contact{' '}
            <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
              {unClient?.nom || 'ce contact'}
            </strong>{' '}
            ? Cette opération supprimera sa fiche du répertoire.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setShowConfirm(false)}
            sx={{
              textTransform: 'none',
              borderRadius: '12px',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              color: isDark ? '#cbd5e1' : '#475569',
            }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            sx={{
              textTransform: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
              fontWeight: 600,
            }}
          >
            Confirmer la suppression
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hero / Profil Card Glassmorphique */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: '20px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          backdropFilter: 'blur(16px)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: isDark
            ? '0 12px 32px rgba(0, 0, 0, 0.4)'
            : '0 8px 30px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            <Avatar
              sx={{
                width: 72,
                height: 72,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                fontSize: '1.65rem',
                fontWeight: 800,
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)',
                border: '3px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {getInitials(unClient?.nom)}
            </Avatar>
            <div className="space-y-1.5">
              <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: isDark ? '#f8fafc' : '#0f172a',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {unClient?.nom || 'Chargement du contact...'}
                </Typography>
                <Chip
                  label={roleBadge.label}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    borderRadius: '8px',
                    backgroundColor: roleBadge.bg,
                    color: roleBadge.color,
                    border: `1px solid ${roleBadge.border}`,
                    fontSize: '0.78rem',
                  }}
                />
              </div>

              <Stack direction="row" spacing={2.5} className="flex-wrap gap-y-1 text-sm">
                {unClient?.numero && (
                  <div className="flex items-center space-x-1.5" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                    <PhoneOutlinedIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
                    <span className="font-medium">{unClient.numero}</span>
                    <Tooltip title="Copier le numéro">
                      <IconButton size="small" onClick={handleCopyPhone} sx={{ p: 0.3 }}>
                        <ContentCopyIcon sx={{ fontSize: 14, color: isDark ? '#64748b' : '#94a3b8' }} />
                      </IconButton>
                    </Tooltip>
                  </div>
                )}
                {unClient?.adresse && (
                  <div className="flex items-center space-x-1.5" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#10b981' }} />
                    <span className="font-medium">{unClient.adresse}</span>
                  </div>
                )}
                {!unClient?.adresse && !unClient?.numero && (
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                    <PersonOutlineIcon sx={{ fontSize: 16 }} />
                    <span>Fiche contact</span>
                  </div>
                )}
              </Stack>
            </div>
          </div>

          {/* Actions rapides de contact */}
          <div className="flex items-center flex-wrap gap-2.5 self-start md:self-center">
            {unClient?.numero && (
              <>
                <Button
                  component="a"
                  href={`tel:${unClient.numero}`}
                  variant="outlined"
                  size="small"
                  startIcon={<PhoneOutlinedIcon />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '10px',
                    borderColor: isDark ? 'rgba(59, 130, 246, 0.4)' : '#bfdbfe',
                    color: '#3b82f6',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderColor: '#3b82f6',
                    },
                  }}
                >
                  Appeler
                </Button>

                <Button
                  component="a"
                  href={`https://wa.me/${cleanPhone(unClient.numero)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  size="small"
                  startIcon={<WhatsAppIcon />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '10px',
                    borderColor: isDark ? 'rgba(34, 197, 94, 0.4)' : '#bbf7d0',
                    color: '#16a34a',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    '&:hover': {
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      borderColor: '#16a34a',
                    },
                  }}
                >
                  WhatsApp
                </Button>
              </>
            )}

            {unEntreprise.licence_type !== "Stock Simple" && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteOutlineIcon />}
                onClick={handleDelete}
                sx={{
                  textTransform: 'none',
                  borderRadius: '10px',
                  borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#fca5a5',
                  color: '#ef4444',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  '&:hover': {
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  },
                }}
              >
                Supprimer
              </Button>
            )}
          </div>
        </div>
      </Paper>

      {/* Main Tabs Component */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          background: isDark
            ? 'rgba(15, 23, 42, 0.65)'
            : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: isDark
            ? '0 12px 32px rgba(0, 0, 0, 0.35)'
            : '0 8px 30px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Navigation Tabs */}
        <Box
          sx={{
            px: { xs: 1.5, sm: 2.5 },
            pt: 1.5,
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)',
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(248, 250, 252, 0.6)',
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="onglets fiche contact"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                backgroundColor: '#3b82f6',
              },
              '& .MuiTab-root': {
                minHeight: '48px',
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isDark ? '#94a3b8' : '#64748b',
                padding: '10px 18px',
                marginRight: '8px',
                borderRadius: '10px 10px 0 0',
                transition: 'all 0.2s',
                '&:hover': {
                  color: isDark ? '#f1f5f9' : '#0f172a',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                },
                '&.Mui-selected': {
                  color: '#3b82f6',
                  fontWeight: 700,
                },
              },
            }}
          >
            {unEntreprise.licence_type !== "Stock Simple" && (
              <Tab
                value={0}
                label={
                  <div className="flex items-center space-x-2">
                    <ShoppingCartOutlinedIcon sx={{ fontSize: 18 }} />
                    <span>Ventes (Client)</span>
                  </div>
                }
                {...a11yProps(0)}
              />
            )}

            {unEntreprise.licence_type !== "Stock Simple" && (
              <Tab
                value={1}
                label={
                  <div className="flex items-center space-x-2">
                    <LocalShippingOutlinedIcon sx={{ fontSize: 18 }} />
                    <span>Achats (Fournisseur)</span>
                  </div>
                }
                {...a11yProps(1)}
              />
            )}

            <Tab
              value={2}
              label={
                <div className="flex items-center space-x-2">
                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  <span>Modifier la fiche</span>
                </div>
              }
              {...a11yProps(2)}
            />

            {unEntreprise.licence_type !== "Stock Simple" && (
              <Tab
                value={3}
                label={
                  <div className="flex items-center space-x-2">
                    <HistoryOutlinedIcon sx={{ fontSize: 18 }} />
                    <span>Historique & Journal</span>
                  </div>
                }
                {...a11yProps(3)}
              />
            )}
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box className="p-3 sm:p-6">
          {unEntreprise.licence_type !== "Stock Simple" && (
            <CustomTabPanel value={value} index={0}>
              <ClientSortie uuid={uuid!} />
            </CustomTabPanel>
          )}

          {unEntreprise.licence_type !== "Stock Simple" && (
            <CustomTabPanel value={value} index={1}>
              <ClientEntrer uuid={uuid!} />
            </CustomTabPanel>
          )}

          <CustomTabPanel value={value} index={unEntreprise.licence_type === "Stock Simple" ? 0 : 2}>
            <ClientModif uuid={uuid!} />
          </CustomTabPanel>

          {unEntreprise.licence_type !== "Stock Simple" && (
            <CustomTabPanel value={value} index={3}>
              <ClientHistorique uuid={uuid!} />
            </CustomTabPanel>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
