import { ChangeEvent, FC, FormEvent, ReactNode, SyntheticEvent, useState } from 'react';
import CloseIcon from "@mui/icons-material/Close";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  SelectChangeEvent,
  Skeleton,
  Stack,
  Chip,
} from '@mui/material';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import AddBusinessRoundedIcon from '@mui/icons-material/AddBusinessRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { EntrepriseType } from '../../../typescript/Account';
import { connect } from '../../../_services/account.service';
import { Link } from 'react-router-dom';
import { useCreateEntreprise, useFetchUser, useGetUserEntreprises } from '../../../usePerso/fonction.user';
import { isLicenceExpired } from '../../../usePerso/fonctionPerso';
import { BASE } from '../../../_services/caller.service';
import MyTextField from '../../../_components/Input/MyTextField';
import { useStoreUuid } from '../../../usePerso/store';
import CountrySelect from '../../../_components/Liste_Pays/CountrySelect';
import { RecupType } from '../../../typescript/DataType';
import backgroundImage from '../../../../public/assets/img/img.jpg';

// ── Types ──────────────────────────────────────────────────────────────────────

interface EntrepriseFormValues extends EntrepriseType {
  libelle?: string;
}

interface LicenceTagProps {
  type: string;
  children: ReactNode;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const licenceColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  'Stock Simple': { bg: 'rgba(239,68,68,0.12)', text: '#fca5a5', border: 'rgba(239,68,68,0.3)', glow: 'rgba(239,68,68,0.2)' },
  'Stock Pro':    { bg: 'rgba(234,179,8,0.12)', text: '#fde68a', border: 'rgba(234,179,8,0.3)',  glow: 'rgba(234,179,8,0.2)' },
  'Stock Premium':{ bg: 'rgba(34,197,94,0.12)', text: '#86efac', border: 'rgba(34,197,94,0.3)', glow: 'rgba(34,197,94,0.2)' },
};

export const LicenceTag: FC<LicenceTagProps> = ({ type, children }) => {
  const colors = licenceColors[type] || licenceColors['Stock Simple'];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        px: 1.5,
        py: 0.5,
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: 0.5,
        bgcolor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {children}
    </Box>
  );
};

// ── Premium Enterprise Card ────────────────────────────────────────────────────

interface EnterpriseCardProps {
  post: any;
  index: number;
  onSelect: () => void;
}

const EnterpriseCard: FC<EnterpriseCardProps> = ({ post, index, onSelect }) => {
  const url = post.image ? BASE(post.image) : backgroundImage;
  const expired = isLicenceExpired(post.licence_date_expiration);
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      sx={{
        position: 'relative',
        opacity: 0,
        animation: `cardEntrance 0.5s ease forwards`,
        animationDelay: `${index * 0.07}s`,
        '@keyframes cardEntrance': {
          from: { opacity: 0, transform: 'translateY(20px) scale(0.97)' },
          to:   { opacity: expired ? 0.55 : 1, transform: 'translateY(0) scale(1)' },
        },
        filter: expired ? 'grayscale(0.5)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        to="/entreprise"
        onClick={onSelect}
        style={{ textDecoration: 'none', display: 'block' }}
        tabIndex={expired ? -1 : 0}
        aria-disabled={expired}
      >
        <Box
          sx={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            bgcolor: 'rgba(15,23,42,0.85)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${hovered && !expired ? 'rgba(99,102,241,0.45)' : 'rgba(99,102,241,0.14)'}`,
            boxShadow: hovered && !expired
              ? '0 20px 60px rgba(99,102,241,0.22), 0 0 0 1px rgba(99,102,241,0.12)'
              : '0 4px 24px rgba(0,0,0,0.3)',
            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: hovered && !expired ? 'translateY(-6px)' : 'translateY(0)',
            cursor: expired ? 'not-allowed' : 'pointer',
          }}
        >
          {/* ── Gradient header banner ── */}
          <Box
            sx={{
              height: 90,
              background: hovered && !expired
                ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #0ea5e9 100%)'
                : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e3a5f 100%)',
              transition: 'background 0.5s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Animated glow blob */}
            <Box
              sx={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 65%)',
                transition: 'opacity 0.4s ease',
                opacity: hovered ? 1 : 0.4,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '-20px',
                left: '20px',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 65%)',
              }}
            />
          </Box>

          {/* ── Logo floating over header ── */}
          <Box
            sx={{
              position: 'absolute',
              top: 46,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 72,
              height: 72,
              borderRadius: '18px',
              overflow: 'hidden',
              border: `3px solid ${hovered && !expired ? '#6366f1' : 'rgba(99,102,241,0.35)'}`,
              boxShadow: hovered && !expired
                ? '0 0 0 4px rgba(99,102,241,0.15), 0 8px 28px rgba(0,0,0,0.5)'
                : '0 4px 20px rgba(0,0,0,0.45)',
              transition: 'all 0.35s ease',
              bgcolor: '#0f172a',
              zIndex: 2,
            }}
          >
            <img
              src={url}
              alt={post.nom}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>

          {/* ── Expired badge ── */}
          {expired && (
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                bgcolor: 'rgba(239,68,68,0.92)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                fontSize: '0.68rem',
                fontWeight: 700,
                px: 1.2,
                py: 0.35,
                borderRadius: '8px',
                boxShadow: '0 4px 14px rgba(239,68,68,0.45)',
                letterSpacing: 0.4,
              }}
            >
              <ErrorOutlineRoundedIcon sx={{ fontSize: 12 }} />
              Licence expirée
            </Box>
          )}

          {/* ── Active badge ── */}
          {!expired && post.licence_active && (
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
                bgcolor: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.35)',
                // color: '#86efac',
                fontSize: '0.66rem',
                fontWeight: 700,
                px: 1.1,
                py: 0.35,
                borderRadius: '8px',
                letterSpacing: 0.4,
              }}
            >
              <VerifiedRoundedIcon sx={{ fontSize: 11 }} />
              Actif
            </Box>
          )}

          {/* ── Card body ── */}
          <Box sx={{ pt: 5.5, pb: 3, px: 2.5, textAlign: 'center' }}>
            {/* Company name */}
            <Typography
              sx={{
                fontSize: '1.05rem',
                fontWeight: 800,
                mb: 0.5,
                background: hovered && !expired
                  ? 'linear-gradient(135deg, #c7d2fe, #a78bfa)'
                  : 'linear-gradient(135deg, #e0e7ff, #c4b5fd)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
              }}
            >
              {post.nom}
            </Typography>

            {/* Licence type chip */}
            {post.libelle && (
              <Chip
                label={post.libelle}
                size="small"
                sx={{
                  mb: 1.5,
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  bgcolor: 'rgba(99,102,241,0.12)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99,102,241,0.25)',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            )}

            {/* Divider line */}
            <Box
              sx={{
                height: '1px',
                background: hovered && !expired
                  ? 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)',
                my: 1.5,
                transition: 'background 0.3s ease',
              }}
            />

            {/* Metadata row */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
              }}
            >
              <BusinessRoundedIcon sx={{ fontSize: 13, color: '#4f46e5' }} />
              <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                {post.adresse || post.email || 'Entreprise'}
              </Typography>
            </Box>

            {/* CTA hint on hover */}
            <Box
              sx={{
                mt: 1.5,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#6366f1',
                  letterSpacing: 0.5,
                  opacity: hovered && !expired ? 1 : 0,
                  transform: hovered && !expired ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'all 0.25s ease',
                }}
              >
                Accéder →
              </Typography>
            </Box>
          </Box>
        </Box>
      </Link>
    </Box>
  );
};

// ── Loading skeleton ───────────────────────────────────────────────────────────

const LoadingState = () => (
  <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)', xl: 'repeat(4,1fr)' },
        gap: { xs: 2, sm: 3 },
      }}
    >
      {[...Array(3)].map((_, i) => (
        <Box
          key={i}
          sx={{
            borderRadius: '20px',
            overflow: 'hidden',
            bgcolor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(99,102,241,0.1)',
          }}
        >
          <Skeleton variant="rectangular" height={90} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <Skeleton variant="circular" width={72} height={72} sx={{ bgcolor: 'rgba(255,255,255,0.08)', mt: -5 }} />
            <Skeleton width="60%" height={22} sx={{ bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1 }} />
            <Skeleton width="80%" height={14} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 1 }} />
          </Box>
        </Box>
      ))}
    </Box>
  </Box>
);

// ── Error state ────────────────────────────────────────────────────────────────

const ErrorState = () => {
  window.location.reload();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '16rem', p: 4 }}>
      <Typography sx={{ color: '#f87171', textAlign: 'center' }}>
        Une erreur est survenue. Rechargement...
      </Typography>
    </Box>
  );
};

// ── Empty state ────────────────────────────────────────────────────────────────

const EmptyState: FC<{ onAdd: () => void; role?: number }> = ({ onAdd, role }) => (
  <Box
    sx={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      textAlign: 'center',
      p: 4,
    }}
  >
    <Box
      sx={{
        width: 96,
        height: 96,
        borderRadius: '28px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))',
        border: '1px solid rgba(99,102,241,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 40px rgba(99,102,241,0.15)',
        animation: 'float 3s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
      }}
    >
      <AddBusinessRoundedIcon sx={{ fontSize: 44, color: '#818cf8' }} />
    </Box>

    {role === 1 ? (
      /* ── Rôle autorisé : afficher le bouton de création ── */
      <>
        <Box>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, mb: 0.5 }}>
            Aucune entreprise
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', maxWidth: 320 }}>
            Commencez par créer votre première entreprise pour gérer vos stocks.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={onAdd}
          startIcon={<AddBusinessRoundedIcon />}
          sx={{
            bgcolor: '#6366f1',
            px: 4,
            py: 1.4,
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.92rem',
            boxShadow: '0 4px 20px rgba(99,102,241,0.45)',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: '#4f46e5',
              boxShadow: '0 8px 30px rgba(99,102,241,0.6)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          Créer une entreprise
        </Button>
      </>
    ) : (
      /* ── Pas encore de rôle : message d'attente d'activation ── */
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '16px',
          p: { xs: 3, sm: 4 },
          backdropFilter: 'blur(10px)',
          maxWidth: 420,
        }}
      >
        <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, mb: 1.5 }}>
          Compte en attente
        </Typography>
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: { xs: '0.88rem', sm: '0.95rem' },
            lineHeight: 1.8,
          }}
        >
          Nous vous remercions pour votre inscription sur Gest Stocks.<br />
          Veuillez-vous patienter avant l'activation de votre compte !<br />
          Pour plus d'information contacter :
        </Typography>
        <a
          href="https://wa.me/22391154834"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'rgba(34, 197, 94, 0.07)',
              border: '1px solid rgba(34, 197, 94, 0.18)',
              borderRadius: '10px',
              px: 2,
              py: 0.8,
              mt: 1.5,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(34, 197, 94, 0.14)',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <WhatsAppIcon sx={{ color: '#22c55e', fontSize: 18 }} />
            <Typography sx={{ color: '#22c55e', fontSize: '0.88rem', fontWeight: 600, letterSpacing: 0.3 }}>
              +223 91 15 48 34
            </Typography>
          </Box>
        </a>
      </Box>
    )}
  </Box>
);

// ── Dialog ─────────────────────────────────────────────────────────────────────

const EntrepriseDialog: FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  formValues: EntrepriseFormValues;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  licenceType: string;
  onLicenceChange: (event: SelectChangeEvent) => void;
  onCountryChange: (event: any, value: string | RecupType) => void;
}> = ({ open, onClose, onSubmit, formValues, onChange, onCountryChange }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    PaperProps={{
      sx: {
        m: 2,
        width: 'calc(100% - 2rem)',
        maxWidth: '500px',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '20px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.55)',
      },
    }}
  >
    <DialogTitle
      className={`bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700`}
      sx={{
        // background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.15) 100%)',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
        pb: 2,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Ajouter une entreprise
          </Typography>
          <Typography variant="caption">
            Renseignez les informations de votre entreprise
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: '#64748b', '&:hover': { color: '#e0e7ff', bgcolor: 'rgba(255,255,255,0.08)' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </DialogTitle>

    <DialogContent sx={{ pt: 5, px: 3, pb: 1 }}>
      <form onSubmit={onSubmit} id="entreprise-form">
        <Stack spacing={2.5} className="form-stack pt-5">
          <MyTextField label="Nom de l'entreprise" name="nom" value={formValues.nom} onChange={onChange} required />
          <MyTextField label="Email" name="email" type="email" value={formValues.email} onChange={onChange} />
          <MyTextField label="Numéro de téléphone" name="numero" type="tel" value={formValues.numero || ''} onChange={onChange} />
          <MyTextField label="Adresse" name="adresse" value={formValues.adresse} onChange={onChange} />
          <CountrySelect onChange={onCountryChange} label="Choisir le pays" />
        </Stack>
      </form>
    </DialogContent>

    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <Button
        onClick={onClose}
        sx={{ color: '#64748b', borderRadius: '10px', px: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
      >
        Annuler
      </Button>
      <Button
        type="submit"
        form="entreprise-form"
        variant="contained"
        sx={{
          bgcolor: '#6366f1',
          borderRadius: '10px',
          px: 3,
          fontWeight: 600,
          boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
          '&:hover': { bgcolor: '#4f46e5', boxShadow: '0 4px 20px rgba(99,102,241,0.55)' },
        }}
      >
        Ajouter l'entreprise
      </Button>
    </DialogActions>
  </Dialog>
);

// ── Main component ──────────────────────────────────────────────────────────────

export default function Entreprise() {
  const { userEntreprises, isLoading, isError } = useGetUserEntreprises();
  const { unUser } = useFetchUser();
  const { ajoutEntreprise } = useCreateEntreprise();
  const addId = useStoreUuid((state) => state.addId);

  const [age, setAge] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value as string);
  };

  const [formValues, setFormValues] = useState<EntrepriseFormValues>({
    nom: '',
    email: '',
    numero: 0,
    adresse: '',
    user_id: '',
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleAutoFourChange = (
    _: SyntheticEvent<Element, Event>,
    value: string | RecupType,
  ) => {
    if (typeof value === 'object' && value !== null) {
      setFormValues({ ...formValues, pays: value.label ?? '' });
    } else {
      setFormValues({ ...formValues, pays: '' });
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    formValues['user_id'] = connect;
    formValues['libelle'] = age;
    ajoutEntreprise(formValues);
    setFormValues({ nom: '', email: '', numero: 0, adresse: '', user_id: '', libelle: '' });
    setIsDialogOpen(false);
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState />;

  const dialogProps = {
    open: isDialogOpen,
    onClose: () => setIsDialogOpen(false),
    onSubmit,
    formValues,
    onChange,
    licenceType: age,
    onLicenceChange: handleChange,
    onCountryChange: handleAutoFourChange,
  };

  // ── No enterprises yet ──
  if (!userEntreprises || userEntreprises.length === 0) {
    return (
      <>
        <EmptyState onAdd={() => setIsDialogOpen(true)} role={unUser.role} />
        {unUser.role === 1 && <EntrepriseDialog {...dialogProps} />}
      </>
    );
  }

  // ── Has enterprises ──
  return (
    <Box sx={{ minHeight: '100vh', p: { xs: 2, sm: 3, lg: 4 } }}>

      {/* ── Page header ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: { xs: 4, sm: 5 },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.8rem' },
              fontWeight: 800,
              // background: 'linear-gradient(135deg, #e0e7ff, #a78bfa)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              // color: 'transparent',
              lineHeight: 1.2,
            }}
          >
            Mes entreprises
          </Typography>
          <Typography sx={{ fontSize: '0.88rem', mt: 0.4 }}>
            {userEntreprises.length} entreprise{userEntreprises.length > 1 ? 's' : ''} enregistrée{userEntreprises.length > 1 ? 's' : ''}
          </Typography>
        </Box>

        {unUser.role === 1 && (
          <Button
            variant="contained"
            onClick={() => setIsDialogOpen(true)}
            startIcon={<AddBusinessRoundedIcon />}
            sx={{
              bgcolor: '#6366f1',
              px: 3,
              py: 1.3,
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.88rem',
              letterSpacing: 0.3,
              boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#4f46e5',
                boxShadow: '0 8px 30px rgba(99,102,241,0.6)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Ajouter
          </Button>
        )}
      </Box>

      {/* ── Pending activation message ── */}
      {(unUser.role !== 1 && unUser.role !== 2 && unUser.role !== 3 && unUser.role !== 4) && (
        <Box
          sx={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '16px',
            p: { xs: 3, sm: 4 },
            mb: { xs: 4, sm: 5 },
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography
            sx={{
              textAlign: 'center',
              // color: '#cbd5e1',
              fontSize: { xs: '0.88rem', sm: '0.95rem' },
              lineHeight: 1.8,
            }}
          >
            Nous vous remercions pour votre inscription sur Gest Stocks.<br />
            Veuillez-vous patienter avant l'activation de votre compte !<br />
            Pour plus d'information contacter (91 15 48 34 // 63 83 51 14)
          </Typography>
        </Box>
      )}

      {/* ── Cards grid ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
            xl: 'repeat(4, 1fr)',
          },
          gap: { xs: 2.5, sm: 3 },
        }}
      >
        {userEntreprises.map((post: any, index: number) => (
          <EnterpriseCard
            key={post.uuid || index}
            post={post}
            index={index}
            onSelect={() => addId(post.uuid)}
          />
        ))}
      </Box>

      <EntrepriseDialog {...dialogProps} />
    </Box>
  );
}