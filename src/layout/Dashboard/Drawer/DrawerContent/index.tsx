// project import
import { Box, IconButton, Typography } from '@mui/material';
import SimpleBar from '../../../../components/third-party/SimpleBar';
import NavSide from './Navigation/NavSide';
import { Link } from 'react-router-dom';
import { useStoreUuid } from '../../../../usePerso/store';
import { useFetchEntreprise } from '../../../../usePerso/fonction.user';
import { BASE } from '../../../../_services/caller.service';
import { handlerDrawerOpen, useGetMenuMaster } from '../../../../api/menu';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

// ==============================|| DRAWER CONTENT ||============================== //

export default function DrawerContent() {
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(uuid);

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened;

  const logoUrl = unEntreprise.image ? BASE(unEntreprise.image) : '/icon-192x192.png';

  return (
    <>
      <SimpleBar
        sx={{
          '& .simplebar-content': { display: 'flex', flexDirection: 'column' },
          bgcolor: 'rgba(10, 15, 30, 0.97)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* ── Header ── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.5,
            py: 1.2,
            mx: 1.5,
            mt: 1.5,
            mb: 0.5,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.12) 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '14px',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Clickable logo + name */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              minWidth: 0,
              flex: 1,
            }}
          >
            {/* Logo with indigo glow border */}
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1.5px solid rgba(99,102,241,0.45)',
                flexShrink: 0,
                boxShadow: '0 0 12px rgba(99,102,241,0.3)',
              }}
            >
              <img
                src={logoUrl}
                alt={unEntreprise.nom || 'Gest_Stocks'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>

            <Box sx={{ ml: 1.5, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                noWrap
                title={unEntreprise.nom}
                sx={{
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#e0e7ff',
                  fontSize: '0.88rem',
                  letterSpacing: 0.3,
                }}
              >
                {unEntreprise.nom || 'Gest Stocks'}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.67rem',
                  color: '#475569',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Tableau de bord
              </Typography>
            </Box>
          </Link>

          {/* Drawer toggle */}
          <IconButton
            disableRipple
            aria-label={drawerOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => handlerDrawerOpen(!drawerOpen)}
            sx={{
              color: '#818cf8',
              bgcolor: 'rgba(99,102,241,0.12)',
              width: 36,
              height: 36,
              borderRadius: '10px',
              border: '1px solid rgba(99,102,241,0.25)',
              flexShrink: 0,
              fontSize: '0.95rem',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(99,102,241,0.25)',
                borderColor: 'rgba(99,102,241,0.45)',
                boxShadow: '0 0 12px rgba(99,102,241,0.3)',
                transform: 'scale(1.05)',
              },
            }}
          >
            {!drawerOpen ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </IconButton>
        </Box>

        <NavSide />
      </SimpleBar>
    </>
  );
}
