import { lazy } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Loadable from '../../components/Loadable'
import Dashboard from '../../layout/Dashboard'
import ProtectedRoute from '../ProtectedRoute'
import backgroundImage from '../../../public/assets/img/img.jpg'
import { Box, CircularProgress } from '@mui/material'
import { useStoreUuid } from '../../usePerso/store'
import { useFetchEntreprise } from '../../usePerso/fonction.user'
import { BASE } from '../../_services/caller.service'
import { useAppSettings } from '../../themes/AppSettingsContext';
import { notClick } from '../../usePerso/fonctionPerso'

// Lazy loaded page components
const DashboardDefault = Loadable(lazy(() => import('../../pages/dashboard')))
const Sortie = Loadable(lazy(() => import('../../boutique/sortie/Sortie')))
const Entre = Loadable(lazy(() => import('../../boutique/inventaire/Entre')))
const ComponentShadow = Loadable(lazy(() => import('../../pages/component-overview/shadows')))
const CatalogueUnifie = Loadable(lazy(() => import('../../boutique/categorie/CatalogueUnifie')))
const ModifCate = Loadable(lazy(() => import('../../boutique/categorie/ModifCate')))
const ModifSousCate = Loadable(lazy(() => import('../../boutique/categorie/sousCat/ModifSousCate')))
const ModifEntre = Loadable(lazy(() => import('../../boutique/inventaire/ModifEntre')))
const ModifSortie = Loadable(lazy(() => import('../../boutique/sortie/ModifSortie')))
const Info = Loadable(lazy(() => import('../../boutique/categorie/sousCat/info/Info')))
const Client = Loadable(lazy(() => import('../../boutique/proprietaire/client/Client')))
const ClientInfo = Loadable(lazy(() => import('../../boutique/proprietaire/client/ClientInfo')))
const Admin = Loadable(lazy(() => import('../../boutique/proprietaire/Admin/Admin')))
const SousCat = Loadable(lazy(() => import('../../boutique/categorie/sousCat/SousCat')))
const Facture = Loadable(lazy(() => import('../../boutique/factureCard/PreFacture/Facture')))
const FacEntre = Loadable(lazy(() => import('../../boutique/proprietaire/Produit/Entre/FacEntre')))
const FacSortie = Loadable(lazy(() => import('../../boutique/proprietaire/Produit/Sortie/FacSortie')))
const ModifProduitEntre = Loadable(lazy(() => import('../../boutique/proprietaire/Produit/Entre/ModifProduitEntre')))
const ModifProduitSortie = Loadable(lazy(() => import('../../boutique/proprietaire/Produit/Sortie/ModifProduitSortie')))
const Users = Loadable(lazy(() => import('../../boutique/proprietaire/users/Users')))
const UserModif = Loadable(lazy(() => import('../../boutique/proprietaire/users/UserModif').then(m => ({ default: m.UserModif }))))
const Depense = Loadable(lazy(() => import('../../boutique/proprietaire/Produit/Depense')))
const DepenseModif = Loadable(lazy(() => import('../../boutique/proprietaire/Produit/DepenseModif')))
const HistoriqueSupp = Loadable(lazy(() => import('../../boutique/proprietaire/historique/HistoriqueSupp')))
const Entreprise = Loadable(lazy(() => import('../../boutique/proprietaire/Admin/Entreprise')))
const EntrepriseDetail = Loadable(lazy(() => import('../../boutique/proprietaire/Admin/EntrepriseDetail')))
const Personnel = Loadable(lazy(() => import('../../boutique/proprietaire/Personnel/Personnel')))
const PersonnelModif = Loadable(lazy(() => import('../../boutique/proprietaire/Personnel/PersonnelModif').then(m => ({ default: m.PersonnelModif }))))
const PersonnelInfo = Loadable(lazy(() => import('../../boutique/proprietaire/Personnel/PersonnelInfo')))
const SortieInventaire = Loadable(lazy(() => import('../../boutique/proprietaire/historique/inventaire/SortieInventaire')))
const EntrerInventaire = Loadable(lazy(() => import('../../boutique/proprietaire/historique/inventaire/EntrerInventaire')))
const EtaVente = Loadable(lazy(() => import('../../boutique/categorie/eta/EtaVente')))
const Avis = Loadable(lazy(() => import('../../boutique/proprietaire/users/Avis')))
const EtaProduits = Loadable(lazy(() => import('../../boutique/categorie/eta/EtaProduits')))
const VenteUsers = Loadable(lazy(() => import('../../boutique/categorie/eta/VenteUsers')))
const MesInscrit = Loadable(lazy(() => import('../../boutique/proprietaire/users/MesInscrit')))
const FactureDetail = Loadable(lazy(() => import('../../boutique/sortie/FactureDetail')))
const Historique = Loadable(lazy(() => import('../../boutique/proprietaire/historique/Historique')))
const NotFound = Loadable(lazy(() => import('../../pages/extra-pages/not-found')))

export default function PublicRouter() {
  notClick()
  const uuid = useStoreUuid((state) => state.selectedId);
  const { unEntreprise, isLoading } = useFetchEntreprise(uuid);
  const url = unEntreprise.image ? BASE(unEntreprise.image) : backgroundImage;
  const { showBackground } = useAppSettings();

  return (
    <Box
      sx={{
        ...(showBackground
          ? {
              background: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.75)), url(${url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }
          : {
              background: 'transparent',
            }),
        padding: { sm: '24px', md: '32px' },
      }}
    >
      {isLoading && (
        <Box
          role="status"
          aria-label="Chargement de l'entreprise"
          sx={{
            position: 'fixed',
            zIndex: (theme) => theme.zIndex.modal + 1,
            right: { xs: 16, sm: 24 },
            bottom: { xs: 16, sm: 24 },
            display: 'grid',
            width: 44,
            height: 44,
            placeItems: 'center',
            border: '1px solid rgba(255, 255, 255, 0.36)',
            borderRadius: 2.5,
            backgroundColor: 'rgba(10, 29, 51, 0.72)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <CircularProgress size={20} thickness={4} sx={{ color: 'common.white' }} />
        </Box>
      )}
      <Routes>
        <Route element={<Dashboard />}>
          <Route index element={<Entreprise />} />

          <Route path='entreprise'>
            <Route index element={<DashboardDefault />} />
            <Route path='Avis' element={<Avis />} />
            <Route path='PreFacture' element={<Facture />} />
            <Route path='EtaDeVente' element={<EtaVente />} />
            <Route path='inventaire/EtaDesProduits' element={<EtaProduits />} />
            <Route path='inventaire/VenteUsers' element={<VenteUsers />} />

            <Route element={<ProtectedRoute requiredRole={[1, 2]} redirectPath="/" />}>
              <Route path='detail' element={<EntrepriseDetail />} />
              <Route path='historique' element={<Historique />} />
              <Route path='inventaire/sortie' element={<SortieInventaire />} />
              <Route path='inventaire/entrer' element={<EntrerInventaire />} />
              <Route path='historique/suppression' element={<HistoriqueSupp />} />
            </Route>

            <Route path='depense'>
              <Route index element={<Depense />} />
              <Route path=':uuid' element={<DepenseModif />} />
            </Route>

            <Route path='personnel' >
              <Route element={<ProtectedRoute requiredRole={1} redirectPath="/" />}>
                <Route index element={<Personnel />} />
                <Route path='modif/:uuid' element={<PersonnelModif />} />
                <Route path='info/:uuid' element={<PersonnelInfo />} />
              </Route>
            </Route>

            <Route path='produit'>
              <Route element={<ProtectedRoute requiredRole={[1, 2]} redirectPath="/" />}>
                <Route path='entre'>
                  <Route index element={<FacEntre />} />
                  <Route path='modif/:uuid' element={<ModifProduitEntre />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute requiredRole={[1, 2, 3]} redirectPath="/" />}>
                <Route path='sortie'>
                  <Route index element={<FacSortie />} />
                  <Route path='modif/:uuid' element={<ModifProduitSortie />} />
                </Route>
              </Route>

              <Route path='modif/:slug' element={<ModifEntre />} />
            </Route>

            <Route path='client' >
              <Route index element={<Client />} />
              <Route path='info/:uuid' element={<ClientInfo />} />
            </Route>

            <Route path='utilisateur'>
              <Route element={<ProtectedRoute requiredRole={1} redirectPath="/" />}>
                <Route path="admin" element={<Users />} />
                <Route path='admin/modif/:uuid' element={<UserModif />} />
              </Route>
              <Route path='modif/:uuid' element={<Admin />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute requiredRole={[1, 2]} redirectPath="/" />}>
            <Route path='categorie' >
              <Route index element={<CatalogueUnifie />} />
              <Route path='cartes' element={<ComponentShadow />} />
              <Route path='modif/:uuid' element={<ModifCate />} />

              <Route path='sous'>
                <Route path=':uuid' element={<SousCat />} />
                <Route path='modif/:uuid' element={<ModifSousCate />} />
              </Route>

              <Route path='info/:uuid' element={<Info />} />
            </Route>
          </Route>

          {/* ── Routes cibles unifiées (alias vers l'architecture §2) ── */}
          <Route path='ventes'>
            <Route path='caisse' element={<Navigate to="/sortie" replace />} />
            <Route path='factures' element={<Navigate to="/entreprise/produit/sortie" replace />} />
            <Route path='proforma' element={<Navigate to="/entreprise/PreFacture" replace />} />
            <Route path='clients' element={<Navigate to="/entreprise/client" replace />} />
          </Route>

          <Route path='stock'>
            <Route path='catalogue' element={<Navigate to="/categorie" replace />} />
            <Route path='appro' element={<Navigate to="/entre" replace />} />
            <Route path='factures' element={<Navigate to="/entreprise/produit/entre" replace />} />
            <Route path='mouvements' element={<Navigate to="/entreprise/historique" replace />} />
          </Route>

          <Route path='finances'>
            <Route path='depenses' element={<Navigate to="/entreprise/depense" replace />} />
            <Route path='rapports' element={<Navigate to="/entreprise/EtaDeVente" replace />} />
          </Route>

          <Route path='admin'>
            <Route path='entreprise' element={<Navigate to="/entreprise/detail" replace />} />
            <Route path='personnel' element={<Navigate to="/entreprise/personnel" replace />} />
            <Route path='utilisateurs' element={<Navigate to="/user/admin" replace />} />
            <Route path='journal' element={<Navigate to="/entreprise/historique" replace />} />
          </Route>

          <Route path='entre'>
            <Route index element={<Entre />} />
            <Route path='modif/:uuid' element={<ModifEntre />} />
          </Route>

          <Route path='sortie' >
            <Route index element={<Sortie />} />

            <Route path='remise' element={<FactureDetail />} />
            <Route path='entreprise/:uuid' element={<Sortie />} />
            {/* <Route path='entreprise' element={<EseSortie />} /> */}
            <Route path='modif/:uuid' element={<ModifSortie />} />
          </Route>

          <Route path='user'>

            <Route path="avis" element={<Avis />} />

            <Route element={<ProtectedRoute requiredRole={1} redirectPath="/" />}>
              <Route path="admin" element={<Users />} />
            </Route>

            <Route path="mesInscrit" element={<MesInscrit />} />
            <Route path='admin/modif/:uuid' element={<UserModif />} />

            <Route path='modif/:id' element={<Admin />} />
          </Route>

          <Route path='*' element={<NotFound />} />

        </Route>
      </Routes>
    </Box>
  )
}
