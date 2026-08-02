import * as React from 'react';
import {
  Box,
  Paper,
  IconButton,
  Button,
  Avatar,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useParams } from 'react-router-dom';
import { ClientModif } from './ModifClient/ClientModif';
import { useDeleteClient, useFetchEntreprise, useUnClient } from '../../../usePerso/fonction.user';
import { connect } from '../../../_services/account.service';
import { a11yProps } from '../../../usePerso/fonctionPerso';
import { CustomTabPanel } from '../../../usePerso/useEntreprise';
import ClientEntrer from './Entrer/ClientEntrer';
import ClientSortie from './Sortie/ClientSortie';
import ClientHistorique from './ClientHistorique';
import { useStoreUuid } from '../../../usePerso/store';
import { useAppSettings } from '../../../themes/AppSettingsContext';
import { useTheme } from '@mui/material';

export default function ClientInfo() {
  const theme = useTheme();
  const { uuid } = useParams();
  const { unClient } = useUnClient(uuid!);
  const { showBackground } = useAppSettings();
  const isDarkText = theme.palette.mode === 'dark' || showBackground;

  const entreprise_uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(entreprise_uuid);

  unClient["user_id"] = connect;

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

  const getRoleLabel = (role?: number) => {
    switch (role) {
      case 1:
        return { label: 'Client', color: 'primary' as const };
      case 2:
        return { label: 'Fournisseur', color: 'secondary' as const };
      case 3:
        return { label: 'Client & Fournisseur', color: 'info' as const };
      default:
        return { label: 'Client', color: 'default' as const };
    }
  };

  const roleInfo = getRoleLabel(unClient?.role);

  return (
    <Box className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4">
      {/* Modal confirmation suppression */}
      <Dialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px', p: 1 },
        }}
      >
        <DialogTitle className="flex items-center space-x-3 text-red-600">
          <Avatar className="bg-red-100 text-red-600">
            <WarningAmberRoundedIcon />
          </Avatar>
          <Typography variant="h6" className="font-bold text-gray-800">
            Supprimer le contact
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer définitivement le contact{' '}
            <strong className="text-gray-900">{unClient?.nom || 'ce client'}</strong> ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setShowConfirm(false)}
            sx={{ textTransform: 'none', borderRadius: '10px' }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            sx={{ textTransform: 'none', borderRadius: '10px', boxShadow: 'none' }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hero / Header Card du Client */}
      <Paper
        elevation={0}
        className="p-6 rounded-2xl border border-gray-200/40 bg-transparent transition-all duration-200"
        sx={{ background: 'transparent', bgcolor: 'transparent' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'primary.main',
                fontSize: '1.5rem',
                fontWeight: 700,
                boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
              }}
            >
              {getInitials(unClient?.nom)}
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                <Typography variant="h5" className="font-bold" color={isDarkText ? 'white' : 'text.primary'}>
                  {unClient?.nom || 'Chargement...'}
                </Typography>
                <Chip
                  label={roleInfo.label}
                  color={roleInfo.color}
                  size="small"
                  sx={{ fontWeight: 600, borderRadius: '6px' }}
                />
              </div>
              <Stack direction="row" spacing={3} className="text-gray-500 text-sm flex-wrap gap-y-1">
                {unClient?.numero && (
                  <div className="flex items-center space-x-1">
                    <PhoneOutlinedIcon fontSize="small" className="text-gray-400" />
                    <span>{unClient.numero}</span>
                  </div>
                )}
                {unClient?.adresse && (
                  <div className="flex items-center space-x-1">
                    <LocationOnOutlinedIcon fontSize="small" className="text-gray-400" />
                    <span>{unClient.adresse}</span>
                  </div>
                )}
              </Stack>
            </div>
          </div>

          {unEntreprise.licence_type !== "Stock Simple" && (
            <div className="flex items-center space-x-2 self-end sm:self-center">
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                onClick={handleDelete}
                sx={{
                  textTransform: 'none',
                  borderRadius: '10px',
                  borderColor: '#fca5a5',
                  color: '#dc2626',
                  '&:hover': {
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(254, 242, 242, 0.5)',
                  },
                }}
              >
                Supprimer
              </Button>
            </div>
          )}
        </div>
      </Paper>

      {/* Main Tabs Component */}
      <Paper
        elevation={0}
        className="rounded-2xl border border-gray-200/40 bg-transparent overflow-hidden"
        sx={{ background: 'transparent', bgcolor: 'transparent' }}
      >
        {/* Navigation Tabs */}
        <Box className="border-b border-gray-200/40 bg-transparent px-3 pt-3">
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="onglets client"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                backgroundColor: '#2563eb',
              },
              '& .MuiTab-root': {
                minHeight: '48px',
                textTransform: 'none',
                fontSize: '0.925rem',
                fontWeight: 600,
                color: '#64748b',
                padding: '8px 16px',
                marginRight: '8px',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.2s',
                '&:hover': {
                  color: '#1e293b',
                  backgroundColor: 'rgba(241, 245, 249, 0.8)',
                },
                '&.Mui-selected': {
                  color: '#2563eb',
                },
              },
            }}
          >
            {unEntreprise.licence_type !== "Stock Simple" && (
              <Tab
                value={0}
                label={
                  <div className="flex items-center space-x-2">
                    <ShoppingCartOutlinedIcon fontSize="small" />
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
                    <LocalShippingOutlinedIcon fontSize="small" />
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
                  <EditOutlinedIcon fontSize="small" />
                  <span>Modification</span>
                </div>
              }
              {...a11yProps(2)}
            />

            {unEntreprise.licence_type !== "Stock Simple" && (
              <Tab
                value={3}
                label={
                  <div className="flex items-center space-x-2">
                    <HistoryOutlinedIcon fontSize="small" />
                    <span>Historique</span>
                  </div>
                }
                {...a11yProps(3)}
              />
            )}
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box className="p-4 sm:p-6">
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

