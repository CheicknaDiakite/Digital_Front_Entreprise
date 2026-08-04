import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
  Stack,
  Avatar,
  SelectChangeEvent,
  alpha,
  useTheme,
  Chip,
  InputAdornment,
  Backdrop,
  Fade,
} from '@mui/material';
import { ChangeEvent, FormEvent, useState } from 'react';
import { useFetchUser, useUpdateUser } from '../../../usePerso/fonction.user';
import { connect } from '../../../_services/account.service';
import countryList from 'react-select-country-list';
import toast from 'react-hot-toast';
import { logout } from '../../../usePerso/fonctionPerso';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PublicIcon from '@mui/icons-material/Public';
import BadgeIcon from '@mui/icons-material/Badge';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export default function Admin() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const { unUser, setUnUser, isLoading, isError } = useFetchUser();
  const { updateUser } = useUpdateUser();
  const options = countryList().getData();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUnUser({ ...unUser, [name]: value });
  };

  const onSelectChange = (e: SelectChangeEvent<string>) => {
    setUnUser({ ...unUser, [e.target.name]: e.target.value });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    unUser['user_id'] = connect;
    updateUser(unUser);
  };

  const onSubmitPass = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    unUser['uuid'] = connect;
    unUser['user_id'] = connect;
    if (unUser.password !== unUser.repassword) {
      toast.error('Les deux mots de passe ne correspondent pas');
      return;
    }
    updateUser(unUser);
    logout();
  };

  /* ── Loading ─────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <CircularProgress
          size={48}
          thickness={3}
          sx={{ color: theme.palette.primary.main }}
        />
        <Typography variant="body2" color="text.secondary">
          Chargement du profil…
        </Typography>
      </Box>
    );
  }

  /* ── Error ───────────────────────────────────────────────── */
  if (isError) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <Typography color="error" variant="h6">
          Une erreur est survenue lors du chargement.
        </Typography>
        <Button variant="outlined" color="error" onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </Box>
    );
  }

  if (!unUser) return null;

  /* ── glassmorphism card helper ───────────────────────────── */
  const glassCard = {
    background: isDark
      ? 'rgba(16, 28, 48, 0.75)'
      : 'rgba(255, 255, 255, 0.80)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(37,99,235,0.10)'}`,
    borderRadius: '20px',
    boxShadow: isDark
      ? '0 8px 40px rgba(0,0,0,0.45)'
      : '0 8px 40px rgba(37,99,235,0.10)',
  };

  const sectionTitle = (icon: React.ReactNode, label: string) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark ?? theme.palette.primary.main})`,
          color: '#fff',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '0.02em' }}
      >
        {label}
      </Typography>
    </Box>
  );

  /* ── Shared input sx ─────────────────────────────────────── */
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      transition: 'box-shadow .2s, border-color .2s',
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.18)}`,
      },
    },
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>

      {/* ── Hero header ─────────────────────────────────────── */}
      <Box
        sx={{
          ...glassCard,
          p: { xs: 3, md: 4 },
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          flexWrap: 'wrap',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 0% 50%, ${alpha(theme.palette.primary.main, isDark ? 0.18 : 0.08)} 0%, transparent 60%)`,
            pointerEvents: 'none',
          },
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main ?? theme.palette.primary.dark ?? theme.palette.primary.main} 100%)`,
            boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.45)}`,
            fontSize: 36,
            fontWeight: 700,
          }}
        >
          {unUser.first_name
            ? unUser.first_name.charAt(0).toUpperCase()
            : <PersonIcon fontSize="large" />}
        </Avatar>
        <Box sx={{ flexGrow: 1, zIndex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>
            {unUser.first_name} {unUser.last_name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {unUser.email}
          </Typography>
          <Chip
            icon={<AccountCircleIcon sx={{ fontSize: 14 }} />}
            label="Administrateur"
            size="small"
            sx={{
              borderRadius: '8px',
              background: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
              fontWeight: 600,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            }}
          />
        </Box>
        <Button
          variant="outlined"
          startIcon={<LockIcon />}
          onClick={handleOpen}
          size="small"
          sx={{
            borderRadius: '12px',
            borderColor: alpha(theme.palette.primary.main, 0.4),
            color: theme.palette.primary.main,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.08),
              borderColor: theme.palette.primary.main,
            },
          }}
        >
          Mot de passe
        </Button>
      </Box>

      {/* ── Profile form ─────────────────────────────────────── */}
      <Box component="form" onSubmit={onSubmit}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>

          {/* — Informations de base — */}
          <Box sx={{ ...glassCard, p: { xs: 3, md: 4 } }}>
            {sectionTitle(<BadgeIcon sx={{ fontSize: 18 }} />, 'Informations de base')}
            <Stack spacing={2.5}>
              <TextField
                label="Nom d'utilisateur"
                name="username"
                value={unUser.username}
                onChange={onChange}
                disabled
                fullWidth
                sx={{
                  ...inputSx,
                  '& .MuiOutlinedInput-root.Mui-disabled': {
                    background: alpha(theme.palette.action.disabled, 0.04),
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircleIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Nom"
                name="last_name"
                value={unUser.last_name}
                onChange={onChange}
                required
                fullWidth
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Prénom"
                name="first_name"
                value={unUser.first_name}
                onChange={onChange}
                required
                fullWidth
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Box>

          {/* — Contact & Localisation — */}
          <Box sx={{ ...glassCard, p: { xs: 3, md: 4 } }}>
            {sectionTitle(<PublicIcon sx={{ fontSize: 18 }} />, 'Contact et Localisation')}
            <Stack spacing={2.5}>
              <TextField
                label="Numéro de téléphone"
                name="numero"
                value={unUser.numero}
                onChange={onChange}
                fullWidth
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl fullWidth sx={inputSx}>
                <InputLabel>Pays</InputLabel>
                <Select
                  value={unUser.pays || ''}
                  onChange={onSelectChange}
                  name="pays"
                  label="Pays"
                  startAdornment={
                    <InputAdornment position="start">
                      <PublicIcon sx={{ color: 'text.secondary', fontSize: 20, ml: 0.5 }} />
                    </InputAdornment>
                  }
                >
                  {options.map((option) => (
                    <MenuItem key={option.value} value={option.label}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={unUser.email}
                onChange={onChange}
                required
                fullWidth
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Box>
        </Box>

        {/* ── Save button ──────────────────────────────────────── */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              borderRadius: '14px',
              px: 4,
              py: 1.5,
              fontWeight: 700,
              fontSize: '0.95rem',
              textTransform: 'none',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark ?? theme.palette.primary.main} 100%)`,
              boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.38)}`,
              transition: 'transform .15s, box-shadow .15s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 10px 28px ${alpha(theme.palette.primary.main, 0.50)}`,
              },
              '&:active': { transform: 'translateY(0)' },
            }}
          >
            Enregistrer les modifications
          </Button>
        </Box>
      </Box>

      {/* ── Password Modal ───────────────────────────────────── */}
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 300, sx: { backdropFilter: 'blur(6px)' } } }}
      >
        <Fade in={open}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: 'calc(100% - 32px)', sm: 440 },
              ...glassCard,
              p: 0,
              outline: 'none',
            }}
          >
            {/* Modal header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 3,
                pb: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.error.main})`,
                    color: '#fff',
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Changer le mot de passe
                </Typography>
              </Box>
              <IconButton onClick={handleClose} size="small" sx={{ borderRadius: '10px' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Modal form */}
            <Box component="form" onSubmit={onSubmitPass} sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <TextField
                  label="Nouveau mot de passe"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  onChange={onChange}
                  required
                  fullWidth
                  sx={inputSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Confirmer le mot de passe"
                  name="repassword"
                  type={showRePassword ? 'text' : 'password'}
                  onChange={onChange}
                  required
                  fullWidth
                  sx={inputSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowRePassword((v) => !v)}
                        >
                          {showRePassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 1,
                    borderRadius: '12px',
                    py: 1.4,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.error.main} 100%)`,
                    boxShadow: `0 6px 20px ${alpha(theme.palette.error.main, 0.32)}`,
                    transition: 'transform .15s, box-shadow .15s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 10px 28px ${alpha(theme.palette.error.main, 0.45)}`,
                    },
                    '&:active': { transform: 'translateY(0)' },
                  }}
                >
                  Mettre à jour le mot de passe
                </Button>
              </Stack>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Container>
  );
}
