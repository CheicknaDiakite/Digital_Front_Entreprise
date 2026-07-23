import { ChangeEvent, FC, FormEvent, ReactNode, SyntheticEvent, useState } from 'react';
import CloseIcon from "@mui/icons-material/Close"
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Box, Dialog, DialogContent, DialogTitle, DialogActions, IconButton, SelectChangeEvent, Skeleton, Stack } from '@mui/material';
import { EntrepriseType } from '../../../typescript/Account';
import { connect } from '../../../_services/account.service';
import { Link } from 'react-router-dom';
import { useCreateEntreprise, useFetchUser, useGetUserEntreprises } from '../../../usePerso/fonction.user';
import { isLicenceExpired } from '../../../usePerso/fonctionPerso';
import { BASE } from '../../../_services/caller.service';
import MyTextField from '../../../_components/Input/MyTextField';
// import countryList from 'react-select-country-list';
import { useStoreUuid } from '../../../usePerso/store';
import CountrySelect from '../../../_components/Liste_Pays/CountrySelect';
import { RecupType } from '../../../typescript/DataType';
import backgroundImage from '../../../../public/assets/img/img.jpg'

// ── Types ──────────────────────────────────────────────────────────────────────

interface IconsGridProps {
  icon?: ReactNode;
  title: string;
  image: string;
  description: ReactNode;
}

interface EntrepriseFormValues extends EntrepriseType {
  libelle?: string;
}

interface LicenceTagProps {
  type: string;
  children: ReactNode;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const licenceColors: Record<string, { bg: string; text: string; border: string }> = {
  'Stock Simple': { bg: 'rgba(239,68,68,0.12)', text: '#fca5a5', border: 'rgba(239,68,68,0.3)' },
  'Stock Pro': { bg: 'rgba(234,179,8,0.12)', text: '#fde68a', border: 'rgba(234,179,8,0.3)' },
  'Stock Premium': { bg: 'rgba(34,197,94,0.12)', text: '#86efac', border: 'rgba(34,197,94,0.3)' },
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

/** Enterprise card with dark glassmorphic design */
const IconsGrid: FC<IconsGridProps> = ({ title, description, image }) => (
  <Box
    sx={{
      bgcolor: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(99,102,241,0.12)',
      borderRadius: '16px',
      p: { xs: 2.5, sm: 3 },
      textAlign: 'center',
      height: '100%',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      '&:hover': {
        bgcolor: 'rgba(99,102,241,0.08)',
        border: '1px solid rgba(99,102,241,0.35)',
        transform: 'translateY(-6px)',
        boxShadow: '0 12px 40px rgba(99,102,241,0.2)',
      },
    }}
  >
    {/* Logo */}
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
      <Box
        sx={{
          width: { xs: 64, sm: 76 },
          height: { xs: 64, sm: 76 },
          borderRadius: '16px',
          overflow: 'hidden',
          border: '2px solid rgba(99,102,241,0.3)',
          boxShadow: '0 0 20px rgba(99,102,241,0.15)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 0 28px rgba(99,102,241,0.3)',
          },
        }}
      >
        <img
          src={image}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>
    </Box>

    {/* Title */}
    <Typography
      sx={{
        fontSize: { xs: '1rem', sm: '1.1rem' },
        fontWeight: 700,
        mb: 1,
        background: 'linear-gradient(135deg, #e0e7ff, #c4b5fd)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {title}
    </Typography>

    {/* Description */}
    <Box sx={{ color: '#64748b', fontSize: '0.85rem' }}>
      {description}
    </Box>
  </Box>
);

/** Loading skeleton */
const LoadingState = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '16rem',
      p: 4,
    }}
  >
    <Box sx={{ width: '100%', maxWidth: 300 }}>
      <Skeleton
        height={60}
        sx={{ bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 2 }}
      />
      <Skeleton
        animation="wave"
        height={60}
        sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2 }}
      />
      <Skeleton
        animation={false}
        height={60}
        sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}
      />
    </Box>
  </Box>
);

/** Error state */
const ErrorState = () => {
  window.location.reload();
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '16rem',
        p: 4,
      }}
    >
      <Typography sx={{ color: '#f87171', textAlign: 'center' }}>
        Une erreur est survenue. Rechargement...
      </Typography>
    </Box>
  );
};

/** Glassmorphic dialog for adding an enterprise */
const EntrepriseDialog: FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  formValues: EntrepriseFormValues;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  licenceType: string;
  onLicenceChange: (event: SelectChangeEvent) => void;
  onCountryChange: (event: any, value: string | RecupType) => void;
}> = ({
  open,
  onClose,
  onSubmit,
  formValues,
  onChange,
  // licenceType,
  // onLicenceChange,
  onCountryChange
}) => (
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
        bgcolor: 'rgba(15, 23, 42, 0.97)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '20px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.55)',
      },
    }}
  >
    <DialogTitle
      sx={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.15) 100%)',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
        pb: 2,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6" sx={{ color: '#e0e7ff', fontWeight: 700 }}>
            Ajouter une entreprise
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Renseignez les informations de votre entreprise
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#64748b',
            '&:hover': { color: '#e0e7ff', bgcolor: 'rgba(255,255,255,0.08)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </DialogTitle>

    <DialogContent sx={{ pt: 3, px: 3, pb: 1 }}>
      <form onSubmit={onSubmit} id="entreprise-form">
        <Stack spacing={2.5}>
          <MyTextField
            label="Nom de l'entreprise"
            name="nom"
            value={formValues.nom}
            onChange={onChange}
            required
          />
          <MyTextField
            label="Email"
            name="email"
            type="email"
            value={formValues.email}
            onChange={onChange}
          />
          <MyTextField
            label="Numéro de téléphone"
            name="numero"
            type="tel"
            value={formValues.numero || ''}
            onChange={onChange}
          />
          <MyTextField
            label="Adresse"
            name="adresse"
            value={formValues.adresse}
            onChange={onChange}
          />
          <CountrySelect onChange={onCountryChange} label="Choisir le pays" />
        </Stack>
      </form>
    </DialogContent>

    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <Button
        onClick={onClose}
        sx={{
          color: '#64748b',
          borderRadius: '10px',
          px: 2,
          '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
        }}
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
          '&:hover': {
            bgcolor: '#4f46e5',
            boxShadow: '0 4px 20px rgba(99,102,241,0.55)',
          },
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
    setFormValues({
      nom: '',
      email: '',
      numero: 0,
      adresse: '',
      user_id: '',
      libelle: '',
    });
    setIsDialogOpen(false);
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState />;

  if (userEntreprises) {
    return (
      <Box sx={{ minHeight: '100vh', p: { xs: 2, sm: 3, lg: 4 } }}>

        {/* Header area */}
        {unUser.role === 1 ? (
          <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 5 } }}>
            <Button
              variant="contained"
              onClick={() => setIsDialogOpen(true)}
              sx={{
                bgcolor: '#6366f1',
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.92rem',
                letterSpacing: 0.5,
                boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#4f46e5',
                  boxShadow: '0 8px 30px rgba(99,102,241,0.55)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              + Ajouter une entreprise
            </Button>
          </Box>
        ) : (unUser.role === 2 || unUser.role === 3 || unUser.role === 4) ? null : (
          <Box
            sx={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '16px',
              p: { xs: 3, sm: 4 },
              mx: { xs: 1, sm: 4 },
              mb: { xs: 4, sm: 5 },
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography
              sx={{
                textAlign: 'center',
                color: '#cbd5e1',
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

        {/* Enterprise cards grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
              xl: 'repeat(4, 1fr)',
            },
            gap: { xs: 2, sm: 3 },
          }}
        >
          {userEntreprises?.map((post: any, index) => {
            const url = post.image ? BASE(post.image) : backgroundImage;
            const expired = isLicenceExpired(post.licence_date_expiration);

            return (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  ...(expired && { opacity: 0.5, filter: 'grayscale(0.6)' }),
                }}
              >
                {/* Expired badge */}
                {expired && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      zIndex: 10,
                      bgcolor: 'rgba(239,68,68,0.9)',
                      backdropFilter: 'blur(8px)',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      px: 1.5,
                      py: 0.4,
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(239,68,68,0.4)',
                      letterSpacing: 0.5,
                    }}
                  >
                    Licence expirée
                  </Box>
                )}

                <Link
                  to="/entreprise"
                  onClick={() => addId(post.uuid)}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                    height: '100%',
                  }}
                  tabIndex={expired ? -1 : 0}
                  aria-disabled={expired}
                >
                  <IconsGrid
                    image={url}
                    title={post.nom}
                    description={
                      post.licence_active && (
                        <Box sx={{ mt: 1 }} />
                      )
                    }
                  />
                </Link>
              </Box>
            );
          })}
        </Box>

        <EntrepriseDialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={onSubmit}
          formValues={formValues}
          onChange={onChange}
          licenceType={age}
          onLicenceChange={handleChange}
          onCountryChange={handleAutoFourChange}
        />
      </Box>
    );
  } else {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          p: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={() => setIsDialogOpen(true)}
            sx={{
              bgcolor: '#6366f1',
              px: 4,
              py: 1.5,
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.92rem',
              boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#4f46e5',
                boxShadow: '0 8px 30px rgba(99,102,241,0.55)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            + Ajouter une entreprise
          </Button>

          <EntrepriseDialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSubmit={onSubmit}
            formValues={formValues}
            onChange={onChange}
            licenceType={age}
            onLicenceChange={handleChange}
            onCountryChange={handleAutoFourChange}
          />
        </Box>
      </Box>
    );
  }
}