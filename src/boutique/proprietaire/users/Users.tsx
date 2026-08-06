import { FC, ChangeEvent, FormEvent, useState } from 'react';
import {
  Typography,
  Button,
  IconButton,
  Box,
  Stack,
  alpha,
  useTheme,
  Avatar,
  Chip,
  Tooltip,
  TextField,
  InputAdornment,
  Backdrop,
  Fade,
  Modal,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { Link } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import { FormValueType } from '../../../typescript/FormType';
import { useAllUsers, useCreateAdminUser } from '../../../usePerso/fonction.user';
import { accountService } from '../../../_services/account.service';
import MyTextField from '../../../_components/Input/MyTextField';

/* ── Types ────────────────────────────────────────────────── */
interface UserData {
  id: number;
  uuid: string;
  last_name: string;
  first_name: string;
  email: string;
  numero: string;
  is_cabinet: boolean;
  role: number;
}

/* ── Loading skeleton ─────────────────────────────────────── */
const LoadingState: FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box sx={{ p: 4 }}>
      <Stack spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{
              height: 72,
              borderRadius: '14px',
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              animation: 'pulse 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`,
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.4 },
              },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

/* ── Error state ──────────────────────────────────────────── */
const ErrorState: FC = () => {
  window.location.reload();
  return (
    <Box display="flex" justifyContent="center" alignItems="center" p={6}>
      <Typography color="error" variant="h6">
        Une erreur est survenue. Rechargement…
      </Typography>
    </Box>
  );
};

/* ── User Row Card ────────────────────────────────────────── */
const UserCard: FC<{ user: UserData; index: number }> = ({ user, index }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  const avatarColors = [
    ['#6366f1', '#818cf8'],
    ['#0ea5e9', '#38bdf8'],
    ['#10b981', '#34d399'],
    ['#f59e0b', '#fbbf24'],
    ['#ef4444', '#f87171'],
    ['#8b5cf6', '#a78bfa'],
  ];
  const [from, to] = avatarColors[index % avatarColors.length];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: '14px',
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(37,99,235,0.03)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(37,99,235,0.08)'}`,
        transition: 'transform .18s, box-shadow .18s, background .18s',
        '&:hover': {
          transform: 'translateY(-2px)',
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(37,99,235,0.06)',
          boxShadow: isDark
            ? '0 8px 24px rgba(0,0,0,0.35)'
            : '0 8px 24px rgba(37,99,235,0.12)',
        },
        flexWrap: 'wrap',
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 48,
          height: 48,
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
          fontWeight: 700,
          fontSize: 16,
          flexShrink: 0,
          boxShadow: `0 4px 12px ${alpha(from, 0.45)}`,
        }}
      >
        {initials}
      </Avatar>

      {/* Name + email */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, lineHeight: 1.3 }}>
          {user.first_name} {user.last_name}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <EmailIcon sx={{ fontSize: 12 }} />
          {user.email}
        </Typography>
        {user.numero && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <PhoneIcon sx={{ fontSize: 12 }} />
            {user.numero}
          </Typography>
        )}
      </Box>

      {/* Badges */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        {user.is_cabinet && (
          <Chip
            label="Intermédiaire"
            size="small"
            sx={{
              borderRadius: '8px',
              background: alpha('#10b981', 0.12),
              color: '#10b981',
              border: `1px solid ${alpha('#10b981', 0.3)}`,
              fontWeight: 600,
              fontSize: 11,
            }}
          />
        )}
        <Chip
          icon={
            user.role === 1 ? (
              <CheckCircleIcon sx={{ fontSize: '14px !important', color: '#6366f1 !important' }} />
            ) : (
              <PersonIcon sx={{ fontSize: '14px !important', color: '#ef4444 !important' }} />
            )
          }
          label={user.role === 1 ? 'Activé' : 'Visiteur'}
          size="small"
          sx={{
            borderRadius: '8px',
            background: user.role === 1 ? alpha('#6366f1', 0.10) : alpha('#ef4444', 0.10),
            color: user.role === 1 ? '#6366f1' : '#ef4444',
            border: `1px solid ${alpha(user.role === 1 ? '#6366f1' : '#ef4444', 0.25)}`,
            fontWeight: 600,
            fontSize: 11,
          }}
        />
      </Box>

      {/* Action */}
      <Tooltip title="Voir le profil" arrow placement="left">
        <Link to={`/user/admin/modif/${user.uuid}`}>
          <IconButton
            size="small"
            sx={{
              borderRadius: '10px',
              background: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              transition: 'background .18s, transform .18s',
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.18),
                transform: 'scale(1.1)',
              },
            }}
          >
            <VisibilityIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Link>
      </Tooltip>
    </Box>
  );
};

/* ── Add user modal ───────────────────────────────────────── */
const AddUserModal: FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}> = ({ open, onClose, onSubmit, onChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const glassCard = {
    background: isDark ? 'rgba(16,28,48,0.92)' : 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(37,99,235,0.12)'}`,
    borderRadius: '20px',
    boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.55)' : '0 24px 60px rgba(37,99,235,0.15)',
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      transition: 'box-shadow .2s',
      '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.18)}` },
    },
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
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
            width: { xs: 'calc(100% - 32px)', sm: 460 },
            ...glassCard,
            outline: 'none',
          }}
        >
          {/* Header */}
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
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark ?? theme.palette.primary.main})`,
                  color: '#fff',
                }}
              >
                <PersonAddAltIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  Ajouter un administrateur
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Remplissez les informations du nouvel admin
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ borderRadius: '10px' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={onSubmit} sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <MyTextField
                label="Nom d'utilisateur"
                name="username"
                onChange={onChange}
                required
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <MyTextField label="Nom" name="last_name" onChange={onChange} required />
                <MyTextField label="Prénom" name="first_name" onChange={onChange} required />
              </Box>
              <MyTextField label="Email" type="email" name="email" onChange={onChange} required />
              <MyTextField label="Mot de passe" type="password" name="password" onChange={onChange} required />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={<PersonAddAltIcon />}
                sx={{
                  mt: 0.5,
                  borderRadius: '12px',
                  py: 1.4,
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
                Créer l'administrateur
              </Button>
            </Stack>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

/* ── Main component ───────────────────────────────────────── */
export default function Users() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [formValues, setFormValues] = useState<FormValueType>({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });

  // Read token lazily at render time — NOT from a stale module-level constant
  const token = accountService.getToken();
  const { getUsers, isLoading, isError } = useAllUsers(token);
  const { createAdmin } = useCreateAdminUser();

  const itemsPerPage = 10;
  const sortedUsers = getUsers?.slice().sort((a: UserData, b: UserData) => b.id - a.id) || [];
  const filtered = sortedUsers.filter((u: UserData) => {
    const q = search.toLowerCase();
    return (
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });
  const currentUsers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createAdmin(formValues);
    setIsDialogOpen(false);
    setFormValues({ username: '', first_name: '', last_name: '', email: '', password: '' });
  };

  /* ── glassmorphism card helper ─── */
  const glassCard = {
    background: isDark ? 'rgba(16,28,48,0.75)' : 'rgba(255,255,255,0.80)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(37,99,235,0.10)'}`,
    borderRadius: '20px',
    boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.45)' : '0 8px 40px rgba(37,99,235,0.10)',
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState />;
  if (!getUsers) return null;

  return (
    <>
      <Box
        sx={{
          ...glassCard,
          overflow: 'hidden',
        }}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            pb: 3,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse at 100% 50%, ${alpha(theme.palette.primary.main, isDark ? 0.12 : 0.06)} 0%, transparent 60%)`,
              pointerEvents: 'none',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, zIndex: 1 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark ?? theme.palette.primary.main} 100%)`,
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.40)}`,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <GroupIcon />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                Administrateurs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {sortedUsers.length} membre{sortedUsers.length > 1 ? 's' : ''} au total
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<PersonAddAltIcon />}
            onClick={() => setIsDialogOpen(true)}
            sx={{
              zIndex: 1,
              borderRadius: '12px',
              px: 3,
              py: 1.2,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.9rem',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark ?? theme.palette.primary.main} 100%)`,
              boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.38)}`,
              transition: 'transform .15s, box-shadow .15s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.50)}`,
              },
              '&:active': { transform: 'translateY(0)' },
            }}
          >
            Ajouter un admin
          </Button>
        </Box>

        {/* ── Search bar ─────────────────────────────────────── */}
        <Box sx={{ px: { xs: 3, md: 4 }, pt: 3, pb: 1 }}>
          <TextField
            placeholder="Rechercher par nom, prénom ou email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(37,99,235,0.04)',
                '&.Mui-focused': {
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.18)}`,
                },
              },
            }}
          />
        </Box>

        {/* ── Stats row ──────────────────────────────────────── */}
        <Box
          sx={{
            px: { xs: 3, md: 4 },
            py: 2,
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Total', value: sortedUsers.length, color: theme.palette.primary.main },
            {
              label: 'Activés',
              value: sortedUsers.filter((u: UserData) => u.role === 1).length,
              color: '#6366f1',
            },
            {
              label: 'Intermédiaires',
              value: sortedUsers.filter((u: UserData) => u.is_cabinet).length,
              color: '#10b981',
            },
          ].map((stat) => (
            <Box
              key={stat.label}
              sx={{
                px: 2.5,
                py: 1.2,
                borderRadius: '12px',
                background: alpha(stat.color, isDark ? 0.15 : 0.08),
                border: `1px solid ${alpha(stat.color, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: stat.color, lineHeight: 1 }}
              >
                {stat.value}
              </Typography>
              <Typography variant="caption" sx={{ color: stat.color, fontWeight: 600 }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* ── User list ──────────────────────────────────────── */}
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
          {currentUsers.length === 0 ? (
            <Box
              sx={{
                py: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <GroupIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Typography color="text.secondary" variant="body1">
                {search ? 'Aucun résultat pour cette recherche' : 'Aucun utilisateur trouvé'}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {currentUsers.map((user: UserData, i: number) => (
                <UserCard key={user.uuid} user={user} index={i} />
              ))}
            </Stack>
          )}
        </Box>

        {/* ── Pagination ─────────────────────────────────────── */}
        {totalPages > 1 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 3,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_: ChangeEvent<unknown>, page: number) => setCurrentPage(page)}
              color="primary"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '10px',
                  fontWeight: 600,
                },
              }}
            />
          </Box>
        )}
      </Box>

      <AddUserModal
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        onChange={handleInputChange}
      />
    </>
  );
}
