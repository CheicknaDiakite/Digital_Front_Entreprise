import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Pagination,
  Grid,
  Paper,
  Avatar,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Tooltip,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import toast from 'react-hot-toast';

import { useAllClients, useCreateClient, useFetchEntreprise, useFetchUser } from '../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../usePerso/store';
import { ClienType } from '../../../typescript/UserType';
import { PageHeader, KpiCard, FilterBar } from '../../../_components/common';
import { useAppSettings } from '../../../themes/AppSettingsContext';
import { usePlanAccess } from '../../../hooks/usePlanAccess';
import FeatureGate from '../../../components/FeatureGate';

export default function Client() {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;
  const navigate = useNavigate();

  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise } = useFetchEntreprise(uuid);
  const planAccess = usePlanAccess(unEntreprise?.capabilities);
  const { unUser } = useFetchUser();
  const { getClients = [], isLoading, refetch } = useAllClients(uuid || '');
  const { createClient } = useCreateClient();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'fournisseur' | 'both'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 12 : 15;

  // Modal création
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [newNom, setNewNom] = useState('');
  const [newPrenom, setNewPrenom] = useState('');
  const [newTelephone, setNewTelephone] = useState('');
  const [newAdresse, setNewAdresse] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<number>(1); // 1 = Client, 2 = Fournisseur, 3 = Client & Fournisseur
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper avatar
  const getInitials = (name?: string) => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleBadge = (role?: number) => {
    switch (role) {
      case 1:
        return { label: 'Client', color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)' };
      case 2:
        return { label: 'Fournisseur', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' };
      case 3:
        return { label: 'Client & Fournisseur', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' };
      default:
        return { label: 'Contact', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)' };
    }
  };

  // KPIs
  const metrics = useMemo(() => {
    const total = getClients.length;
    const clientsOnly = getClients.filter((c) => c.role === 1).length;
    const suppliersOnly = getClients.filter((c) => c.role === 2).length;
    const both = getClients.filter((c) => c.role === 3).length;
    return {
      total,
      clients: clientsOnly + both,
      suppliers: suppliersOnly + both,
      both,
    };
  }, [getClients]);

  // Filtrage
  const filteredContacts = useMemo(() => {
    let result = [...getClients];

    // Filtre rôle
    if (roleFilter === 'client') {
      result = result.filter((c) => c.role === 1 || c.role === 3);
    } else if (roleFilter === 'fournisseur') {
      result = result.filter((c) => c.role === 2 || c.role === 3);
    } else if (roleFilter === 'both') {
      result = result.filter((c) => c.role === 3);
    }

    // Filtre texte
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.nom?.toLowerCase().includes(q) ||
          c.libelle?.toLowerCase().includes(q) ||
          String(c.numero || '').includes(q) ||
          c.adresse?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [getClients, roleFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredContacts.slice(start, start + itemsPerPage);
  }, [filteredContacts, currentPage, itemsPerPage]);

  // Handle submit contact
  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNom.trim()) {
      toast.error('Le nom du contact est obligatoire');
      return;
    }

    setIsSubmitting(true);
    const fullName = newPrenom.trim() ? `${newNom.trim()} ${newPrenom.trim()}` : newNom.trim();

    const payload: ClienType = {
      nom: fullName,
      adresse: newAdresse.trim(),
      email: newEmail.trim(),
      numero: newTelephone ? Number(newTelephone.replace(/\D/g, '')) : 0,
      role: newRole,
      entreprise_id: uuid || '',
      user_id: unUser?.uuid || '',
    };

    createClient(payload);

    setTimeout(() => {
      setIsSubmitting(false);
      setOpenCreateModal(false);
      setNewNom('');
      setNewPrenom('');
      setNewTelephone('');
      setNewAdresse('');
      setNewEmail('');
      setNewRole(1);
      refetch?.();
      toast.success('Contact enregistré avec succès');
    }, 600);
  };

  if (!planAccess.canManageClients) {
    return (
      <Box sx={{ width: '100%', py: 4 }}>
        <FeatureGate
          hasAccess={false}
          requiredPlan="Stock Simple"
          featureTitle="Gestion des Clients & Fournisseurs"
          description="Créez et suivez votre carnet d'adresses clients et fournisseurs, coordonnées et historique commercial."
        >
          <div />
        </FeatureGate>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', py: 1 }}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Répertoire des Contacts"
        subtitle="Gestion des clients, fournisseurs et partenaires commerciaux de l'entreprise"
        breadcrumbs={[
          { label: 'Accueil', to: '/' },
          { label: 'Entreprise', to: '/entreprise/detail' },
          { label: 'Contacts' },
        ]}
        actions={
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenCreateModal(true)}
            sx={{
              borderRadius: '12px',
              px: 2.5,
              py: 1,
              fontWeight: 700,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
              },
            }}
          >
            + Nouveau Contact
          </Button>
        }
      />

      {/* ── KPI Cards Strip ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Contacts"
            value={metrics.total}
            subtitle="Répertoire global"
            icon={<PeopleIcon />}
            accentColor="#6366f1"
            onClick={() => setRoleFilter('all')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Clients Acheteurs"
            value={metrics.clients}
            subtitle="Particuliers & entreprises"
            icon={<StorefrontIcon />}
            accentColor="#10b981"
            onClick={() => setRoleFilter('client')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Fournisseurs"
            value={metrics.suppliers}
            subtitle="Approvisionnements & achats"
            icon={<LocalShippingIcon />}
            accentColor="#f59e0b"
            onClick={() => setRoleFilter('fournisseur')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Profils Mixtes"
            value={metrics.both}
            subtitle="Client & Fournisseur"
            icon={<PeopleIcon />}
            accentColor="#06b6d4"
            onClick={() => setRoleFilter('both')}
          />
        </Grid>
      </Grid>

      {/* ── Barre de Filtres & Commutateur de Vue ── */}
      <Box sx={{ mb: 3 }}>
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={(v) => {
            setSearchTerm(v);
            setCurrentPage(1);
          }}
          searchPlaceholder="Rechercher par nom, téléphone, adresse, email..."
          showPresets={false}
          extraFilters={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Tous (${metrics.total})`}
                size="small"
                clickable
                onClick={() => {
                  setRoleFilter('all');
                  setCurrentPage(1);
                }}
                sx={{
                  fontWeight: 700,
                  bgcolor: roleFilter === 'all' ? '#6366f1' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(241,245,249,0.9)',
                  color: roleFilter === 'all' ? '#ffffff' : isDark ? '#ffffff' : '#475569',
                }}
              />
              <Chip
                label={`Clients seuls (${metrics.clients})`}
                size="small"
                clickable
                onClick={() => {
                  setRoleFilter('client');
                  setCurrentPage(1);
                }}
                sx={{
                  fontWeight: 700,
                  bgcolor: roleFilter === 'client' ? '#10b981' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(241,245,249,0.9)',
                  color: roleFilter === 'client' ? '#ffffff' : isDark ? '#ffffff' : '#475569',
                }}
              />
              <Chip
                label={`Fournisseurs (${metrics.suppliers})`}
                size="small"
                clickable
                onClick={() => {
                  setRoleFilter('fournisseur');
                  setCurrentPage(1);
                }}
                sx={{
                  fontWeight: 700,
                  bgcolor: roleFilter === 'fournisseur' ? '#f59e0b' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(241,245,249,0.9)',
                  color: roleFilter === 'fournisseur' ? '#ffffff' : isDark ? '#ffffff' : '#475569',
                }}
              />
              <Chip
                label={`Mixtes (${metrics.both})`}
                size="small"
                clickable
                onClick={() => {
                  setRoleFilter('both');
                  setCurrentPage(1);
                }}
                sx={{
                  fontWeight: 700,
                  bgcolor: roleFilter === 'both' ? '#06b6d4' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(241,245,249,0.9)',
                  color: roleFilter === 'both' ? '#ffffff' : isDark ? '#ffffff' : '#475569',
                }}
              />

              {/* View mode toggle */}
              <Box
                sx={{
                  ml: { xs: 0, sm: 'auto' },
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(241,245,249,0.9)',
                  borderRadius: '10px',
                  p: 0.3,
                }}
              >
                <Tooltip title="Vue Grille de Cartes">
                  <IconButton
                    size="small"
                    onClick={() => setViewMode('grid')}
                    sx={{
                      bgcolor: viewMode === 'grid' ? '#6366f1' : 'transparent',
                      color: viewMode === 'grid' ? '#ffffff' : isDark ? '#94a3b8' : '#64748b',
                      borderRadius: '8px',
                    }}
                  >
                    <ViewModuleIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Vue Tableau">
                  <IconButton
                    size="small"
                    onClick={() => setViewMode('table')}
                    sx={{
                      bgcolor: viewMode === 'table' ? '#6366f1' : 'transparent',
                      color: viewMode === 'table' ? '#ffffff' : isDark ? '#94a3b8' : '#64748b',
                      borderRadius: '8px',
                    }}
                  >
                    <ViewListIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          }
        />
      </Box>

      {/* ── Contenu Contacts ── */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={45} sx={{ color: '#6366f1' }} />
        </Box>
      ) : filteredContacts.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: '20px',
            bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.9)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.8)',
          }}
        >
          <PeopleIcon sx={{ fontSize: 52, color: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1', mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', mb: 0.5 }}>
            Aucun contact trouvé
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', mb: 2 }}>
            Modifiez votre recherche ou ajoutez un nouveau client/fournisseur.
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenCreateModal(true)}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#6366f1',
            }}
          >
            Ajouter un contact
          </Button>
        </Paper>
      ) : viewMode === 'grid' ? (
        /* ── Grille de Cartes ── */
        <Grid container spacing={2.5}>
          {paginatedContacts.map((contact, idx) => {
            const roleBadge = getRoleBadge(contact.role);
            const initials = getInitials(contact.nom);
            const phoneStr = contact.numero ? String(contact.numero) : '';

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.2,
                    borderRadius: '18px',
                    bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.8)',
                    boxShadow: isDark ? '0 6px 20px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.04)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: roleBadge.color,
                      boxShadow: isDark
                        ? `0 12px 28px -6px rgba(0,0,0,0.5), 0 0 16px -4px ${roleBadge.color}35`
                        : `0 12px 28px -6px ${roleBadge.color}25, 0 4px 12px rgba(0,0,0,0.06)`,
                    },
                  }}
                >
                  <Box>
                    {/* Header Carte : Avatar + Badge */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: roleBadge.color,
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '1.05rem',
                          boxShadow: `0 4px 12px ${roleBadge.color}40`,
                        }}
                      >
                        {initials}
                      </Avatar>

                      <Chip
                        label={roleBadge.label}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          bgcolor: roleBadge.bg,
                          color: roleBadge.color,
                          border: `1px solid ${roleBadge.border}`,
                        }}
                      />
                    </Box>

                    {/* Nom & Infos */}
                    <Typography
                      variant="subtitle1"
                      noWrap
                      sx={{
                        fontWeight: 800,
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '1rem',
                        lineHeight: 1.3,
                        mb: 1.2,
                      }}
                    >
                      {contact.nom}
                    </Typography>

                    {/* Coordonnées */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                      {phoneStr ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: '#10b981' }} />
                          <Typography
                            variant="body2"
                            component="a"
                            href={`tel:${phoneStr}`}
                            sx={{
                              color: isDark ? 'rgba(255,255,255,0.85)' : '#334155',
                              fontWeight: 600,
                              textDecoration: 'none',
                              fontSize: '0.82rem',
                              '&:hover': { color: '#10b981', textDecoration: 'underline' },
                            }}
                          >
                            {phoneStr}
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: isDark ? '#64748b' : '#cbd5e1' }} />
                          <Typography variant="caption" sx={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                            Téléphone non renseigné
                          </Typography>
                        </Box>
                      )}

                      {contact.adresse ? (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <LocationOnIcon sx={{ fontSize: 16, color: '#f59e0b', mt: 0.2 }} />
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b', fontSize: '0.8rem' }}
                          >
                            {contact.adresse}
                          </Typography>
                        </Box>
                      ) : null}

                      {contact.email ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b', fontSize: '0.8rem' }}
                          >
                            {contact.email}
                          </Typography>
                        </Box>
                      ) : null}
                    </Box>
                  </Box>

                  {/* Actions bas de carte */}
                  <Box sx={{ pt: 2, mt: 2, borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(226,232,240,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {phoneStr ? (
                      <Tooltip title="Contacter sur WhatsApp">
                        <IconButton
                          size="small"
                          component="a"
                          href={`https://wa.me/${phoneStr.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          sx={{
                            bgcolor: 'rgba(34,197,94,0.12)',
                            color: '#22c55e',
                            '&:hover': { bgcolor: '#22c55e', color: '#ffffff' },
                          }}
                        >
                          <WhatsAppIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : <Box />}

                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate(`/entreprise/client/info/${contact.uuid}`)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        borderRadius: '8px',
                        color: '#6366f1',
                        '&:hover': { bgcolor: 'rgba(99,102,241,0.1)' },
                      }}
                    >
                      Fiche 360°
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        /* ── Vue Tableau ── */
        <Paper
          elevation={0}
          sx={{
            borderRadius: '18px',
            overflow: 'hidden',
            bgcolor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.9)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.8)',
          }}
        >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: isDark ? '#0f172a' : '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#334155' }}>Contact</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#334155' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#334155' }}>Téléphone</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#334155' }}>Adresse</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#334155' }}>Email</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#334155' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedContacts.map((contact, idx) => {
                  const roleBadge = getRoleBadge(contact.role);
                  const phoneStr = contact.numero ? String(contact.numero) : '';

                  return (
                    <TableRow key={idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 34,
                              height: 34,
                              bgcolor: roleBadge.color,
                              fontSize: '0.8rem',
                              fontWeight: 800,
                            }}
                          >
                            {getInitials(contact.nom)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a' }}>
                            {contact.nom}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={roleBadge.label}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            bgcolor: roleBadge.bg,
                            color: roleBadge.color,
                            border: `1px solid ${roleBadge.border}`,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.85)' : '#334155' }}>
                          {phoneStr || '—'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b' }}>
                          {contact.adresse || '—'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b' }}>
                          {contact.email || '—'}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          size="small"
                          endIcon={<ArrowForwardIcon />}
                          onClick={() => navigate(`/entreprise/client/info/${contact.uuid}`)}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            color: '#6366f1',
                          }}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, p) => setCurrentPage(p)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {/* ── Modale de Création Rapide ── */}
      <Dialog
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            bgcolor: isDark ? '#0f172a' : '#ffffff',
            backgroundImage: 'none',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
            Nouveau Contact Commercial
          </Typography>
          <IconButton size="small" onClick={() => setOpenCreateModal(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleCreateContact}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nom / Raison Sociale *"
                  fullWidth
                  size="small"
                  value={newNom}
                  onChange={(e) => setNewNom(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Prénom (Optionnel)"
                  fullWidth
                  size="small"
                  value={newPrenom}
                  onChange={(e) => setNewPrenom(e.target.value)}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Téléphone *"
                  fullWidth
                  size="small"
                  value={newTelephone}
                  onChange={(e) => setNewTelephone(e.target.value)}
                  placeholder="Ex: 77 123 45 67"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Type de Contact *"
                  fullWidth
                  size="small"
                  value={newRole}
                  onChange={(e) => setNewRole(Number(e.target.value))}
                >
                  <MenuItem value={1}>Client uniquement</MenuItem>
                  <MenuItem value={2}>Fournisseur uniquement</MenuItem>
                  <MenuItem value={3}>Client & Fournisseur (Mixte)</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label="Adresse / Ville"
              fullWidth
              size="small"
              value={newAdresse}
              onChange={(e) => setNewAdresse(e.target.value)}
              placeholder="Ex: Bamako, Hamdallaye ACI 2000"
            />

            <TextField
              label="Adresse Email"
              type="email"
              fullWidth
              size="small"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="contact@exemple.com"
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setOpenCreateModal(false)}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                }}
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer le contact'}
              </Button>
            </Box>
          </DialogContent>
        </form>
      </Dialog>
    </Box>
  );
}
