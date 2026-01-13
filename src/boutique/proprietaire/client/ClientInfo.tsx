import * as React from 'react';
import { Box, Paper, IconButton, Alert, Button } from '@mui/material';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
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

export default function ClientInfo() {
  const { uuid } = useParams();
  const { unClient } = useUnClient(uuid!);

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

  return (
    <div>

      {showConfirm && (
        <Alert
          severity="warning"
          className="mt-4"
          sx={{
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1400,
            width: 'calc(100% - 32px)',
            maxWidth: 600,
          }}
          action={
            <div className="space-x-2">
              <Button color="inherit" size="small" onClick={() => setShowConfirm(false)}>
                Annuler
              </Button>
              <Button color="error" size="small" onClick={confirmDelete}>
                Confirmer
              </Button>
            </div>
          }
        >
          Êtes-vous sûr de vouloir supprimer ce client ?
        </Alert>
      )}

      {/* Main Content */}
      <Paper
        elevation={0}
        // className="rounded-lg overflow-hidden"
        sx={{
          background: 'transparent',
          bgcolor: 'transparent',
          backdropFilter: 'none',

        }}
      >

        {/* Tabs */}
        <Box
          className={`border-b bg-gray-100 backdrop-blur-sm `}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="client tabs"
            sx={{
              '& .MuiTab-root': {
                minHeight: '64px',
                textTransform: 'none',
                fontSize: '0.95rem',
              },
              '& .Mui-selected': {
                color: '#1976d2',
              },
            }}
          >
            {(unEntreprise.licence_type != "Stock Simple") &&

              <Tab
                value={0}
                label={
                  <div className="flex items-center space-x-2">
                    <ShoppingCartIcon fontSize="small" />
                    <span>Ventes (Client)</span>
                  </div>
                }
                {...a11yProps(0)}
              />
            }

            {(unEntreprise.licence_type != "Stock Simple") &&

              <Tab
                value={1}
                label={
                  <div className="flex items-center space-x-2">
                    <LocalShippingIcon fontSize="small" />
                    <span>Achats (Fournisseur)</span>
                  </div>
                }
                {...a11yProps(1)}
              />
            }

            <Tab
              value={2}
              label={
                <div className="flex items-center space-x-2">
                  <EditIcon fontSize="small" />
                  <span>Modification</span>
                </div>
              }
              {...a11yProps(2)}
            />

            {(unEntreprise.licence_type != "Stock Simple") &&
              <Tab
                value={3}
                label={
                  <div className="flex items-center space-x-2">
                    <HistoryIcon fontSize="small" />
                    <span>Historique</span>
                  </div>
                }
                {...a11yProps(3)}
              />
            }

            {(unEntreprise.licence_type != "Stock Simple") &&
              <Tab
                value={4}
                label={
                  <div className="flex items-center space-x-2">
                    <IconButton
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                }
              />
            }
          </Tabs>
        </Box>

        <Box >
          {/* Tab Panels */}
          {(unEntreprise.licence_type != "Stock Simple") &&

            <CustomTabPanel value={value} index={0}>
              <ClientSortie uuid={uuid!} />
            </CustomTabPanel>
          }

          {(unEntreprise.licence_type != "Stock Simple") &&

            <CustomTabPanel value={value} index={1}>
              <ClientEntrer uuid={uuid!} />
            </CustomTabPanel>
          }

          <CustomTabPanel value={value} index={unEntreprise.licence_type === "Stock Simple" ? 0 : 2}>
            <ClientModif uuid={uuid!} />
          </CustomTabPanel>

          {(unEntreprise.licence_type != "Stock Simple") &&

            <CustomTabPanel value={value} index={3}>
              <ClientHistorique uuid={uuid!} />
            </CustomTabPanel>
          }

        </Box>
      </Paper>

    </div>
  );
}
