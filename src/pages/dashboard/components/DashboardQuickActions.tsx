import React from 'react';
import { Box, Typography, Paper, useTheme, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CategoryIcon from '@mui/icons-material/Category';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import { useAppSettings } from '../../../themes/AppSettingsContext';

interface DashboardQuickActionsProps {
  userRole?: number; // 1 = Propriétaire, 2 = Gérant, 3 = Vendeur
  isLicenceSimple?: boolean;
  canManageExpenses?: boolean;
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
  userRole,
  isLicenceSimple = false,
  canManageExpenses = false,
}) => {
  const theme = useTheme();
  const { showBackground } = useAppSettings();
  const isDark = theme.palette.mode === 'dark' || showBackground;
  const navigate = useNavigate();

  // Si userRole n'est pas 2 (Gérant) ni 3 (Vendeur), c'est le Propriétaire (1, ou nouveau compte en Découverte)
  const isOwner = userRole === 1 || !userRole || userRole === 0;
  const isManager = userRole === 2;
  const canManageStock = isOwner || isManager;

  const primaryActions = [
    {
      title: 'Nouvelle Vente',
      description: 'Caisse enregistreuse, encaissement & reçu',
      icon: <PointOfSaleIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />,
      to: '/sortie',
      color: '#6366f1',
      bgGradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      shadowColor: 'rgba(99, 102, 241, 0.4)',
      badge: 'F2 Caisse',
    },
    {
      title: 'Nouvel Approvisionnement',
      description: 'Entrée en stock multi-lignes & contrôle marges',
      icon: <AddCircleOutlineIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />,
      to: '/entre',
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      shadowColor: 'rgba(16, 185, 129, 0.4)',
      badge: 'Achats',
      hidden: !canManageStock,
    },
    {
      title: 'Nouvelle Dépense',
      description: 'Enregistrement de charge, loyer, salaires',
      icon: <MonetizationOnIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />,
      to: '/entreprise/depense',
      color: '#f43f5e',
      bgGradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
      shadowColor: 'rgba(244, 63, 94, 0.4)',
      badge: !canManageExpenses ? 'Pro' : 'Charges',
      hidden: !canManageStock,
    },
    {
      title: 'Catalogue & Produits',
      description: 'Articles, catégories, prix et niveaux de stock',
      icon: <CategoryIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />,
      to: '/categorie',
      color: '#06b6d4',
      bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      shadowColor: 'rgba(6, 182, 212, 0.4)',
      badge: 'Catalogue',
      hidden: !canManageStock,
    },
  ].filter((a) => !a.hidden);

  const secondaryLinks = [
    { label: 'Factures de Ventes', to: '/entreprise/produit/sortie', icon: <ReceiptLongIcon fontSize="small" /> },
    { label: 'Factures d’Achats', to: '/entreprise/produit/entre', icon: <DescriptionIcon fontSize="small" />, hidden: !canManageStock },
    { label: 'Facture Proforma', to: '/entreprise/PreFacture', icon: <DescriptionIcon fontSize="small" /> },
    { label: 'Clients & Fournisseurs', to: '/entreprise/client', icon: <PeopleIcon fontSize="small" /> },
    { label: 'Équipe & Personnel', to: '/entreprise/personnel', icon: <BadgeIcon fontSize="small" />, hidden: !isOwner },
    { label: 'Paramètres Entreprise', to: '/entreprise/detail', icon: <BusinessIcon fontSize="small" />, hidden: !isOwner },
  ].filter((l) => !l.hidden);

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      {/* 4 Boutons d'Action Principale */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: primaryActions.length >= 3 ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
            md: `repeat(${primaryActions.length}, 1fr)`,
          },
          gap: 2,
          mb: 2,
        }}
      >
        {primaryActions.map((action, index) => (
          <Paper
            key={index}
            onClick={() => navigate(action.to)}
            sx={{
              p: { xs: 2, sm: 2.2 },
              borderRadius: '20px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid',
              borderColor: isDark ? `${action.color}40` : `${action.color}30`,
              boxShadow: isDark
                ? `0 10px 28px -6px rgba(0,0,0,0.5), 0 0 16px -4px ${action.shadowColor}`
                : `0 8px 24px -4px ${action.shadowColor}, 0 2px 8px rgba(0,0,0,0.04)`,
              transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: action.bgGradient,
              },
              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: action.color,
                boxShadow: isDark
                  ? `0 16px 36px -6px rgba(0,0,0,0.6), 0 0 24px -2px ${action.shadowColor}`
                  : `0 16px 32px -6px ${action.shadowColor}, 0 4px 12px rgba(0,0,0,0.08)`,
                '& .action-icon': {
                  transform: 'scale(1.1) rotate(4deg)',
                },
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
              <Box
                className="action-icon"
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '16px',
                  background: action.bgGradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: `0 6px 16px -2px ${action.shadowColor}`,
                  transition: 'transform 0.25s ease',
                }}
              >
                {action.icon}
              </Box>
              <Chip
                label={action.badge}
                size="small"
                sx={{
                  bgcolor: `${action.color}18`,
                  color: action.color,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  border: `1px solid ${action.color}30`,
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '0.98rem', sm: '1.05rem' },
                  color: isDark ? '#ffffff' : '#0f172a',
                  lineHeight: 1.3,
                  mb: 0.5,
                }}
              >
                {action.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.8rem',
                  color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b',
                  lineHeight: 1.35,
                }}
              >
                {action.description}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Barre de navigation rapide secondaire (Chips de raccourcis) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          px: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8',
            mr: 0.5,
          }}
        >
          Accès directs :
        </Typography>
        {secondaryLinks.map((link, idx) => (
          <Chip
            key={idx}
            icon={link.icon}
            label={link.label}
            onClick={() => navigate(link.to)}
            clickable
            size="small"
            sx={{
              borderRadius: '10px',
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(241,245,249,0.85)',
              color: isDark ? 'rgba(255,255,255,0.85)' : '#475569',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.8)',
              fontWeight: 600,
              fontSize: '0.75rem',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
                borderColor: '#6366f1',
                color: isDark ? '#ffffff' : '#4f46e5',
                transform: 'translateY(-1px)',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};
