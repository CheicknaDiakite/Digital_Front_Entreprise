import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { accountService, userService } from '../../_services/account.service';

type Conditions = {
  version: string;
  titre: string;
  contenu: string;
  publiee_le: string | null;
};

type AcceptationHistoryItem = {
  id: number;
  version: string;
  titre: string;
  contenu?: string;
  acceptee_le: string;
  adresse_ip?: string | null;
};

type ConditionsUtilisationProps = {
  modal?: boolean;
  onClose?: () => void;
};

export default function ConditionsUtilisation({ modal = false, onClose }: ConditionsUtilisationProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasReadToEnd, setHasReadToEnd] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const isLogged = accountService.isLogged();

  // Requête des conditions publiées actuelles (accessible même hors connexion)
  const { data: conditionsData, isLoading, isError } = useQuery({
    queryKey: ['conditions-actuelles'],
    queryFn: () => userService.getConditionsActuelles().then((res) => res.data),
  });

  // Requête de l'historique des acceptations (si connecté)
  const { data: historiqueData } = useQuery({
    queryKey: ['conditions-historique'],
    queryFn: () => userService.getConditionsHistorique().then((res) => res.data),
    enabled: isLogged,
  });

  const conditions = conditionsData?.donnee as Conditions | null | undefined;
  const alreadyAccepted = conditionsData?.acceptee === true;
  const acceptedAt = conditionsData?.acceptee_le as string | null | undefined;
  const historique = (historiqueData?.donnee || []) as AcceptationHistoryItem[];

  const rawReturnPath = (location.state as { from?: string } | null)?.from;
  const returnPath = (!rawReturnPath || rawReturnPath.includes('conditions-utilisation') || rawReturnPath.includes('/auth/'))
    ? '/'
    : rawReturnPath;

  useEffect(() => {
    setHasReadToEnd(false);
    setAccepted(false);
  }, [conditions?.version]);

  const acceptMutation = useMutation({
    mutationFn: () => userService.acceptConditions(conditions!.version),
    onSuccess: async (response) => {
      if (!response.data.etat) {
        return toast.error(response.data.message || "Erreur lors de l'acceptation.");
      }
      toast.success('Merci, votre acceptation a été enregistrée avec succès.');

      // 1. Mettre à jour immédiatement les caches pour éviter tout rebond par TermsGuard
      queryClient.setQueryData(['User'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          conditions_a_accepter: false,
        };
      });

      queryClient.setQueryData(['conditions-actuelles'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          acceptee: true,
          acceptee_le: new Date().toISOString(),
        };
      });

      // 2. Synchroniser les requêtes avec le serveur
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['User'] }),
        queryClient.invalidateQueries({ queryKey: ['conditions-actuelles'] }),
        queryClient.invalidateQueries({ queryKey: ['conditions-historique'] }),
      ]);

      if (modal && onClose) {
        onClose();
        return;
      }
      navigate(returnPath, { replace: true });
    },
    onError: () => toast.error("L'acceptation n'a pas pu être enregistrée. Veuillez réessayer."),
  });

  const handleModalOrNavigate = (target: string) => {
    if (modal && onClose) {
      onClose();
    }
    navigate(target);
  };

  const handleBack = () => {
    if (modal && onClose) {
      onClose();
      return;
    }
    navigate(returnPath);
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= 60) {
      setHasReadToEnd(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const publishedLabel = useMemo(() => {
    if (!conditions?.publiee_le) return null;
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'long',
    }).format(new Date(conditions.publiee_le));
  }, [conditions?.publiee_le]);

  const acceptedLabel = useMemo(() => {
    if (!acceptedAt) return null;
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(acceptedAt));
  }, [acceptedAt]);

  // Extraction sommaire des articles
  const sections = useMemo(() => {
    if (!conditions?.contenu) return [];
    const lines = conditions.contenu.split('\n');
    const list: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        list.push(trimmed.replace('### ', ''));
      }
    }
    return list;
  }, [conditions?.contenu]);

  const scrollToSection = (sectionName: string) => {
    if (!scrollRef.current) return;
    const textNodes = scrollRef.current.innerText;
    const index = textNodes.indexOf(sectionName);
    if (index !== -1) {
      const ratio = index / textNodes.length;
      scrollRef.current.scrollTop = ratio * scrollRef.current.scrollHeight;
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error">
          Impossible de charger les conditions d'utilisation. Veuillez vérifier votre connexion.
        </Alert>
      </Container>
    );
  }

  if (!conditions) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="info">
          Aucune condition d'utilisation n'est publiée pour le moment.
        </Alert>
      </Container>
    );
  }

  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: modal ? 'auto' : '100vh',
        py: modal ? 0 : { xs: 2, md: 5 },
        bgcolor: modal ? 'transparent' : 'background.default',
        '@media print': {
          p: 0,
          bgcolor: '#fff',
        },
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            overflow: 'hidden',
            borderRadius: { xs: 2, sm: 4 },
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            '@media print': {
              border: 'none',
              boxShadow: 'none',
            },
          }}
        >
          {/* Bannière Header */}
          <Box
            sx={{
              p: { xs: 2.5, md: 4 },
              color: 'common.white',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
              '@media print': {
                background: 'none',
                color: 'text.primary',
                p: 0,
                mb: 2,
              },
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '@media print': { display: 'none' },
                  }}
                >
                  <GavelOutlinedIcon sx={{ fontSize: 36 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {conditions.titre}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                    <Chip
                      size="small"
                      label={`Version ${conditions.version}`}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'inherit',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                    {publishedLabel && (
                      <Typography variant="body2" sx={{ opacity: 0.88, fontSize: '0.85rem' }}>
                        Publiée le {publishedLabel}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>

              {/* Bouton d'impression */}
              <Stack direction="row" spacing={1} sx={{ '@media print': { display: 'none' } }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PrintOutlinedIcon />}
                  onClick={handlePrint}
                  sx={{
                    color: 'common.white',
                    borderColor: 'rgba(255, 255, 255, 0.35)',
                    '&:hover': {
                      borderColor: 'common.white',
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                    },
                  }}
                >
                  Imprimer / PDF
                </Button>
              </Stack>
            </Stack>
          </Box>

          {/* Contenu principal */}
          <Box sx={{ p: { xs: 2.5, md: 4 } }}>
            {/* Bannière de statut */}
            <Box sx={{ mb: 3, '@media print': { display: 'none' } }}>
              {!isLogged ? (
                <Alert
                  severity="info"
                  action={
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        color="inherit"
                        variant="outlined"
                        startIcon={<LoginOutlinedIcon />}
                        onClick={() => handleModalOrNavigate('/auth/login')}
                      >
                        Connexion
                      </Button>
                      <Button
                        size="small"
                        color="inherit"
                        variant="contained"
                        startIcon={<PersonAddAltOutlinedIcon />}
                        onClick={() => handleModalOrNavigate('/auth/register')}
                      >
                        Inscription
                      </Button>
                    </Stack>
                  }
                >
                  Vous consultez les conditions d'utilisation en vigueur. Vous pouvez vous connecter pour accéder à votre espace.
                </Alert>
              ) : alreadyAccepted ? (
                <Alert
                  severity="success"
                  icon={<CheckCircleOutlineIcon fontSize="inherit" />}
                  action={
                    isLogged ? (
                      <Button
                        size="small"
                        color="inherit"
                        variant="outlined"
                        onClick={() => navigate('/')}
                      >
                        Aller à l'accueil
                      </Button>
                    ) : undefined
                  }
                >
                  Vous avez accepté cette version des conditions d'utilisation
                  {acceptedLabel ? ` le ${acceptedLabel}` : ''}. Elles régissent votre accès à la plateforme Gest Stocks.
                </Alert>
              ) : (
                <Alert severity="warning">
                  Une nouvelle version des conditions d'utilisation est disponible. Veuillez lire le document jusqu'au bout pour pouvoir accepter et continuer.
                </Alert>
              )}
            </Box>

            {/* Sommaire interactif rapide si disponible */}
            {sections.length > 0 && (
              <Box
                sx={{
                  mb: 2.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: isDarkMode ? 'rgba(148, 163, 184, 0.08)' : '#f1f5f9',
                  border: '1px solid',
                  borderColor: 'divider',
                  '@media print': { display: 'none' },
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1 }}>
                  Table des matières rapide
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                  {sections.map((sec, idx) => (
                    <Chip
                      key={idx}
                      label={sec}
                      size="small"
                      clickable
                      onClick={() => scrollToSection(sec)}
                      sx={{
                        fontSize: '0.72rem',
                        bgcolor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'background.paper',
                        color: 'text.primary',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, isDarkMode ? 0.25 : 0.1), color: 'primary.main' },
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Zone de lecture des conditions */}
            <Box
              ref={scrollRef}
              onScroll={handleScroll}
              sx={{
                maxHeight: { xs: 380, md: 480 },
                overflowY: 'auto',
                p: { xs: 2, md: 3 },
                borderRadius: 2,
                bgcolor: isDarkMode ? 'rgba(15, 23, 42, 0.75)' : '#fafafa',
                border: '1px solid',
                borderColor: 'divider',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                fontSize: { xs: '0.9rem', md: '0.95rem' },
                lineHeight: 1.8,
                color: 'text.primary',
                '@media print': {
                  maxHeight: 'none',
                  overflowY: 'visible',
                  bgcolor: '#fff',
                  border: 'none',
                  p: 0,
                  fontSize: '11pt',
                  lineHeight: 1.5,
                },
              }}
            >
              {conditions.contenu}
            </Box>

            {/* Guide de scroll rapide */}
            {isLogged && !alreadyAccepted && (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mt: 1.5, '@media print': { display: 'none' } }}
              >
                <Typography
                  variant="caption"
                  color={hasReadToEnd ? 'success.main' : 'text.secondary'}
                  sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}
                >
                  {hasReadToEnd ? '✓ Vous avez parcouru le document.' : 'Veuillez prendre connaissance des conditions ci-dessus.'}
                </Typography>
                {!hasReadToEnd && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => {
                      if (scrollRef.current) {
                        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                        setHasReadToEnd(true);
                      }
                    }}
                    sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                  >
                    Faire défiler jusqu'en bas ↓
                  </Button>
                )}
              </Stack>
            )}

            {/* Case à cocher d'acceptation */}
            {isLogged && !alreadyAccepted && (
              <Box sx={{ mt: 2, '@media print': { display: 'none' } }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={accepted}
                      disabled={acceptMutation.isPending}
                      onChange={(e) => {
                        setAccepted(e.target.checked);
                        if (e.target.checked) setHasReadToEnd(true);
                      }}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600, cursor: 'pointer' }}>
                      J'ai lu, compris et j'accepte sans réserve les Conditions d'Utilisation de Gest Stocks (version {conditions.version}).
                    </Typography>
                  }
                />
              </Box>
            )}

            {/* Actions inférieures */}
            <Stack
              direction={{ xs: 'column-reverse', sm: 'row' }}
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
              sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider', '@media print': { display: 'none' } }}
            >
              {alreadyAccepted ? (
                isLogged ? (
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => navigate('/')}
                    sx={{
                      ml: 'auto',
                      px: 4,
                      py: 1.25,
                      fontWeight: 700,
                      boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                    }}
                  >
                    Aller à la page d'accueil
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<ArrowBackOutlinedIcon />}
                    onClick={() => handleModalOrNavigate('/auth/login')}
                  >
                    Retour à la connexion
                  </Button>
                )
              ) : isLogged ? (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<LogoutOutlinedIcon />}
                  onClick={() => {
                    if (modal && onClose) onClose();
                    accountService.logout();
                  }}
                >
                  Refuser et se déconnecter
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<ArrowBackOutlinedIcon />}
                  onClick={() => handleModalOrNavigate('/auth/login')}
                >
                  Retour à la connexion
                </Button>
              )}

              {isLogged && !alreadyAccepted && (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={!accepted || acceptMutation.isPending}
                  onClick={() => acceptMutation.mutate()}
                  sx={{
                    px: 4,
                    py: 1.25,
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                  }}
                >
                  {acceptMutation.isPending ? 'Enregistrement...' : 'Accepter et continuer'}
                </Button>
              )}
            </Stack>

            {/* Section Historique d'acceptation (si utilisateur connecté et historique existant) */}
            {isLogged && historique.length > 0 && (
              <Box sx={{ mt: 4, pt: 3, borderTop: '1px dashed', borderColor: 'divider', '@media print': { display: 'none' } }}>
                <Accordion
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '8px !important',
                    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.7)' : 'background.paper',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <HistoryOutlinedIcon color="action" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Historique de vos acceptations ({historique.length})
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Stack spacing={1.5} divider={<Divider />}>
                      {historique.map((item) => (
                        <Box key={item.id} sx={{ py: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {item.titre} — Version {item.version}
                            </Typography>
                            <Chip
                              size="small"
                              variant="outlined"
                              color="success"
                              label={new Intl.DateTimeFormat('fr-FR', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              }).format(new Date(item.acceptee_le))}
                            />
                          </Stack>
                          {item.adresse_ip && (
                            <Typography variant="caption" color="text.secondary">
                              Adresse IP enregistrée : {item.adresse_ip}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
