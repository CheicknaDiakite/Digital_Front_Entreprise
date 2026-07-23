import React, { ChangeEvent, FormEvent, useState } from "react";
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  Stack,
  Box,
  DialogActions,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import {
  BarChart as DashboardIcon,
  Category as CategoryIcon,
  AddCircle as AddCircleIcon,
  ExitToApp as ExitToAppIcon,
  AccountCircle as UserCircleIcon,
  PowerSettingsNew as PowerIcon,
  ExpandLess,
  ExpandMore,
  Discount as DiscountIcon,
} from "@mui/icons-material";
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import DescriptionIcon from '@mui/icons-material/Description';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from '@mui/icons-material/History';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Link, useLocation } from "react-router-dom";
import { connect } from "../../../../../_services/account.service";
import { useAddAvis, useFetchEntreprise, useFetchUser, useGetUserEntreprises, useRestructionUsers } from "../../../../../usePerso/fonction.user";
import { isAccessAllowed, logout } from "../../../../../usePerso/fonctionPerso";
import { useStoreUuid } from "../../../../../usePerso/store";
import MyTextField from "../../../../../_components/Input/MyTextField";
import { AvisType } from "../../../../../typescript/UserType";
import Example from "../../../../../boutique/Ct";

// ── Types ──────────────────────────────────────────────────────────────────────

interface NavItemProps {
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  to?: string;
  accentColor?: string;
  isExpanded?: boolean;
  isSubItem?: boolean;
}

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  values: AvisType;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

/** Small uppercase section title */
const SectionLabel = ({ label }: { label: string }) => (
  <Typography
    sx={{
      fontSize: '0.65rem',
      fontWeight: 700,
      letterSpacing: 1.6,
      color: '#475569',
      textTransform: 'uppercase',
      px: 1.5,
      pt: 1.5,
      pb: 0.4,
      userSelect: 'none',
    }}
  >
    {label}
  </Typography>
);

/** Thin horizontal separator */
const NavDivider = () => (
  <Box sx={{ mx: 1.5, my: 1, height: '1px', bgcolor: 'rgba(255,255,255,0.05)' }} />
);

/** Single navigation item */
const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  onClick,
  to,
  accentColor = '#6366f1',
  isExpanded,
  isSubItem = false,
}) => {
  const location = useLocation();
  const isActive = to
    ? location.pathname === to || (to.length > 1 && location.pathname.startsWith(to))
    : false;

  const content = (
    <ListItem
      button
      onClick={onClick}
      sx={{
        borderRadius: '10px',
        mb: 0.35,
        px: 1.5,
        py: isSubItem ? 0.65 : 0.85,
        ml: isSubItem ? 1.5 : 0,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: isActive ? `${accentColor}22` : 'transparent',
        border: `1px solid ${isActive ? `${accentColor}40` : 'transparent'}`,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          bgcolor: `${accentColor}14`,
          border: `1px solid ${accentColor}28`,
          transform: 'translateX(3px)',
        },
        // Active left-bar indicator
        ...(isActive && {
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: '20%',
            height: '60%',
            width: '3px',
            bgcolor: accentColor,
            borderRadius: '0 4px 4px 0',
          },
        }),
      }}
    >
      {/* Icon with rounded bg */}
      {icon && (
        <ListItemIcon sx={{ minWidth: 38 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: isActive ? `${accentColor}28` : 'rgba(255,255,255,0.05)',
              transition: 'all 0.2s ease',
              '& .MuiSvgIcon-root': { fontSize: 17 },
            }}
          >
            {icon}
          </Box>
        </ListItemIcon>
      )}

      {/* Sub-item bullet line */}
      {isSubItem && !icon && (
        <Box
          sx={{
            width: 14,
            height: '1px',
            bgcolor: `${accentColor}55`,
            mr: 1.5,
            ml: 0.5,
            flexShrink: 0,
          }}
        />
      )}

      <Typography
        sx={{
          color: isActive ? '#e0e7ff' : isSubItem ? '#94a3b8' : '#cbd5e1',
          fontSize: isSubItem ? '0.81rem' : '0.87rem',
          fontWeight: isActive ? 600 : 500,
          flex: 1,
          letterSpacing: 0.2,
          transition: 'color 0.2s ease',
          lineHeight: 1.4,
        }}
      >
        {label}
      </Typography>

      {isExpanded !== undefined && (
        isExpanded
          ? <ExpandLess sx={{ color: accentColor, fontSize: 18, flexShrink: 0 }} />
          : <ExpandMore sx={{ color: '#475569', fontSize: 18, flexShrink: 0 }} />
      )}
    </ListItem>
  );

  return to
    ? <Link to={to} style={{ textDecoration: 'none', display: 'block' }}>{content}</Link>
    : content;
};

/** Glassmorphic feedback dialog */
const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  open, onClose, onSubmit, values, onChange,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    PaperProps={{
      sx: {
        bgcolor: 'rgba(15, 23, 42, 0.97)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '20px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.55)',
      },
    }}
  >
    <DialogTitle sx={{ pb: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="h6" sx={{ color: '#e0e7ff', fontWeight: 700 }}>
            Donnez votre avis
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Votre retour nous aide à améliorer GestStocks
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            mt: 0.5,
            color: '#64748b',
            '&:hover': { color: '#e0e7ff', bgcolor: 'rgba(255,255,255,0.08)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </DialogTitle>

    <form onSubmit={onSubmit}>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2.5}>
          <MyTextField
            label="Titre"
            name="libelle"
            value={values.libelle}
            onChange={onChange}
            required
          />
          <MyTextField
            label="Description"
            name="description"
            value={values.description}
            onChange={onChange}
            multiline
            rows={4}
            required
          />
        </Stack>
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
          Envoyer
        </Button>
      </DialogActions>
    </form>
  </Dialog>
);

// ── Main component ──────────────────────────────────────────────────────────────

const NavSide: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<number>(0);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { getRestruction } = useRestructionUsers();
  const { unUser } = useFetchUser();
  const uuid = useStoreUuid((state) => state.selectedId);
  const { userEntreprises } = useGetUserEntreprises();
  const { unEntreprise } = useFetchEntreprise(uuid);
  const addId = useStoreUuid((state) => state.addId);
  const { createAvis } = useAddAvis();

  const [avisValues, setAvisValues] = useState<AvisType>({
    libelle: '',
    description: '',
    user_id: '',
  });

  const handleSectionExpand = (section: number): void => {
    setExpandedSection(expandedSection === section ? 0 : section);
  };

  const handleAvisChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAvisValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvisSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createAvis({ ...avisValues, user_id: connect });
    setAvisValues({ libelle: '', description: '', user_id: '' });
    setFeedbackDialogOpen(false);
  };

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 2rem)',
        maxWidth: '20rem',
        borderRadius: '16px',
        border: '1px solid rgba(99,102,241,0.12)',
        bgcolor: 'rgba(10, 15, 30, 0.97)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}
    >
      {/* ── Scrollable area ── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          px: 1,
          py: 1,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(99,102,241,0.3)',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
        }}
      >
        <List disablePadding>

          {/* ── ESPACE DE TRAVAIL ── */}
          <SectionLabel label="Espace de travail" />
          <NavItem
            icon={<AddBusinessIcon sx={{ color: '#818cf8' }} />}
            label="Entreprise(s)"
            onClick={() => handleSectionExpand(5)}
            accentColor="#6366f1"
            isExpanded={expandedSection === 5}
          />
          <Collapse in={expandedSection === 5} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {userEntreprises?.map((entreprise) => (
                <NavItem
                  key={entreprise.uuid}
                  label={entreprise.nom}
                  onClick={() => {
                    setLoading(true);
                    addId(entreprise.uuid!);
                    window.location.reload();
                  }}
                  to="/entreprise"
                  accentColor="#6366f1"
                  isSubItem
                />
              ))}
            </List>
          </Collapse>

          {/* ── NAVIGATION ── */}
          {uuid && (
            <>
              <NavDivider />
              <SectionLabel label="Navigation" />

              <NavItem
                icon={<DashboardIcon sx={{ color: '#818cf8' }} />}
                label="Accueil"
                onClick={() => handleSectionExpand(1)}
                accentColor="#6366f1"
                isExpanded={expandedSection === 1}
              />

              {(unUser.role === 1 || unUser.role === 2 || unUser.role === 3) && (
                <Collapse in={expandedSection === 1} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {(unUser.role === 1 || unUser.role === 2) && (
                      <>
                        <NavItem
                          icon={<CategoryIcon sx={{ color: '#a5b4fc' }} />}
                          label="Article"
                          to="/categorie"
                          accentColor="#6366f1"
                          isSubItem
                        />
                        <NavItem
                          icon={<AddCircleIcon sx={{ color: '#34d399' }} />}
                          label="Entrer (Achat)"
                          to="/entre"
                          accentColor="#10b981"
                          isSubItem
                        />
                      </>
                    )}
                    {(() => {
                      if (!getRestruction) return null;
                      if (isAccessAllowed(getRestruction)) {
                        return (
                          <NavItem
                            icon={<ExitToAppIcon sx={{ color: '#f87171' }} />}
                            label="Sortie (Vente)"
                            to="/sortie"
                            accentColor="#ef4444"
                            isSubItem
                          />
                        );
                      }
                    })()}
                    <NavItem
                      icon={<DiscountIcon sx={{ color: '#fb923c' }} />}
                      label="Remise Facture"
                      to="/sortie/remise"
                      accentColor="#f97316"
                      isSubItem
                    />
                  </List>
                </Collapse>
              )}
            </>
          )}

          {/* ── INVENTAIRE ── */}
          {((unUser.role === 1 || unUser.role === 2) && uuid) && (
            <>
              <NavDivider />
              <SectionLabel label="Inventaire" />
              <NavItem
                icon={<HistoryEduIcon sx={{ color: '#34d399' }} />}
                label="Inventaire"
                onClick={() => handleSectionExpand(2)}
                accentColor="#10b981"
                isExpanded={expandedSection === 2}
              />
              <Collapse in={expandedSection === 2} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <NavItem
                    label="Ventes"
                    to="/entreprise/inventaire/sortie"
                    accentColor="#10b981"
                    isSubItem
                  />
                  {unEntreprise.licence_type !== 'Stock Simple' && (
                    <>
                      <NavItem
                        label="Achats"
                        to="/entreprise/inventaire/entrer"
                        accentColor="#10b981"
                        isSubItem
                      />
                      <NavItem
                        label="Etat des produits"
                        to="/entreprise/inventaire/EtaDesProduits"
                        accentColor="#10b981"
                        isSubItem
                      />
                    </>
                  )}
                  {(unUser.role === 1 && uuid) && unEntreprise.licence_type !== 'Stock Simple' && (
                    <NavItem
                      label="Etat des utilisateurs"
                      to="/entreprise/inventaire/VenteUsers"
                      accentColor="#10b981"
                      isSubItem
                    />
                  )}
                </List>
              </Collapse>
            </>
          )}

          {/* ── HISTORIQUE ── */}
          {(unUser.role === 1 && uuid) && (
            <>
              <NavDivider />
              <SectionLabel label="Historique" />
              <NavItem
                icon={<HistoryIcon sx={{ color: '#fbbf24' }} />}
                label="Historique"
                onClick={() => handleSectionExpand(3)}
                accentColor="#f59e0b"
                isExpanded={expandedSection === 3}
              />
              <Collapse in={expandedSection === 3} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <NavItem
                    label="Entrées & Sorties"
                    to="/entreprise/historique"
                    accentColor="#f59e0b"
                    isSubItem
                  />
                  <NavItem
                    label="Historique des suppressions"
                    to="/entreprise/historique/sppression"
                    accentColor="#f59e0b"
                    isSubItem
                  />
                </List>
              </Collapse>
            </>
          )}

          {/* ── ADMINISTRATION ── */}
          {(unUser.role === 1 && unUser.is_superuser) && (
            <>
              <NavDivider />
              <SectionLabel label="Administration" />
              <NavItem
                icon={<UserCircleIcon sx={{ color: '#60a5fa' }} />}
                label="Les Admin"
                to="/user/admin"
                accentColor="#3b82f6"
              />
              <NavItem
                icon={<UserCircleIcon sx={{ color: '#60a5fa' }} />}
                label="Les Avis"
                to="/user/avis"
                accentColor="#3b82f6"
              />
            </>
          )}

          {(unUser.role === 1 && unUser.is_cabinet) && (
            <NavItem
              icon={<UserCircleIcon sx={{ color: '#60a5fa' }} />}
              label="Mes inscrits"
              to="/user/mesInscrit"
              accentColor="#3b82f6"
            />
          )}

          {/* ── SUPPORT ── */}
          <NavDivider />
          <SectionLabel label="Support" />
          <NavItem
            icon={<DescriptionIcon sx={{ color: '#7dd3fc' }} />}
            label="Documentation"
            to="https://documentation.gest-stocks.com"
            accentColor="#0ea5e9"
          />
          <NavItem
            icon={<HelpOutlineIcon sx={{ color: '#c084fc' }} />}
            label="Que pensez-vous ?"
            onClick={() => setFeedbackDialogOpen(true)}
            accentColor="#a855f7"
          />
          {(unUser.role === 1 || unUser.role === 2) && (
            <NavItem
              icon={<HelpOutlineIcon sx={{ color: '#c084fc' }} />}
              label="Abonnement ?"
              onClick={() => setHelpDialogOpen(true)}
              accentColor="#a855f7"
            />
          )}

        </List>
      </Box>

      {/* ── Bottom pinned area ── */}
      <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5 }}>
        <Box sx={{ height: '1px', bgcolor: 'rgba(255,255,255,0.06)', mb: 1.2 }} />

        {/* WhatsApp */}
        <Link
          to="https://wa.me/22391154834"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              bgcolor: 'rgba(34, 197, 94, 0.07)',
              border: '1px solid rgba(34, 197, 94, 0.18)',
              borderRadius: '10px',
              px: 2,
              py: 0.9,
              mb: 0.8,
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
            <Typography sx={{ color: '#86efac', fontSize: '0.81rem', fontWeight: 600, letterSpacing: 0.3 }}>
              +223 91 15 48 34
            </Typography>
          </Box>
        </Link>

        {/* Logout */}
        <Box
          onClick={logout}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.14)',
            borderRadius: '10px',
            px: 2,
            py: 0.9,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          <PowerIcon sx={{ color: '#f87171', fontSize: 18 }} />
          <Typography sx={{ color: '#fca5a5', fontSize: '0.81rem', fontWeight: 600, letterSpacing: 0.3 }}>
            Déconnexion
          </Typography>
        </Box>
      </Box>

      {/* ── Dialogs ── */}
      <FeedbackDialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        onSubmit={handleAvisSubmit}
        values={avisValues}
        onChange={handleAvisChange}
      />

      <Dialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.97)',
            backdropFilter: 'blur(24px)',
            borderRadius: '20px',
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.55)',
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ color: '#e0e7ff', fontWeight: 700 }}>
              Aide & Abonnement
            </Typography>
            <IconButton
              onClick={() => setHelpDialogOpen(false)}
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
        <DialogContent>
          <Example />
        </DialogContent>
      </Dialog>

      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1301,
          flexDirection: 'column',
          gap: 2,
        }}
        open={loading}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6" component="div">
          Rechargement en cours...
        </Typography>
      </Backdrop>
    </Card>
  );
};

export default NavSide;
