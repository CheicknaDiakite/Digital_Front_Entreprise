import PropTypes from 'prop-types';
import { SyntheticEvent, useRef, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';
import CardContent from '@mui/material/CardContent';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
// project import
import ProfileTab from './ProfileTab';
import SettingTab from './SettingTab';

import MainCard from '../../../../../components/MainCard';
import Transitions from '../../../../../components/@extended/Transitions';

// assets
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import { Alert, Avatar, CircularProgress } from '@mui/material';
import { useFetchUser } from '../../../../../usePerso/fonction.user';
import { logout, stringAvatar } from '../../../../../usePerso/fonctionPerso';
import { useStoreUuid } from '../../../../../usePerso/store';

// tab panel wrapper
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`profile-tabpanel-${index}`} aria-labelledby={`profile-tab-${index}`} {...other}>
      {value === index && children}
    </div>
  );
}

function a11yProps(index : number) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`
  };
}

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

export default function Profile() {
  const theme = useTheme();
  // const [errorCount, setErrorCount] = useState<number>(() => {
  //   const savedCount = localStorage.getItem('errorCount');
  //   return savedCount ? parseInt(savedCount, 10) : 0;
  // });

  const {unUser, isLoading, isError} = useFetchUser()
  
  const [value, setValue] = useState(0);

  const handleChange = (_: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const uuid = useStoreUuid((state) => state.selectedId)
  // const anchorRef = useRef(null);
  const anchorRef = useRef<HTMLButtonElement>(null); // Ajustez le type selon votre usage
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => { // Changez le type si besoin
    if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
  };

  // const [value] = useState(0);


  if (isLoading) {
      return (
        <Box sx={{ width: 300 }}>
          <CircularProgress />
        </Box>
      );
  }
  
  if (isError) {
    // if (errorCount < 2) {
    //   window.location.reload();
    // }
    return <Alert severity="error">Probleme de connexion !</Alert>
  }

  if (unUser) {
    return (
      <Box>
        <ButtonBase
          aria-label="open profile"
          ref={anchorRef}
          aria-controls={open ? 'profile-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          sx={{
            p: 0.75,
            px: 1.5,
            borderRadius: '24px',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: open ? '0 0 16px rgba(99, 102, 241, 0.35)' : 'none',
            '&:hover': {
              bgcolor: 'rgba(99, 102, 241, 0.2)',
              borderColor: 'rgba(99, 102, 241, 0.45)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Avatar
              {...stringAvatar(`${unUser.last_name} ${unUser.first_name}`)}
              sx={{
                width: 34,
                height: 34,
                border: '2px solid rgba(129, 140, 248, 0.6)',
                fontSize: '0.875rem',
                fontWeight: 700,
              }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                color: '#f8fafc',
                fontWeight: 600,
                textTransform: 'capitalize',
                display: { xs: 'none', sm: 'block' },
                fontSize: '0.9rem',
              }}
            >
              {unUser.last_name} {unUser.first_name}
            </Typography>
          </Stack>
        </ButtonBase>

        <Popper
          placement="bottom-end"
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
          popperOptions={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 10],
                },
              },
            ],
          }}
        >
          {({ TransitionProps }) => (
            <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
              <Paper
                elevation={0}
                sx={{
                  width: 310,
                  maxWidth: { xs: 290, sm: 310 },
                  borderRadius: '20px',
                  background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.92) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(99, 102, 241, 0.15)',
                  overflow: 'hidden',
                }}
              >
                <ClickAwayListener onClickAway={handleClose}>
                  <Box>
                    <Box sx={{ p: 2.5, pb: 2, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <Grid container justifyContent="space-between" alignItems="center">
                        <Grid item>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                              alt="profile user"
                              {...stringAvatar(`${unUser.last_name} ${unUser.first_name}`)}
                              sx={{ width: 42, height: 42, border: '2px solid #6366f1', fontSize: '1rem', fontWeight: 700 }}
                            />
                            <Stack spacing={0.25}>
                              <Typography variant="subtitle1" sx={{ color: '#f8fafc', fontWeight: 700, lineHeight: 1.2, textTransform: 'capitalize' }}>
                                {unUser.last_name} {unUser.first_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                                {unUser.role === 1 ? 'Administrateur' : unUser.role === 2 ? 'Gestionnaire' : 'Utilisateur'}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                        <Grid item>
                          <Tooltip title="Déconnexion">
                            <IconButton
                              size="small"
                              onClick={logout}
                              sx={{
                                color: '#ef4444',
                                bgcolor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: 'rgba(239, 68, 68, 0.25)',
                                  borderColor: 'rgba(239, 68, 68, 0.4)',
                                  transform: 'scale(1.05)',
                                },
                              }}
                            >
                              <LogoutOutlined style={{ fontSize: '1.1rem' }} />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.08)', px: 1.5, pt: 1 }}>
                      <Tabs
                        variant="fullWidth"
                        value={value}
                        onChange={handleChange}
                        aria-label="profile tabs"
                        sx={{
                          minHeight: 42,
                          '& .MuiTabs-indicator': {
                            height: 3,
                            borderRadius: '3px 3px 0 0',
                            bgcolor: '#6366f1',
                          },
                        }}
                      >
                        <Tab
                          sx={{
                            minHeight: 42,
                            py: 1,
                            color: '#94a3b8',
                            fontSize: '0.825rem',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            '&.Mui-selected': { color: '#818cf8' },
                          }}
                          icon={<UserOutlined style={{ fontSize: '1rem', marginRight: '6px' }} />}
                          iconPosition="start"
                          label="Profil"
                          {...a11yProps(0)}
                        />
                        {uuid && (
                          <Tab
                            sx={{
                              minHeight: 42,
                              py: 1,
                              color: '#94a3b8',
                              fontSize: '0.825rem',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              '&.Mui-selected': { color: '#818cf8' },
                            }}
                            icon={<SettingOutlined style={{ fontSize: '1rem', marginRight: '6px' }} />}
                            iconPosition="start"
                            label="Factures / Dépenses"
                            {...a11yProps(1)}
                          />
                        )}
                      </Tabs>
                    </Box>
                    <Box sx={{ p: 1.5 }}>
                      <TabPanel value={value} index={0}>
                        <ProfileTab />
                      </TabPanel>
                      <TabPanel value={value} index={1}>
                        <SettingTab />
                      </TabPanel>
                    </Box>
                  </Box>
                </ClickAwayListener>
              </Paper>
            </Transitions>
          )}
        </Popper>
      </Box>
    );
  }
}

TabPanel.propTypes = { children: PropTypes.node, value: PropTypes.number, index: PropTypes.number, other: PropTypes.any };
